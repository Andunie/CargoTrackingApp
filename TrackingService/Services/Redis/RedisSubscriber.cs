// TrackingService/Services/Redis/RedisSubscriber.cs

using StackExchange.Redis;
using System.Text.Json;
using TrackingService.Dtos;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.SignalR; // SignalR için eklendi
using TrackingService.Hubs;          // Hub sınıfımız için eklendi

namespace TrackingService.Services.Redis
{
    public class RedisSubscriber : BackgroundService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly LocationCacheService _locationCache;
        private readonly ILogger<RedisSubscriber> _logger;
        private readonly IHubContext<TrackingHub> _hubContext; // SignalR Hub Context'i eklendi

        public RedisSubscriber(
            IConnectionMultiplexer redis,
            LocationCacheService locationCache,
            ILogger<RedisSubscriber> logger,
            IHubContext<TrackingHub> hubContext) // DI ile Hub Context'i alıyoruz
        {
            _redis = redis;
            _locationCache = locationCache;
            _logger = logger;
            _hubContext = hubContext; // Eklendi
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var sub = _redis.GetSubscriber();

            await sub.SubscribeAsync("tracking_positions", async (channel, message) =>
            {
                try
                {
                    var data = JsonSerializer.Deserialize<TrackingMessage>(message!);
                    if (data != null)
                    {
                        _logger.LogInformation($"📍 Yeni konum: ShipmentId={data.ShipmentId}, Lat={data.Latitude}, Lng={data.Longitude}");
                        await _locationCache.SetLastLocationAsync(data.ShipmentId, data.Latitude, data.Longitude);

                        var locationUpdateMessage = new LocationUpdatedMessage
                        {
                            ShipmentId = data.ShipmentId,
                            Latitude = data.Latitude,
                            Longitude = data.Longitude,
                            UpdatedAt = DateTime.UtcNow
                        };

                        // İlgili kargonun grubuna ("shipment_123" gibi) mesajı gönderiyoruz.
                        string groupName = $"shipment_{data.ShipmentId}";
                        await _hubContext.Clients.Group(groupName)
                                         .SendAsync("ReceiveLocationUpdate", locationUpdateMessage, stoppingToken);

                        _logger.LogInformation($"📡 SignalR -> İstemcilere gönderildi: Grup={groupName}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Redis mesajı işlenirken hata oluştu.");
                }
            });

            // stoppingToken iptal edilene kadar bekler.
            await Task.WhenAny(Task.Delay(-1, stoppingToken));
        }
    }
}