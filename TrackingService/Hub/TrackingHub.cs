// TrackingService/Hubs/TrackingHub.cs

using Microsoft.AspNetCore.SignalR;

namespace TrackingService.Hubs
{
    public class TrackingHub : Hub
    {
        private readonly ILogger<TrackingHub> _logger;

        // ILogger, ASP.NET Core tarafından otomatik olarak enjekte edilir.
        public TrackingHub(ILogger<TrackingHub> logger)
        {
            _logger = logger;
        }

        public async Task TrackShipment(string shipmentId)
        {
            if (string.IsNullOrEmpty(shipmentId))
            {
                return;
            }

            string groupName = $"shipment_{shipmentId}";
            _logger.LogInformation($"İstemci {Context.ConnectionId}, '{groupName}' grubuna katılmaya çalışıyor.");

            try
            {
                // YORUM SATIRI KALDIRILDI: Artık istemciyi gruba ekliyoruz.
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                _logger.LogInformation($"✅ İstemci {Context.ConnectionId}, '{groupName}' grubuna başarıyla eklendi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"'{groupName}' grubuna eklenirken HATA oluştu!");
                // Hatanın detayını istemciye fırlat ki React tarafında görebilelim.
                throw;
            }
        }

        public async Task UntrackShipment(string shipmentId)
        {
            if (string.IsNullOrEmpty(shipmentId))
            {
                return;
            }

            string groupName = $"shipment_{shipmentId}";
            _logger.LogInformation($"İstemci {Context.ConnectionId}, '{groupName}' grubundan ayrılmaya çalışıyor.");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}