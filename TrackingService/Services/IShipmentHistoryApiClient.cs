namespace TrackingService.Services
{
    public interface IShipmentHistoryApiClient
    {
        Task AddStatusHistoryAsync(int shipmentId, string status);
    }
}
