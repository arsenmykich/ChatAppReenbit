namespace ChatApp.Core.Models.DTOs
{
    public class UserClaims
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
} 