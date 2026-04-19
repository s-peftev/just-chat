using JustChat.Contracts.DTOs.UserProfile;
using JustChat.Contracts.Enums;

namespace JustChat.Contracts.DTOs.Chat;

public record MessageDto(
    string Text,
    DateTime CreatedAt,
    Sentiment Sentiment,
    UserProfileDetailsDto Sender);
