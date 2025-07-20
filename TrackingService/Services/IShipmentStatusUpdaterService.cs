namespace TrackingService.Services
{
    public interface IShipmentStatusUpdaterService
    {
        Task UpdateShipmentStatusAsync(int shipmentId, int newStatus);
    }
}
