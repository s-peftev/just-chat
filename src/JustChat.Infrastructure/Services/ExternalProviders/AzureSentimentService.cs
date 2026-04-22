using Azure.AI.TextAnalytics;
using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.ExternalProviders;
using JustChat.Contracts.Enums;
using Microsoft.Extensions.Logging;

namespace JustChat.Infrastructure.Services.ExternalProviders;

public class AzureSentimentService(
    TextAnalyticsClient textAnalyticsClient,
    ILogger<AzureSentimentService> logger
    ) : ISentimentService
{
    /// <summary>
    /// Whitespace-only input is treated as <see cref="Sentiment.Neutral"/> without calling Azure. On provider errors, returns
    /// <see cref="GeneralErrors.ServiceUnavailable"/> so callers can degrade gracefully instead of surfacing raw exceptions.
    /// </summary>
    public async Task<Result<Sentiment>> AnalyzeSentimentAsync(string text, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(text)) 
            return Result<Sentiment>.Success(Sentiment.Neutral);

        try
        {
            DocumentSentiment response = await textAnalyticsClient.AnalyzeSentimentAsync(text, cancellationToken: ct);

            return response.Sentiment switch
            {
                TextSentiment.Positive => Result<Sentiment>.Success(Sentiment.Positive),
                TextSentiment.Neutral => Result<Sentiment>.Success(Sentiment.Neutral),
                TextSentiment.Negative => Result<Sentiment>.Success(Sentiment.Negative),
                TextSentiment.Mixed => Result<Sentiment>.Success(Sentiment.Mixed),
                _ => Result<Sentiment>.Success(Sentiment.None)
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to provide sentiment analisys");

            return Result<Sentiment>.Failure(GeneralErrors.ServiceUnavailable);
        }
    }
}
