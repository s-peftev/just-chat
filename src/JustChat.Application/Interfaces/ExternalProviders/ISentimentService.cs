using JustChat.Application.AppResult;
using JustChat.Contracts.Enums;

namespace JustChat.Application.Interfaces.ExternalProviders;

public interface ISentimentService
{
    Task<Result<Sentiment>> AnalyzeSentimentAsync(string text, CancellationToken ct = default);
}
