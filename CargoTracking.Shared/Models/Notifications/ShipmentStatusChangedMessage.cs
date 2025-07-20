namespace CargoTracking.Shared.Models.Notifications
{
    public class ShipmentStatusChangedMessage
    {
        public string UserId { get; set; }
        public int ShipmentId { get; set; }
        public string Message { get; set; }
        public string NewStatus { get; set; }
    }
} 