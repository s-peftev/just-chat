namespace JustChat.Contracts.DTOs.Identity;

public record RefreshTokenInfoDto(string Token, DateTime ExpiresAtUtc);
