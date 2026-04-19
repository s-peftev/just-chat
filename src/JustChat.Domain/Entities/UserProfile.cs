using JustChat.Domain.Interfaces;

namespace JustChat.Domain.Entities;

public class UserProfile : IHasTimestamps
{
    public required string UserId { get; init; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Message> Messages { get; set; } = [];
}
