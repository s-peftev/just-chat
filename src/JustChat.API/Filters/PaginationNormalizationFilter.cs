using JustChat.Application.Options;
using JustChat.Contracts.Requests;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace JustChat.API.Filters;

public class PaginationNormalizationFilter(IOptions<PaginationOptions> opts) : IActionFilter
{
    private readonly PaginationOptions _opts = opts.Value;

    public void OnActionExecuting(ActionExecutingContext ctx)
    {
        foreach (var arg in ctx.ActionArguments.Values)
        {
            if (arg is PaginatedRequest p)
            {
                p.PageNumber = p.PageNumber <= 0
                    ? _opts.DefaultPageNumber
                    : p.PageNumber;

                p.PageSize = p.PageSize <= 0
                    ? _opts.DefaultPageSize
                    : Math.Min(p.PageSize, _opts.MaxPageSize);
            }
        }
    }

    public void OnActionExecuted(ActionExecutedContext ctx) { }
}
