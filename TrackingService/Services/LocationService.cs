using Microsoft.EntityFrameworkCore;
using TrackingService.Data;
using TrackingService.Domain.Entities;
using TrackingService.Dtos;
using CargoTracking.Shared.Models.Shipment;
using ShipmentLocationDto = TrackingService.Dtos.ShipmentLocationDto;

namespace TrackingService.Services
{
    public class LocationService : ILocationService
    {
        private readonly TrackingDbContext _trackingDbContext;
        private readonly ILogger<LocationService> _logger;
        private readonly IShipmentApiClient _shipmentApiClient;
        private const double DELIVERY_THRESHOLD_KM = 15.0; // 15 km teslimat eşiği

        public LocationService(
            TrackingDbContext trackingDbContext, 
            ILogger<LocationService> logger,
            IShipmentApiClient shipmentApiClient)
        {
            _trackingDbContext = trackingDbContext;
            _logger = logger;
            _shipmentApiClient = shipmentApiClient;
        }

        public async Task AddLocationHistoryAsync(TrackingMessage message)
        {
            try
            {
                _logger.LogInformation($"AddLocationHistoryAsync başladı: ShipmentId={message.ShipmentId}, Lat={message.Latitude}, Lng={message.Longitude}");

                // Gelen DTO'yu veritabanı entity'sine dönüştür.
                var historyEntity = new ShipmentLocationHistory
                {
                    Id = Guid.NewGuid(),
                    ShipmentId = message.ShipmentId,
                    Latitude = message.Latitude,
                    Longitude = message.Longitude
                };

                // Entity'yi DbContext'e ekle.
                _trackingDbContext.ShipmentLocationHistories.Add(historyEntity);

                // Teslimat noktasına yakınlık kontrolü
                await CheckAndUpdateDeliveryStatusAsync(message.ShipmentId, message.Latitude, message.Longitude);

                // Değişiklikleri veritabanına kaydet.
                await _trackingDbContext.SaveChangesAsync();

                _logger.LogInformation($"📜 Konum geçmişi kaydedildi: ShipmentId={historyEntity.ShipmentId}, Lat={historyEntity.Latitude}, Lng={historyEntity.Longitude}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Konum geçmişi kaydedilirken hata oluştu: {ex.Message}");
                throw;
            }
        }

        private async Task CheckAndUpdateDeliveryStatusAsync(int shipmentId, double currentLat, double currentLong)
        {
            try
            {
                _logger.LogInformation($"CheckAndUpdateDeliveryStatusAsync başladı: ShipmentId={shipmentId}, CurrentLat={currentLat}, CurrentLong={currentLong}");
                
                var shipment = await _shipmentApiClient.GetShipmentByIdAsync(shipmentId);
                if (shipment == null)
                {
                    _logger.LogWarning($"Kargo bulunamadı: {shipmentId}");
                    return;
                }

                _logger.LogInformation($"Kargo bilgileri alındı: ShipmentId={shipmentId}, ReceiverLat={shipment.ReceiverLatitude}, ReceiverLong={shipment.ReceiverLongitude}, Status={shipment.Status}");

                // Teslimat noktasına olan uzaklığı hesapla
                var distance = GeoHelper.CalculateDistance(
                    currentLat, 
                    currentLong,
                    shipment.ReceiverLatitude,
                    shipment.ReceiverLongitude
                );

                _logger.LogInformation($"Teslimat noktasına uzaklık hesaplandı:");
                _logger.LogInformation($"- Mevcut Konum: ({currentLat}, {currentLong})");
                _logger.LogInformation($"- Hedef Konum: ({shipment.ReceiverLatitude}, {shipment.ReceiverLongitude})");
                _logger.LogInformation($"- Mesafe: {distance:F2} km (Eşik: {DELIVERY_THRESHOLD_KM} km)");

                // Eğer mesafe eşik değerinin altındaysa ve kargo henüz teslim edilmemişse
                if (distance <= DELIVERY_THRESHOLD_KM && shipment.Status != ShipmentStatus.Delivered)
                {
                    _logger.LogInformation($"Kargo teslimat noktasına yakın ({distance:F2} km), durumu güncelleniyor...");
                    await _shipmentApiClient.UpdateShipmentStatusAsync(shipmentId, ShipmentStatus.Delivered);
                    _logger.LogInformation($"Kargo durumu güncellendi: ShipmentId={shipmentId}, YeniDurum=Delivered");
                }
                else
                {
                    if (distance > DELIVERY_THRESHOLD_KM)
                    {
                        _logger.LogInformation($"Durum güncellenmedi: Mesafe ({distance:F2} km) > Eşik ({DELIVERY_THRESHOLD_KM} km)");
                    }
                    else if (shipment.Status == ShipmentStatus.Delivered)
                    {
                        _logger.LogInformation($"Durum güncellenmedi: Kargo zaten teslim edilmiş durumda");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Teslimat durumu kontrolü sırasında hata oluştu");
                throw;
            }
        }

        public async Task AddShipmentLocationAsync(CreateShipmentLocationDto dto)
        {
            var entity = new ShipmentLocation
            {
                Id = Guid.NewGuid(),
                ShipmentId = dto.ShipmentId,
                CurrentLocation = dto.CurrentLocation,
                Status = dto.Status,
                Timestamp = dto.Timestamp,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _trackingDbContext.ShipmentLocations.Add(entity);
            await _trackingDbContext.SaveChangesAsync();

            _logger.LogInformation($"Yeni konum eklendi: {entity.ShipmentId} - {entity.CurrentLocation}");
        }

        public async Task<ShipmentLocationDto?> GetByShipmentLocationIdAsync(Guid id)
        {
            var entity = await _trackingDbContext.ShipmentLocations.FindAsync(id);
            if (entity == null)
                return null;

            return new ShipmentLocationDto
            {
                Id = entity.Id,
                ShipmentId = entity.ShipmentId,
                CurrentLocation = entity.CurrentLocation,
                Status = entity.Status,
                Timestamp = entity.Timestamp,
                Latitude = entity.Latitude,
                Longitude = entity.Longitude
            };
        }

        public async Task<List<ShipmentLocationDto>> GetShipmentLocationsAsync()
        {
            return await _trackingDbContext.ShipmentLocations
                .AsNoTracking()
                .Select(entity => new ShipmentLocationDto
                {
                    Id = entity.Id,
                    ShipmentId = entity.ShipmentId,
                    CurrentLocation = entity.CurrentLocation,
                    Status = entity.Status,
                    Timestamp = entity.Timestamp,
                    Latitude = entity.Latitude,
                    Longitude = entity.Longitude
                })
                .ToListAsync();
        }

        public async Task RemoveShipmentLocationAsync(Guid id)
        {
            var entity = await _trackingDbContext.ShipmentLocations.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Silinecek konum bulunamadı: {id}");
                return;
            }

            _trackingDbContext.ShipmentLocations.Remove(entity);
            await _trackingDbContext.SaveChangesAsync();

            _logger.LogInformation($"Konum silindi: {id}");
        }

        public async Task UpdateShipmentLocationAsync(Guid id, CreateShipmentLocationDto dto)
        {
            var entity = await _trackingDbContext.ShipmentLocations.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Güncellenecek konum bulunamadı: {id}");
                return;
            }

            entity.ShipmentId = dto.ShipmentId;
            entity.CurrentLocation = dto.CurrentLocation;
            entity.Status = dto.Status;
            entity.Timestamp = dto.Timestamp;

            await _trackingDbContext.SaveChangesAsync();

            _logger.LogInformation($"Konum güncellendi: {id}");
        }
    }
}
