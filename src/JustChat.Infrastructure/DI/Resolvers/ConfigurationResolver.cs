using JustChat.Application.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JustChat.Infrastructure.DI.Resolvers;

internal static class ConfigurationResolver
{
    internal static void AddConfigurationServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.JwtOptionsKey));
        services.Configure<RefreshTokenOptions>(configuration.GetSection(RefreshTokenOptions.RefreshTokenOptionsKey));
        services.Configure<GoogleAuthOptions>(configuration.GetSection(GoogleAuthOptions.GoogleAuthOptionsKey));
        services.Configure<BlobStorageContainersOptions>(configuration.GetSection(BlobStorageContainersOptions.BlobStorageContainersOptionsKey));
        services.Configure<ProfilePhotoProcessingOptions>(configuration.GetSection(ProfilePhotoProcessingOptions.SectionKey));
        services.Configure<PaginationOptions>(configuration.GetSection(PaginationOptions.PaginationOptionsKey));
    }
}
