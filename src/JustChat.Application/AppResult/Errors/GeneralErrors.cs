using JustChat.Application.Constants.ErrorIDs;
using JustChat.Contracts.Enums;

namespace JustChat.Application.AppResult.Errors;

public static class GeneralErrors
{
    public static readonly Error NotFound = new(
        GeneralErrorIDs.NotFound,
        ErrorType.NotFound);

    public static readonly Error InvalidRequest = new(
        GeneralErrorIDs.InvalidRequest,
        ErrorType.Validation);

    public static readonly Error Unauthorized = new(
        GeneralErrorIDs.Unauthorized,
        ErrorType.Unauthorized);

    public static readonly Error Conflict = new(
        GeneralErrorIDs.Conflict,
        ErrorType.Conflict);

    public static readonly Error BusinessLogicError = new(
        GeneralErrorIDs.BusinessLogicError,
        ErrorType.Business);

    public static readonly Error InternalServerError = new(
        GeneralErrorIDs.InternalServerError,
        ErrorType.InternalServerError);

    public static readonly Error ServiceUnavailable = new(
        GeneralErrorIDs.ServiceUnavailable,
        ErrorType.ServiceUnavailable);

    public static readonly Error Forbidden = new(
        GeneralErrorIDs.Forbidden,
        ErrorType.Forbidden);
}
