namespace ShipmentService.Dtos.ShipmentLocationsDtos
{
    public class ShipmentWithLocationsDto
    {
        public int Id { get; set; }
        public required string TrackingNumber { get; set; }
        public required string Sender { get; set; }
        public required string Receiver { get; set; }
        public required string Origin { get; set; }
        public required string Destination { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }

        public required List<ShipmentLocationReadDto> LocationUpdates { get; set; }
    }
}
