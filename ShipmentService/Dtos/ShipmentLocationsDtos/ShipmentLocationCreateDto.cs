namespace ShipmentService.Dtos.ShipmentLocationsDtos
{
    public class ShipmentLocationCreateDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime? Timestamp { get; set; }
    }
}
