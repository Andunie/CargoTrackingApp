using StackExchange.Redis;
using System.Text.Json;

namespace TrackingService.Services.Redis
{
    public class RedisShipmentEventPublisher : IShipmentEventPublisher
    {
        private readonly IDatabase _db;
        private const string StreamKey = "shipment_events";

        public RedisShipmentEventPublisher(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        public async Task PublishShipmentStatusChanged(string receiverUserId, int shipmentId, string newStatus)
        {
            var values = new NameValueEntry[]
            {
                new("eventType", "ShipmentStatusChanged"),
                new("shipmentId", shipmentId.ToString()),
                new("newStatus", newStatus),
                new("receiverUserId", receiverUserId)
            };

            await _db.StreamAddAsync(StreamKey, values);
        }
    }
}
