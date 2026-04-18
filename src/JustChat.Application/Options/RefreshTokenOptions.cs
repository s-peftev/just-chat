namespace JustChat.Application.Options;

public class RefreshTokenOptions
{
    public const string RefreshTokenOptionsKey = "RefreshTokenOptions";

    public required int ExpirationTimeInDays { get; set; }
    public required int RotationThresholdDays { get; set; }
}
