namespace JustChat.Contracts.DTOs.Identity;

public record GoogleUserProvisionResultDto(UserAuthDto UserAuth, bool RequiresUserProfile);
