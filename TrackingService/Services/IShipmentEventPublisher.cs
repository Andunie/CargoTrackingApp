namespace TrackingService.Services
{
    public interface IShipmentEventPublisher
    {
        Task PublishShipmentStatusChanged(string receiverUserId, int shipmentId, string newStatus);
    }
}
