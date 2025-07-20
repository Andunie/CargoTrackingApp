namespace TrackingService.Dtos
{
    public class LocationUpdatedMessage
    {
        public int ShipmentId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
