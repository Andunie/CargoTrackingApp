using System.ComponentModel.DataAnnotations;

namespace AuthService.Dtos
{
    public class PasswordUpdateDto
    {
        [Required]
        public string CurrentPassword { get; set; }
        [Required]
        public string NewPassword { get; set; }
    }
}
