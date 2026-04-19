using JustChat.Contracts.Enums;

namespace JustChat.Domain.Entities;

public class Message
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required string Text { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public Sentiment Sentiment { get; init; }

    public required string UserId { get; init; }
    public UserProfile? UserProfile { get; set; }
}
