using FluentValidation;
using JustChat.Application.Validators;
using JustChat.Infrastructure.Constants;
using JustChat.Infrastructure.DI.Resolvers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JustChat.Infrastructure.DI;

public static class ResolveDI
{
    public static void AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DB connection string is not configured.");

        services.AddHttpContextAccessor();

        ConfigurationResolver.AddConfigurationServices(services, configuration);
        PersistenceResolver.AddPersistence(services, connectionString);
        IdentityResolver.AddIdentityServices(services, configuration);
        UtilsResolver.AddUtils(services);
        ServicesResolver.AddServices(services);

        ValidatorOptions.Global.LanguageManager.Enabled = false;
        ValidatorsRegistration.RegisterValidators(services);
    }

    public static void ConfigureCorsPolicy(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetSection("Frontend:Url").Value
            ?? throw new InvalidOperationException("FrontEnd Url is not configured.");

        services.AddCors(options =>
        {
            options.AddPolicy(Policies.DefaultCorsPolicy, policy =>
            {
                policy.WithOrigins(allowedOrigins!)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });
    }
}
