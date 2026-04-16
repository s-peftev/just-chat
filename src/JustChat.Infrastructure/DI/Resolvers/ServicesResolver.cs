using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.Identity;
using JustChat.Application.Interfaces.System;
using JustChat.Application.Services.Entities;
using JustChat.Application.Services.Identity;
using JustChat.Infrastructure.Interfaces.Services.Identity;
using JustChat.Infrastructure.Services.Identity;
using JustChat.Infrastructure.Services.System;
using Microsoft.Extensions.DependencyInjection;

namespace JustChat.Infrastructure.DI.Resolvers;

internal static class ServicesResolver
{
    internal static void AddServices(IServiceCollection services)
    {
        services.AddSingleton<ITokenService, TokenService>();

        services.AddScoped<IAppUserService, AppUserService>();
        services.AddScoped<IRefreshTokenCookieWriter, RefreshTokenCookieWriter>();
        services.AddScoped<IRequestInfoService, RequestInfoService>();

        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();
    }
}
