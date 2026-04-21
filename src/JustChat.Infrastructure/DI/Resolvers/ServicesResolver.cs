using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.ExternalProviders;
using JustChat.Application.Interfaces.Identity;
using JustChat.Application.Interfaces.Images;
using JustChat.Application.Interfaces.System;
using JustChat.Application.Services.Entities;
using JustChat.Application.Services.Identity;
using JustChat.Infrastructure.Interfaces.Services.Identity;
using JustChat.Infrastructure.Interfaces.Services.System;
using JustChat.Infrastructure.Services.ExternalProviders;
using JustChat.Infrastructure.Services.Identity;
using JustChat.Infrastructure.Services.Images;
using JustChat.Infrastructure.Services.System;
using Microsoft.Extensions.DependencyInjection;

namespace JustChat.Infrastructure.DI.Resolvers;

internal static class ServicesResolver
{
    internal static void AddServices(IServiceCollection services)
    {
        services.AddSingleton<ITokenService, TokenService>();
        services.AddSingleton<IGoogleIdTokenReader, GoogleIdTokenReader>();
        services.AddSingleton<IChatOnlineTracker, ChatOnlineTracker>();
        services.AddSingleton<ISentimentService, AzureSentimentService>();
        services.AddSingleton<IMessageBusService, AzureServiceBusService>();

        services.AddScoped<IAppUserService, AppUserService>();
        services.AddScoped<IRefreshTokenCookieWriter, RefreshTokenCookieWriter>();
        services.AddScoped<IRequestInfoService, RequestInfoService>();
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddScoped<IProfilePhotoImageProcessor, ProfilePhotoImageProcessor>();

        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();
        services.AddScoped<IUserProfileService, UserProfileService>();
        services.AddScoped<IMessageService, MessageService>();
    }
}
