using System.ComponentModel.DataAnnotations;

namespace CargoTracking.Shared.Models.Auth;

public class UserDto
{
    public required int Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
}

public class LoginDto
{
    [Required]
    public required string Username { get; set; }

    [Required]
    public required string Password { get; set; }
}

public class RegisterDto
{
    [Required]
    public required string Username { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }
} 