using System;

namespace ChatApp.Core.Models
{
    public class Message
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public double? SentimentScore { get; set; }
        public string SentimentLabel { get; set; } = string.Empty;
        public virtual User Sender { get; set; } = null!;
    }
} 