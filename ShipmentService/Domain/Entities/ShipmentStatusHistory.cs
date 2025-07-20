using ShipmentService.Domain.Entity;

namespace ShipmentService.Domain.Entities
{
    public class ShipmentStatusHistory
    {
        public int Id { get; set; }
        public int ShipmentId { get; set; }
        public ShipmentStatus Status { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    }
}
