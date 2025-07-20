using ShipmentService.Domain.Entity;

namespace ShipmentService.Dtos.ShipmentsDtos
{
    public class CreateShipmentStatusHistoryDto
    {
        public int ShipmentId { get; set; }
        public ShipmentStatus Status { get; set; }
    }
}
