using CargoTracking.Shared.Models.Shipment;

namespace TrackingService.Dtos
{
    public class ShipmentDto
    {
        public int Id { get; set; }
        public string ReceiverUserId { get; set; }
        public double ReceiverLatitude { get; set; }
        public double ReceiverLongitude { get; set; }
        public string SenderUserId { get; set; }
        public ShipmentStatus Status { get; set; }
    }
}
