using AuthService.Data;
using AuthService.Dtos;
using Microsoft.EntityFrameworkCore;
using System;

namespace AuthService.Services
{
    public class LoginService
    {
        private readonly UserDbContext _context;
        private readonly JwtService _jwtService;

        public LoginService(UserDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<string> LoginAsync(LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Geçersiz kullanıcı adı veya şifre.");

            return _jwtService.GenerateToken(user.Id, user.Username, user.Email, user.Role);
        }
    }
}
