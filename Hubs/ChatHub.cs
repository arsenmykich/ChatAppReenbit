using ChatApp.Core.Models;
using ChatApp.Infrastructure.Data;
using ChatApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ChatApp.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ChatAppDbContext _context;
        private readonly ISentimentAnalysisService _sentimentAnalysisService;

        public ChatHub(ChatAppDbContext context, ISentimentAnalysisService sentimentAnalysisService)
        {
            _context = context;
            _sentimentAnalysisService = sentimentAnalysisService;
        }

        public async Task SendMessage(string message, string roomId = "general")
        {
            Console.WriteLine($"[ChatHub] *** SENDMESSAGE METHOD CALLED ***");
            Console.WriteLine($"[ChatHub] Parameters: message='{message}', roomId='{roomId}'");
            Console.WriteLine($"[ChatHub] Context.ConnectionId: {Context.ConnectionId}");
            
            try
            {
                // Get authenticated user from JWT token
                var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var usernameClaim = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    await Clients.Caller.SendAsync("Error", "User not authenticated");
                    return;
                }

                Console.WriteLine($"[ChatHub] Authenticated user: {usernameClaim} (ID: {userId})");
                
                // Get user from database
                var sender = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (sender == null)
                {
                    await Clients.Caller.SendAsync("Error", "User not found");
                    return;
                }

                Console.WriteLine($"[ChatHub] Found user: {sender.Username}");

                // Analyze sentiment
                Console.WriteLine($"[ChatHub] Analyzing sentiment for message: {message}");
                var (sentimentScore, sentimentLabel) = await _sentimentAnalysisService.AnalyzeSentimentAsync(message);
                Console.WriteLine($"[ChatHub] Sentiment analysis result: {sentimentLabel} ({sentimentScore})");

                // Create message entity
                var messageEntity = new Message
                {
                    Id = Guid.NewGuid(),
                    SenderId = sender.Id,
                    Content = message,
                    Timestamp = DateTime.UtcNow,
                    SentimentScore = sentimentScore,
                    SentimentLabel = sentimentLabel
                };

                // Save message to database
                Console.WriteLine($"[ChatHub] Saving message to database");
                _context.Messages.Add(messageEntity);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[ChatHub] Message saved successfully");

                // Send message to all clients in the room
                Console.WriteLine($"[ChatHub] Broadcasting message to room: {roomId}");
                var messageData = new
                {
                    User = sender.Username,
                    Message = message,
                    Timestamp = messageEntity.Timestamp,
                    SentimentScore = sentimentScore,
                    SentimentLabel = sentimentLabel,
                    MessageId = messageEntity.Id,
                    SenderId = sender.Id
                };
                Console.WriteLine($"[ChatHub] Broadcasting data: {System.Text.Json.JsonSerializer.Serialize(messageData)}");
                await Clients.Group(roomId).SendAsync("ReceiveMessage", messageData);
                Console.WriteLine($"[ChatHub] Message broadcast completed");
            }
            catch (Exception ex)
            {
                // Log detailed error information
                Console.WriteLine($"[ChatHub] ERROR: {ex.Message}");
                Console.WriteLine($"[ChatHub] STACK TRACE: {ex.StackTrace}");
                Console.WriteLine($"[ChatHub] INNER EXCEPTION: {ex.InnerException?.Message}");
                
                // Send error message to client
                await Clients.Caller.SendAsync("Error", $"Failed to send message: {ex.Message}");
                
                // Re-throw to ensure the client gets the "Failed to invoke" error
                throw;
            }
        }

        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Clients.Group(roomId).SendAsync("UserJoined", $"{Context.ConnectionId} joined {roomId}");
        }

        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            await Clients.Group(roomId).SendAsync("UserLeft", $"{Context.ConnectionId} left {roomId}");
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"[ChatHub] User connected: {Context.ConnectionId}");
            // Join default room
            await Groups.AddToGroupAsync(Context.ConnectionId, "general");
            Console.WriteLine($"[ChatHub] Added {Context.ConnectionId} to group 'general'");
            await Clients.Group("general").SendAsync("UserConnected", $"User {Context.ConnectionId} connected");
            Console.WriteLine($"[ChatHub] Sent UserConnected event to group 'general'");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await Clients.Group("general").SendAsync("UserDisconnected", $"User {Context.ConnectionId} disconnected");
            await base.OnDisconnectedAsync(exception);
        }
    }
} 