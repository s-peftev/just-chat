using JustChat.Application.Interfaces.Persistence;
using JustChat.Application.Interfaces.Persistence.Repositories;
using JustChat.Infrastructure.Persistence;
using JustChat.Infrastructure.Persistence.Interceptors;
using JustChat.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace JustChat.Infrastructure.DI.Resolvers;

internal static class PersistenceResolver
{
    internal static void AddPersistence(IServiceCollection services, string connectionString)
    {
        services.AddScoped<TimestampInterceptor>();

        services.AddDbContext<AppDbContext>((provider, options) =>
        {
            var interceptor = provider.GetRequiredService<TimestampInterceptor>();

            options
                .UseSqlServer(connectionString)
                .AddInterceptors(interceptor);
        });

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
    }
}
