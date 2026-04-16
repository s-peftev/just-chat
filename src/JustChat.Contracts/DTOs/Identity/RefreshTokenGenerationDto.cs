namespace JustChat.Contracts.DTOs.Identity;

public record RefreshTokenGenerationDto(
    string UserId,
    int ExpirationDays,
    Guid? SessionId,
    string? UserAgent,
    string? IpAddress);
