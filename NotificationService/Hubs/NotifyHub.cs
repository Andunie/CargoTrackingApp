using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Hubs
{
    [Authorize]
    public class NotifyHub : Hub
    {
        private readonly ILogger<NotifyHub> _logger;

        public NotifyHub(ILogger<NotifyHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("sub")?.Value ?? Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
                _logger.LogInformation("User {UserId} connected with connection ID {ConnectionId}", userId, Context.ConnectionId);
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst("sub")?.Value ?? Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
                _logger.LogInformation("User {UserId} disconnected with connection ID {ConnectionId}", userId, Context.ConnectionId);
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinShipmentGroup(string shipmentId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"shipment-{shipmentId}");
            _logger.LogInformation("Connection {ConnectionId} joined shipment group {ShipmentId}", Context.ConnectionId, shipmentId);
        }

        public async Task LeaveShipmentGroup(string shipmentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"shipment-{shipmentId}");
            _logger.LogInformation("Connection {ConnectionId} left shipment group {ShipmentId}", Context.ConnectionId, shipmentId);
        }

        public async Task SendNotificationToUser(string userId, string message)
        {
            _logger.LogInformation($"Sending notification to user-{userId}: {message}");
            await Clients.Group($"user-{userId}").SendAsync("ReceiveNotification", message);
        }
    }
} 