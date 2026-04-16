using JustChat.Infrastructure.Constants;
using Serilog.Context;

namespace JustChat.API.Middleware;

public class CorrelationIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        const string headerName = HttpHeaders.XCorrelationId;

        var correlationId = context.Request.Headers[headerName].FirstOrDefault() ?? Guid.NewGuid().ToString();

        context.Response.Headers[headerName] = correlationId;
        context.Items[headerName] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await next(context);
        }
    }
}
