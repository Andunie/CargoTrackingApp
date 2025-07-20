using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;
using TrackingService.Hubs;

namespace TrackingService.Services.Redis
{
    public class ShipmentEventConsumer : BackgroundService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<ShipmentEventConsumer> _logger;
        private readonly IDatabase _db;
        private readonly IHubContext<TrackingHub> _hubContext;
        private const string StreamKey = "shipment_events";
        private const string ConsumerGroup = "tracking_group";
        private const string ConsumerName = "tracking_consumer";

        public ShipmentEventConsumer(IConnectionMultiplexer redis, ILogger<ShipmentEventConsumer> logger, IHubContext<TrackingHub> hubContext)
        {
            _redis = redis;
            _logger = logger;
            _db = _redis.GetDatabase();
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Consumer Group varsa hata fırlatmasın
            try
            {
                await _db.StreamCreateConsumerGroupAsync(StreamKey, ConsumerGroup, "$", true);
                _logger.LogInformation($"✅ Consumer group '{ConsumerGroup}' oluşturuldu.");
            }
            catch (RedisServerException ex) when (ex.Message.Contains("BUSYGROUP"))
            {
                _logger.LogInformation($"ℹ️ Consumer group '{ConsumerGroup}' zaten var.");
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                var entries = await _db.StreamReadGroupAsync(
                    StreamKey,
                    ConsumerGroup,
                    ConsumerName,
                    count: 10,
                    noAck: false);

                foreach (var entry in entries)
                {
                    var eventType = entry["eventType"];
                    var shipmentId = entry["shipmentId"];

                    _logger.LogInformation($"📨 Yeni event alındı: {eventType}, ID: {shipmentId}");

                    if (eventType == "ShipmentCreated")
                    {
                        var sender = entry["sender"];
                        var receiver = entry["receiver"];
                        _logger.LogInformation($"📦 Kargo oluşturuldu: {shipmentId} - {sender} → {receiver}");
                    }
                    else if (eventType == "ShipmentDelivered")
                    {
                        _logger.LogInformation($"✅ Kargo teslim edildi: {shipmentId}");
                        // TODO: Teslimat kaydını işaretle, e-posta gönder, vb.
                    }
                    else if (eventType == "ShipmentStatusChanged")
                    {
                        var newStatusStr = entry["newStatus"];
                        var receiverUserId = entry["receiverUserId"];

                        // 'shipmentIdRaw' adını kullandık, TryParse ile 'parsedShipmentId' değişkeni oluşturduk
                        var shipmentIdRaw = entry["shipmentId"];
                        if (int.TryParse(shipmentIdRaw, out int parsedShipmentId) &&
                            int.TryParse(newStatusStr, out int newStatus))
                        {
                            _logger.LogInformation($"📦 Shipment {parsedShipmentId} status changed to {newStatus}");

                            // SignalR ile shipment grubuna gönder
                            string groupName = $"shipment_{parsedShipmentId}";
                            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveStatusUpdate", new
                            {
                                ShipmentId = parsedShipmentId,
                                NewStatus = newStatus,
                                Timestamp = DateTime.UtcNow
                            });

                            // Receiver'a bireysel mesaj (opsiyonel)
                            if (!string.IsNullOrEmpty(receiverUserId))
                            {
                                await _hubContext.Clients.User(receiverUserId).SendAsync("ReceiveStatusUpdate", new
                                {
                                    ShipmentId = parsedShipmentId,
                                    NewStatus = newStatus,
                                    Timestamp = DateTime.UtcNow
                                });

                                _logger.LogInformation($"🔔 Bildirim Receiver'a gönderildi: UserId={receiverUserId}, Status={newStatus}");
                            }
                        }
                    }

                    await _db.StreamAcknowledgeAsync(StreamKey, ConsumerGroup, entry.Id);
                }

                await Task.Delay(2000, stoppingToken);
            }
        }
    }
}
