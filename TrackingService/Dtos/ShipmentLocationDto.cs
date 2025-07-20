namespace TrackingService.Dtos
{
    public class ShipmentLocationDto
    {
        public Guid Id { get; set; }
        public string ShipmentId { get; set; } = string.Empty;
        public string CurrentLocation { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
