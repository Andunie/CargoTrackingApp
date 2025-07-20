using System.ComponentModel.DataAnnotations;

namespace CargoTracking.Shared.Models.Shipment;

public class ShipmentDto
{
    public required string Id { get; set; }
    public required string TrackingNumber { get; set; }
    public required string Status { get; set; }
    public required string Origin { get; set; }
    public required string Destination { get; set; }
    public DateTime EstimatedDeliveryDate { get; set; }
    public required string CurrentLocation { get; set; }
}

public class ShipmentCreateDto
{
    [Required]
    public required string Origin { get; set; }

    [Required]
    public required string Destination { get; set; }

    [Required]
    public DateTime EstimatedDeliveryDate { get; set; }
}

public class ShipmentLocationDto
{
    public required string ShipmentId { get; set; }
    public required string Location { get; set; }
    public DateTime Timestamp { get; set; }
    public required string Status { get; set; }
}

public class ShipmentLocationCreateDto
{
    [Required]
    public required string ShipmentId { get; set; }

    [Required]
    public required string Location { get; set; }

    [Required]
    public required string Status { get; set; }
} 