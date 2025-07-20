namespace TrackingService.Domain.Entities
{
    public class ShipmentLocationHistory
    {
        public Guid Id { get; set; }
        public int ShipmentId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
