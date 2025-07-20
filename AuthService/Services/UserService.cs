using AuthService.Data;
using AuthService.Domain.Entities;
using AuthService.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class UserService
    {
        private readonly UserDbContext _context;

        public UserService(UserDbContext context)
        {
            _context = context;
        }

        // Admin
        public async Task<List<UserDto>> GetUsersAsync()
        {
            var users = await _context.Users
                .Where(u => u.Role == "User")
                .Select(u => new UserDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role
                }).ToListAsync();

            return users;
        }

        // Admin
        public async Task DeleteUserAsnyc(int id)
        {
            var userToBeDeleted = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (userToBeDeleted == null) 
            {
                throw new Exception("Kullanıcı bulunamadı");
            }

            _context.Users.Remove(userToBeDeleted);
            await _context.SaveChangesAsync();
        }
    }
}
