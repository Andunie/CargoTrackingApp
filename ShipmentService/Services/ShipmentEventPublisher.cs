using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace ShipmentService.Services;

public interface IShipmentEventPublisher
{
    void PublishShipmentStatusChanged(string userId, int shipmentId, string newStatus);
}

public class ShipmentEventPublisher : IShipmentEventPublisher, IDisposable
{
    private readonly ILogger<ShipmentEventPublisher> _logger;
    private readonly IConnection _connection;
    private readonly IModel _channel;

    public ShipmentEventPublisher(IConfiguration configuration, ILogger<ShipmentEventPublisher> logger)
    {
        _logger = logger;
        try
        {
            var factory = new ConnectionFactory()
            {
                HostName = configuration["RabbitMQ:HostName"],
                Port = int.Parse(configuration["RabbitMQ:Port"]),
                UserName = configuration["RabbitMQ:UserName"],
                Password = configuration["RabbitMQ:Password"]
            };
            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
            _channel.QueueDeclare(queue: "shipment-status-updated",
                                 durable: true,
                                 exclusive: false,
                                 autoDelete: false,
                                 arguments: null);
            _logger.LogInformation("Connected to RabbitMQ and queue 'shipment-status-updated' is declared.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Could not connect to RabbitMQ");
            throw; // Or handle more gracefully
        }
    }

    public void PublishShipmentStatusChanged(string userId, int shipmentId, string newStatus)
    {
        var messageObject = new
        {
            UserId = userId,
            ShipmentId = shipmentId,
            NewStatus = newStatus,
            Message = $"Your shipment (ID: {shipmentId}) status has been updated to: {newStatus}."
        };

        var messageBody = JsonSerializer.Serialize(messageObject);
        var body = Encoding.UTF8.GetBytes(messageBody);

        _channel.BasicPublish(exchange: "",
                             routingKey: "shipment-status-updated",
                             basicProperties: null,
                             body: body);
        
        _logger.LogInformation("Published shipment status changed event for ShipmentId: {ShipmentId}", shipmentId);
    }

    public void Dispose()
    {
        _channel?.Close();
        _connection?.Close();
    }
}
