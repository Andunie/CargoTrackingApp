using System.Text;
using System.Text.Json;
using CargoTracking.Shared.Models.Notifications;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace NotificationService.Consumers;

public class ShipmentStatusConsumer : BackgroundService
{
    private readonly ILogger<ShipmentStatusConsumer> _logger;
    private readonly IHubContext<NotifyHub> _hubContext;
    private IConnection _connection;
    private IModel _channel;

    public ShipmentStatusConsumer(ILogger<ShipmentStatusConsumer> logger, IConfiguration configuration, IHubContext<NotifyHub> hubContext)
    {
        _logger = logger;
        _hubContext = hubContext;

        var factory = new ConnectionFactory()
        {
            HostName = configuration["RabbitMQ:HostName"],
            Port = int.TryParse(configuration["RabbitMQ:Port"], out int port) ? port : 5672,
            UserName = configuration["RabbitMQ:UserName"] ?? "guest",
            Password = configuration["RabbitMQ:Password"] ?? "guest"
        };

        const int maxRetryAttempts = 5;
        const int delaySeconds = 5;

        for (int attempt = 1; attempt <= maxRetryAttempts; attempt++)
        {
            try
            {
                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();
                _logger.LogInformation("✅ Connected to RabbitMQ on attempt {Attempt}.", attempt);
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning("⚠️ RabbitMQ connection attempt {Attempt} failed: {Message}", attempt, ex.Message);
                if (attempt == maxRetryAttempts)
                {
                    _logger.LogError(ex, "❌ Could not connect to RabbitMQ after {MaxAttempts} attempts.", maxRetryAttempts);
                }
                else
                {
                    Thread.Sleep(TimeSpan.FromSeconds(delaySeconds));
                }
            }
        }
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (_channel == null)
        {
            _logger.LogError("❌ RabbitMQ channel is not available. Execution is stopped.");
            return Task.CompletedTask;
        }

        stoppingToken.ThrowIfCancellationRequested();

        _channel.QueueDeclare(queue: "shipment-status-updated",
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null);

        _logger.LogInformation("📦 Queue 'shipment-status-updated' is declared.");

        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var messageJson = Encoding.UTF8.GetString(body);
            _logger.LogInformation("📩 Received message: {Message}", messageJson);

            try
            {
                var message = JsonSerializer.Deserialize<ShipmentStatusChangedMessage>(messageJson);
                if (message != null)
                {
                    var notificationMessage = $"Your shipment (ID: {message.ShipmentId}) status has been updated to: {message.NewStatus}.";
                    await _hubContext.Clients.Group($"user-{message.UserId}").SendAsync("ReceiveNotification", notificationMessage, stoppingToken);
                    _logger.LogInformation("📤 Notification sent to user group user-{UserId}.", message.UserId);
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "❌ Failed to deserialize message.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ An error occurred while processing the message.");
            }
        };

        _channel.BasicConsume(queue: "shipment-status-updated", autoAck: true, consumer: consumer);
        _logger.LogInformation("🔁 Subscribed to the queue 'shipment-status-updated'.");

        return Task.CompletedTask;
    }

    public override void Dispose()
    {
        _channel?.Close();
        _connection?.Close();
        base.Dispose();
    }
}
