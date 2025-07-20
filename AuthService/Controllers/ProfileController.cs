using AuthService.Dtos;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly ProfileService _profileService;

        public ProfileController(ProfileService profileService)
        {
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            try
            {
                var profile = await _profileService.GetInformationOfUser(userId);
                return Ok(profile);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "User not found." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving user profile." });
            }
        }

        [HttpPut("{userId}/password")]
        public async Task<IActionResult> UpdatePassword(int userId, [FromBody] PasswordUpdateDto passwordUpdate)
        {
            try
            {
                await _profileService.UpdatePassword(userId, passwordUpdate.CurrentPassword, passwordUpdate.NewPassword);
                return Ok(new { message = "Password updated successfully." });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Current password is incorrect." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "User not found." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while updating the password." });
            }
        }
    }
}