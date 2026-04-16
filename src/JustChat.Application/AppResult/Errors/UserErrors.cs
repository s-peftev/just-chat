using JustChat.Application.Constants.ErrorIDs;
using JustChat.Contracts.Enums;

namespace JustChat.Application.AppResult.Errors;

public static class UserErrors
{
    public static readonly Error LoginFailed = new(
        UserErrorIDs.LoginFailed,
        ErrorType.Unauthorized);

    public static readonly Error RefreshTokenInvalid = new(
        UserErrorIDs.RefreshTokenInvalid,
        ErrorType.Unauthorized);

    public static readonly Error TokenMissing = new(
        UserErrorIDs.TokenMissing,
        ErrorType.Unauthorized);
}
