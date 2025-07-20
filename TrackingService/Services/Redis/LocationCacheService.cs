using StackExchange.Redis;
using System.Text.Json;

namespace TrackingService.Services.Redis
{
    public class LocationCacheService
    {
        private readonly IDatabase _db;
        private const string KeyPrefix = "shipment:";

        public LocationCacheService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase(); 
        }

        public async Task SetLastLocationAsync(int shipmentId, double latitude, double longitude)
        {
            var key = $"{KeyPrefix}{shipmentId}:location";

            var locationData = new
            {
                Latitude = latitude,
                Longitude = longitude,
                UpdatedAt = DateTime.UtcNow
            };

            string json = JsonSerializer.Serialize(locationData);
            await _db.StringSetAsync(key, json);
        }

        public async Task<string?> GetLastLocationAsync(int shipmentId)
        {
            var key = $"{KeyPrefix}{shipmentId}:location";
            return await _db.StringGetAsync(key);
        }
    }
}
