using ShipmentService.Domain.Entity;
using System.ComponentModel.DataAnnotations;

namespace ShipmentService.Dtos.ShipmentsDtos
{
    public class ShipmentUpdateDto
    {
        [Required]
        [RegularExpression(@"^[A-Z0-9]{6,}$", ErrorMessage = "Tracking number must be at least 6 characters long and contain only uppercase letters and numbers")]
        public required string TrackingNumber { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public required string Sender { get; set; }

        [Required]
        [Range(-90, 90)]
        public double SenderLatitude { get; set; }

        [Required]
        [Range(-180, 180)]
        public double SenderLongitude { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public required string Receiver { get; set; }

        [Required]
        [Range(-90, 90)]
        public double ReceiverLatitude { get; set; }

        [Required]
        [Range(-180, 180)]
        public double ReceiverLongitude { get; set; }

        [Required]
        [StringLength(100)]
        public required string Origin { get; set; }

        [Required]
        [StringLength(100)]
        public required string Destination { get; set; }

        [Required]
        [EnumDataType(typeof(ShipmentStatus))]
        public required string Status { get; set; }
        [Required]
        public required string ReceiverUserId { get; set; }
    }
}
