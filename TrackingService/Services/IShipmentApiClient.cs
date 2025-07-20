using CargoTracking.Shared.Models.Shipment;
using TrackingService.Dtos;
using ShipmentDto = TrackingService.Dtos.ShipmentDto;

namespace TrackingService.Services
{
    public interface IShipmentApiClient
    {
        Task<ShipmentDto?> GetShipmentByIdAsync(int shipmentId);
        Task UpdateShipmentStatusAsync(int shipmentId, ShipmentStatus newStatus);
    }
}
