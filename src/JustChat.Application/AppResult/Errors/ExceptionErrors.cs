using JustChat.Application.Constants.ErrorIDs;
using JustChat.Contracts.Enums;

namespace JustChat.Application.AppResult.Errors;

public static class ExceptionErrors
{
    public static readonly Error RequestCancelled = new(
        ExceptionErrorIDs.RequestCancelled,
        ErrorType.None);

    public static readonly Error Timeout = new(
        ExceptionErrorIDs.Timeout,
        ErrorType.InternalServerError);
}
