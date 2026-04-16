using JustChat.Application.Interfaces.Utils;
using JustChat.Infrastructure.Utils;
using Microsoft.Extensions.DependencyInjection;

namespace JustChat.Infrastructure.DI.Resolvers;

internal static class UtilsResolver
{
    internal static void AddUtils(IServiceCollection services)
    {
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
    }
}
