namespace JustChat.Contracts.DTOs.Identity;

public record AuthResultDto(AccessTokenDto AccessToken, RefreshTokenInfoDto RefreshToken);
