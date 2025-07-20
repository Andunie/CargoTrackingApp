using TrackingService.Dtos;

namespace TrackingService.Services
{
    public interface ILocationService
    {
        Task AddShipmentLocationAsync(CreateShipmentLocationDto dto);
        Task UpdateShipmentLocationAsync(Guid id, CreateShipmentLocationDto dto);
        Task RemoveShipmentLocationAsync(Guid id);
        Task<ShipmentLocationDto?> GetByShipmentLocationIdAsync(Guid id);
        Task<List<ShipmentLocationDto>> GetShipmentLocationsAsync();
        Task AddLocationHistoryAsync(TrackingMessage message);

    }
}