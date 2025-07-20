using AuthService.Data;
using AuthService.Domain.Entities;
using AuthService.Dtos;
using Microsoft.EntityFrameworkCore;
using BCrypt;
using BCrypt.Net;

namespace AuthService.Services
{
    public class ProfileService
    {
        private readonly UserDbContext _context;

        public ProfileService(UserDbContext context, JwtService jwtService)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<UserDto> GetInformationOfUser(int userId)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("User ID must be a positive integer.", nameof(userId));
            }

            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new UserDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            return user;
        }

        public async Task UpdatePassword(int userId, string currentPassword, string newPassword)
        {
            if (userId <= 0)
                throw new ArgumentException("User ID must be a positive integer.", nameof(userId));

            if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
                throw new ArgumentException("Current and new passwords cannot be empty.", nameof(currentPassword));

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("User not found.");

            // Şifre doğrulama
            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
                throw new UnauthorizedAccessException("Current password is incorrect.");

            // Yeni şifreyi hashleyip güncelle
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}