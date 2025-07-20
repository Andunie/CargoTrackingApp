using CargoTracking.Shared.Models.Shipment;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using System.Text.Json;
using TrackingService.Dtos;
using TrackingService.Services;
using TrackingService.Services.Redis;

namespace TrackingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrackingsController : ControllerBase
    {
        private readonly ILocationService _locationService;
        private readonly ILogger<TrackingsController> _logger;
        private readonly IConnectionMultiplexer _redis;
        private readonly LocationCacheService locationCache;
        private readonly IShipmentApiClient _shipmentApiClient;
        private readonly IShipmentEventPublisher _shipmentEventPublisher;
        private readonly IShipmentHistoryApiClient _shipmentHistoryApiClient;

        public TrackingsController(ILocationService locationService, ILogger<TrackingsController> logger, IConnectionMultiplexer redis,
            LocationCacheService locationCache, IShipmentApiClient shipmentApiClient, IShipmentEventPublisher shipmentEventPublisher,
            IShipmentHistoryApiClient shipmentHistoryApiClient)
        {
            _locationService = locationService;
            _logger = logger;
            _redis = redis;
            this.locationCache = locationCache;
            _shipmentApiClient = shipmentApiClient;
            _shipmentEventPublisher = shipmentEventPublisher;
            _shipmentHistoryApiClient = shipmentHistoryApiClient;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var locations = await _locationService.GetShipmentLocationsAsync();
            return Ok(locations);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var location = await _locationService.GetByShipmentLocationIdAsync(id);
            if (location == null)
                return NotFound();

            return Ok(location);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateShipmentLocationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _locationService.AddShipmentLocationAsync(dto);
            return CreatedAtAction("", dto);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateShipmentLocationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _locationService.GetByShipmentLocationIdAsync(id);
            if (existing == null)
                return NotFound();

            await _locationService.UpdateShipmentLocationAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _locationService.GetByShipmentLocationIdAsync(id);
            if (existing == null)
                return NotFound();

            await _locationService.RemoveShipmentLocationAsync(id);
            return NoContent();
        }

        [HttpPost("update-location")]
        public async Task<IActionResult> UpdateLocation([FromBody] TrackingMessage message)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // 1. Redis'e konum yayınla
                var subscriber = _redis.GetSubscriber();
                var jsonMessage = JsonSerializer.Serialize(message);
                await subscriber.PublishAsync("tracking_positions", jsonMessage);
                _logger.LogInformation($"✅ Redis'e konum yayınlandı: ShipmentId={message.ShipmentId}");

                // 2. Konum geçmişini ekle
                await _locationService.AddLocationHistoryAsync(message);

                // 3. ShipmentLocation güncelle veya ekle
                var shipmentIdGuid = Guid.TryParse(message.ShipmentId.ToString(), out var guid) ? guid : Guid.Empty;
                var locationDto = new CreateShipmentLocationDto
                {
                    ShipmentId = message.ShipmentId.ToString(),
                    CurrentLocation = $"Lat:{message.Latitude},Lng:{message.Longitude}",
                    Status = "InTransit",
                    Timestamp = DateTime.UtcNow
                };

                var existingLocation = await _locationService.GetByShipmentLocationIdAsync(shipmentIdGuid);
                if (existingLocation != null)
                    await _locationService.UpdateShipmentLocationAsync(shipmentIdGuid, locationDto);
                else
                    await _locationService.AddShipmentLocationAsync(locationDto);

                // 4. Shipment detaylarını al
                var shipment = await _shipmentApiClient.GetShipmentByIdAsync(message.ShipmentId);
                if (shipment == null)
                    return NotFound("Shipment not found");

                // 5. Mesafe kontrolü
                var distance = GeoHelper.CalculateDistance(
                    message.Latitude, message.Longitude,
                    shipment.ReceiverLatitude, shipment.ReceiverLongitude);

                var newStatus = distance < 0.2 ? ShipmentStatus.Delivered : ShipmentStatus.InTransit;

                // 6. Eğer status değiştiyse işlem yap
                if (shipment.Status != newStatus && shipment.Status != ShipmentStatus.Delivered)
                {
                    await _shipmentApiClient.UpdateShipmentStatusAsync(shipment.Id, newStatus);

                    // 7. Status geçmişine ekle
                    await _shipmentHistoryApiClient.AddStatusHistoryAsync(shipment.Id, newStatus.ToString());

                    // 8. Bildirim mesajı hazırla
                    var notificationMessage = newStatus switch
                    {
                        ShipmentStatus.Delivered => "🎉 Kargonuz teslim edildi!",
                        ShipmentStatus.InTransit => distance < 3
                            ? $"📦 Kargonuz dağıtıma çıktı! Teslimat adresine {distance:F1} km uzaklıkta."
                            : $"🚚 Kargonuz yola çıktı! Teslimat adresine {distance:F1} km uzaklıkta.",
                        _ => $"Kargonuzun durumu güncellendi: {newStatus}"
                    };

                    // 9. Bildirim gönder
                    await _shipmentEventPublisher.PublishShipmentStatusChanged(
                        shipment.ReceiverUserId,
                        shipment.Id,
                        notificationMessage);

                    _logger.LogInformation($"📦 ShipmentId {shipment.Id}: {shipment.Status} → {newStatus} | Mesafe: {distance:F2}km");
                }

                return Accepted();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Konum güncellemesi sırasında hata oluştu.");
                return StatusCode(500, "Bir hata oluştu.");
            }
        }

    }
}
