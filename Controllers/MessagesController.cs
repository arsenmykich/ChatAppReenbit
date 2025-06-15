using ChatApp.Core.Models;
using ChatApp.Core.Models.DTOs;
using ChatApp.Infrastructure.Data;
using ChatApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ChatApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly ChatAppDbContext _context;
        private readonly ISentimentAnalysisService _sentimentService;

        public MessagesController(ChatAppDbContext context, ISentimentAnalysisService sentimentService)
        {
            _context = context;
            _sentimentService = sentimentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMessages(int page = 1, int pageSize = 50)
        {
            try
            {
                var messages = await _context.Messages
                    .Include(m => m.Sender)
                    .OrderByDescending(m => m.Timestamp)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(m => new
                    {
                        m.Id,
                        m.Content,
                        m.Timestamp,
                        m.SentimentScore,
                        m.SentimentLabel,
                        Sender = new
                        {
                            m.Sender.Id,
                            m.Sender.Username
                        }
                    })
                    .ToListAsync();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve messages", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMessage(Guid id)
        {
            try
            {
                var message = await _context.Messages
                    .Include(m => m.Sender)
                    .Where(m => m.Id == id)
                    .Select(m => new
                    {
                        m.Id,
                        m.Content,
                        m.Timestamp,
                        m.SentimentScore,
                        m.SentimentLabel,
                        Sender = new
                        {
                            m.Sender.Id,
                            m.Sender.Username
                        }
                    })
                    .FirstOrDefaultAsync();

                if (message == null)
                {
                    return NotFound(new { error = "Message not found" });
                }

                return Ok(message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve message", details = ex.Message });
            }
        }

        [HttpGet("sentiment-stats")]
        public async Task<IActionResult> GetSentimentStats()
        {
            try
            {
                var stats = await _context.Messages
                    .GroupBy(m => m.SentimentLabel)
                    .Select(g => new
                    {
                        Sentiment = g.Key,
                        Count = g.Count(),
                        Percentage = (double)g.Count() / _context.Messages.Count() * 100
                    })
                    .ToListAsync();

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve sentiment statistics", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Get current user ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { error = "Invalid user token" });
                }

                // Perform sentiment analysis
                var sentimentResult = await _sentimentService.AnalyzeSentimentAsync(request.Content);

                // Create message
                var message = new Message
                {
                    Id = Guid.NewGuid(),
                    SenderId = userId,
                    Content = request.Content,
                    Timestamp = DateTime.UtcNow,
                    SentimentScore = sentimentResult.score,
                    SentimentLabel = sentimentResult.label
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                // Return the created message with sender info
                var createdMessage = await _context.Messages
                    .Include(m => m.Sender)
                    .Where(m => m.Id == message.Id)
                    .Select(m => new
                    {
                        m.Id,
                        m.Content,
                        m.Timestamp,
                        m.SentimentScore,
                        m.SentimentLabel,
                        Sender = new
                        {
                            m.Sender.Id,
                            m.Sender.Username
                        }
                    })
                    .FirstOrDefaultAsync();

                return Created($"/api/messages/{message.Id}", createdMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to send message", details = ex.Message });
            }
        }
    }
} 