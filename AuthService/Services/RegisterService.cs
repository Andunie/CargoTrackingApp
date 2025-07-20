using AuthService.Data;
using AuthService.Domain.Entities;
using AuthService.Dtos;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class RegisterService
    {
        private readonly UserDbContext _context;
        private readonly JwtService _jwtService;

        public RegisterService(UserDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<string> RegisterAsync(RegisterDto request)
        {
            bool exist = await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email);
            if (exist) 
            {
                throw new Exception("Kullanıcı adı veya e-posta zaten kullanılıyor.");
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                Role = request.Role,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return _jwtService.GenerateToken(user.Id, user.Username, user.Email, user.Role);
        }
    }
}
