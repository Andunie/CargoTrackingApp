namespace TrackingService.Services
{
    public class ShipmentStatusUpdaterService : IShipmentStatusUpdaterService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ShipmentStatusUpdaterService> _logger;
        private const string ShipmentServiceBaseUrl = "http://shipment-api:8081";

        public ShipmentStatusUpdaterService(HttpClient httpClient, ILogger<ShipmentStatusUpdaterService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task UpdateShipmentStatusAsync(int shipmentId, int newStatus)
        {
            var response = await _httpClient.PutAsJsonAsync(
                $"{ShipmentServiceBaseUrl}/api/shipments/{shipmentId}/status",
                new { status = newStatus });

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("✅ Shipment status updated: ShipmentId={ShipmentId}, NewStatus={Status}", shipmentId, newStatus);
            }
            else
            {
                _logger.LogError("❌ Failed to update shipment status: ShipmentId={ShipmentId}, StatusCode={StatusCode}", shipmentId, response.StatusCode);
            }
        }
    }
}
