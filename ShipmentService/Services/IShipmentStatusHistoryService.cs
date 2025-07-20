using ShipmentService.Domain.Entities;
using ShipmentService.Dtos.ShipmentsDtos;

namespace ShipmentService.Services
{
    public interface IShipmentStatusHistoryService
    {
        Task AddHistoryAsync(CreateShipmentStatusHistoryDto dto);
        Task<List<ShipmentStatusHistory>> GetHistoryByShipmentIdAsync(int shipmentId);
    }
}
