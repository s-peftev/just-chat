namespace JustChat.Infrastructure.Constants.ExceptionMessages;

public static class TokensExceptionMessages
{
    public const string UserIdRequiredForJwt = "UserId is required for JWT generation.";
    public const string UserIdRequiredForRefreshToken = "UserId is required for refresh token generation.";
    public const string ExpirationDaysPositiveRequired = "ExpirationDays must be greater than zero for refresh token generation.";
}
