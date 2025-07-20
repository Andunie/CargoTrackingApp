namespace TrackingService.Dtos
{
    public class ShipmentCreatedMessage
    {
        public int ShipmentId { get; set; }
        public string Sender { get; set; }
        public string Receiver { get; set; }
    }
}
