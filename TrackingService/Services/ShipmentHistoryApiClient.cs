
namespace TrackingService.Services
{
    public class ShipmentHistoryApiClient : IShipmentHistoryApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<IShipmentHistoryApiClient> _logger;

        public ShipmentHistoryApiClient(HttpClient httpClient, ILogger<IShipmentHistoryApiClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task AddStatusHistoryAsync(int shipmentId, string status)
        {
            var payload = new
            {
                ShipmentId = shipmentId,
                Status = status
            };

            var response = await _httpClient.PostAsJsonAsync("/api/shipments/status-history", payload);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("❌ Status history kaydedilemedi. StatusCode: {StatusCode}", response.StatusCode);
            }
        }
    }
}
