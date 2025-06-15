using System.ComponentModel.DataAnnotations;

namespace ChatApp.Core.Models.DTOs
{
    public class AuthRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
} 