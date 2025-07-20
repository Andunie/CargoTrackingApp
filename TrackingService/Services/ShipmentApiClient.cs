using CargoTracking.Shared.Models.Shipment;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TrackingService.Dtos;
using Microsoft.Extensions.Logging;

namespace TrackingService.Services
{
    public class ShipmentApiClient : IShipmentApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ShipmentApiClient> _logger;

        public ShipmentApiClient(HttpClient httpClient, ILogger<ShipmentApiClient> logger)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Dtos.ShipmentDto> GetShipmentByIdAsync(int shipmentId)
        {
            try
            {
                _logger.LogInformation($"GetShipmentByIdAsync başladı: ShipmentId={shipmentId}");
                
                var response = await _httpClient.GetAsync($"api/Shipments/{shipmentId}");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Raw JSON Response: {content}");
                
                var result = JsonSerializer.Deserialize<Dtos.ShipmentDto>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    Converters = { new JsonStringEnumConverter() }
                });

                _logger.LogInformation($"Kargo bilgileri başarıyla alındı: ShipmentId={shipmentId}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Kargo bilgileri alınırken hata oluştu: ShipmentId={shipmentId}");
                throw;
            }
        }

        public async Task UpdateShipmentStatusAsync(int shipmentId, ShipmentStatus status)
        {
            try
            {
                _logger.LogInformation($"UpdateShipmentStatusAsync başladı: ShipmentId={shipmentId}, YeniDurum={status}");
                
                var statusString = $"\"{status}\""; // Add quotes to make it a JSON string
                var content = new StringContent(statusString, System.Text.Encoding.UTF8, "application/json");
                
                _logger.LogInformation($"API'ye gönderilen JSON: {statusString}");
                
                var response = await _httpClient.PutAsync($"api/Shipments/{shipmentId}/status", content);
                
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"API Yanıtı: StatusCode={response.StatusCode}, Content={responseContent}");
                
                response.EnsureSuccessStatusCode();
                
                _logger.LogInformation($"Kargo durumu başarıyla güncellendi: ShipmentId={shipmentId}, YeniDurum={status}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Kargo durumu güncellenirken hata oluştu: ShipmentId={shipmentId}, YeniDurum={status}");
                throw;
            }
        }
    }
}