using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Response;
using Microsoft.AspNetCore.Diagnostics;
using System.Net;

namespace JustChat.API.Handlers;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        var (statusCode, error) = GetExceptionDetails(exception);

        httpContext.Response.StatusCode = (int)statusCode;
        var response = ApiResponse<object>.Fail(error);

        await httpContext.Response.WriteAsJsonAsync(response, ct);

        return true;
    }

    private static (HttpStatusCode statusCode, Error error) GetExceptionDetails(Exception exception)
    {
        return exception switch
        {
            OperationCanceledException _ => (HttpStatusCode.BadRequest, ExceptionErrors.RequestCancelled),
            TimeoutException _ => (HttpStatusCode.RequestTimeout, ExceptionErrors.Timeout),
            _ => (HttpStatusCode.InternalServerError, GeneralErrors.InternalServerError)
        };
    }
}
