namespace ShipmentService.Domain.Entity
{
    public class ShipmentLocationUpdate
    {
        public int Id { get; set; }
        public int ShipmentId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
