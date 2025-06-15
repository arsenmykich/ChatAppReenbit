using System;
using System.Threading.Tasks;

namespace ChatApp.Infrastructure.Services
{
    public interface ISentimentAnalysisService
    {
        Task<(double score, string label)> AnalyzeSentimentAsync(string text);
    }

    public class SentimentAnalysisService : ISentimentAnalysisService
    {
        // Mock implementation for demonstration purposes
        // In production, this would use Azure Cognitive Services Text Analytics
        public async Task<(double score, string label)> AnalyzeSentimentAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return (0.5, "Neutral");
            }

            // Simple keyword-based sentiment analysis for demo
            text = text.ToLower();
            
            var positiveWords = new[] { "good", "great", "excellent", "awesome", "love", "happy", "wonderful", "amazing", "fantastic" };
            var negativeWords = new[] { "bad", "terrible", "awful", "hate", "sad", "angry", "horrible", "disgusting", "worst" };
            
            int positiveCount = 0;
            int negativeCount = 0;
            
            foreach (var word in positiveWords)
            {
                if (text.Contains(word))
                    positiveCount++;
            }
            
            foreach (var word in negativeWords)
            {
                if (text.Contains(word))
                    negativeCount++;
            }
            
            // Calculate sentiment score
            double score;
            string label;
            
            if (positiveCount > negativeCount)
            {
                score = 0.7 + (Math.Min(positiveCount - negativeCount, 3) * 0.1);
                label = "Positive";
            }
            else if (negativeCount > positiveCount)
            {
                score = 0.3 - (Math.Min(negativeCount - positiveCount, 3) * 0.1);
                label = "Negative";
            }
            else
            {
                score = 0.5;
                label = "Neutral";
            }
            
            // Simulate async operation
            await Task.Delay(50);
            
            return (Math.Max(0, Math.Min(1, score)), label);
        }
    }
} 