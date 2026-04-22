using FluentValidation;
using JustChat.API.Extensions;
using JustChat.Application.AppResult.Errors;
using Microsoft.AspNetCore.Mvc.Filters;

namespace JustChat.API.Filters;

/// <summary>
/// Runs FluentValidation for each non-null action argument by resolving <c>IValidator&lt;T&gt;</c> from DI,
/// where <c>T</c> is the runtime type of the argument (<see cref="Type.MakeGenericType"/> on <see cref="IValidator{T}"/>).
/// </summary>
public class FluentValidationActionFilter(IServiceProvider serviceProvider)
        : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        CancellationToken ct = context.HttpContext.RequestAborted;

        foreach (var arg in context.ActionArguments.Values)
        {
            if (arg is null)
                continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(arg.GetType());

            if (serviceProvider.GetService(validatorType) is not IValidator validator)
                continue;

            var result = await validator.ValidateAsync(new ValidationContext<object>(arg), ct);

            if (!result.IsValid)
            {
                var error = GeneralErrors.InvalidRequest with
                {
                    Details = result.Errors.Select(e => e.ErrorMessage)
                };

                context.Result = error.CreateErrorResponse();

                return;
            }
        }

        await next();
    }
}
