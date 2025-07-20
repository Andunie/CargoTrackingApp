namespace ShipmentService.Dtos.ShipmentsDtos
{
    public class GetShipmentByUserIdDto
    {
        public int Id { get; set; }
        public required string TrackingNumber { get; set; }
        public required string Sender { get; set; }
        public double SenderLatitude { get; set; }
        public double SenderLongitude { get; set; }
        public required string Receiver { get; set; }
        public double ReceiverLatitude { get; set; }
        public double ReceiverLongitude { get; set; }
        public required string Origin { get; set; }
        public required string Destination { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }
        public required int SenderUserId { get; set; }
        public required int ReceiverUserId { get; set; }
    }
}
