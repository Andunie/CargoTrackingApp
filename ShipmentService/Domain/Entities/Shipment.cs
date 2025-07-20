using System.ComponentModel.DataAnnotations;

namespace ShipmentService.Domain.Entity
{
    public class Shipment
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
        public DateTime? UpdatedAt { get; set; }
        public ShipmentStatus Status { get; set; }
        public required ICollection<ShipmentLocationUpdate> LocationUpdates { get; set; }
        public required string SenderUserId { get; set; } // Changed to string to match with JWT user id
        public required string ReceiverUserId { get; set; }
    }
}
