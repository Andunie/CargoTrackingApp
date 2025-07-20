using System.ComponentModel.DataAnnotations;

namespace ShipmentService.Dtos.ShipmentsDtos
{
    public class ShipmentCreateDto
    {
        [Required]
        [RegularExpression(@"^[A-Z0-9]{6,}$", ErrorMessage = "Tracking number must be at least 6 characters long and contain only uppercase letters and numbers")]
        public required string TrackingNumber { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public required string Sender { get; set; }

        [Required]
        [Range(-90, 90, ErrorMessage = "Sender latitude must be between -90 and 90 degrees")]
        public required double SenderLatitude { get; set; }

        [Required]
        [Range(-180, 180, ErrorMessage = "Sender longitude must be between -180 and 180 degrees")]
        public required double SenderLongitude { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public required string Receiver { get; set; }

        [Required]
        [Range(-90, 90, ErrorMessage = "Receiver latitude must be between -90 and 90 degrees")]
        public required double ReceiverLatitude { get; set; }

        [Required]
        [Range(-180, 180, ErrorMessage = "Receiver longitude must be between -180 and 180 degrees")]
        public required double ReceiverLongitude { get; set; }

        [Required]
        [StringLength(100)]
        public required string Origin { get; set; }

        [Required]
        [StringLength(100)]
        public required string Destination { get; set; }
        [Required]
        public required string ReceiverUserId { get; set; }
    }
}
