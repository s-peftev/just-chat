using JustChat.Application.Interfaces.System;
using JustChat.Infrastructure.Constants;
using JustChat.Infrastructure.Constants.ExceptionMessages;
using Microsoft.AspNetCore.Http;

namespace JustChat.Infrastructure.Services.System;

public class RequestInfoService(IHttpContextAccessor httpContextAccessor) : IRequestInfoService
{
    private HttpContext Context => httpContextAccessor.HttpContext
        ?? throw new InvalidOperationException(HttpContextExceptionMessages.NotAvailable);

    public string? GetIpAddress()
    {
        var forwarded = Context.Request.Headers[HttpHeaders.XForwardedFor].FirstOrDefault();

        if (!string.IsNullOrEmpty(forwarded))
            return forwarded.Split(',').First().Trim();

        return Context.Connection.RemoteIpAddress?.ToString();
    }

    public string? GetUserAgent() =>
        Context.Request.Headers[HttpHeaders.UserAgent].FirstOrDefault();
}
