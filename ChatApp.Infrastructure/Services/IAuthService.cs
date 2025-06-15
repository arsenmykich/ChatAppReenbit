using ChatApp.Core.Models.DTOs;

namespace ChatApp.Infrastructure.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> RegisterAsync(RegisterRequest request);
        Task<AuthResponse?> LoginAsync(AuthRequest request);
        Task<UserClaims?> GetUserClaimsFromTokenAsync(string token);
        string GenerateJwtToken(UserClaims userClaims);
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
    }
} 