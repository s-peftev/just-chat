using JustChat.Application.Validators.Identity;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace JustChat.Application.Validators;

public static class ValidatorsRegistration
{
    public static void RegisterValidators(IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<UserLoginRequestValidator>();
    }
}
