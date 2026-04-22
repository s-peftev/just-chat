using Azure.Identity;
using Azure.Messaging.ServiceBus;
using Azure.Storage.Blobs;
using FluentValidation;
using JustChat.Application.Validators;
using JustChat.Infrastructure.Constants;
using JustChat.Infrastructure.DI.Resolvers;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

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

    public static void ConfigureKeyVault(this WebApplicationBuilder builder)
    {
        var keyVaultUri = builder.Configuration["KeyVaultUri"]
            ?? throw new InvalidOperationException("KeyVaultUri is not configured.");

        var vaultUri = new Uri(keyVaultUri);

        builder.Configuration.AddAzureKeyVault(vaultUri, new DefaultAzureCredential());
    }

    public static void ConfigureBlobStorage(this WebApplicationBuilder builder)
    {
        var blobStorageConnectionString = builder.Configuration.GetConnectionString("BlobStorage")
            ?? throw new InvalidOperationException("Blob Storage connection string is not configured.");
        
        builder.Services.AddSingleton(new BlobServiceClient(blobStorageConnectionString));
    }

    public static void ConfigureTextAnalytics(this WebApplicationBuilder builder)
    {
        var endpoint = builder.Configuration["TextAnalytics:Endpoint"]
            ?? throw new InvalidOperationException("TextAnalytics Endpoint is not configured.");

        builder.Services.AddAzureClients(clientBuilder =>
        {
            clientBuilder.AddTextAnalyticsClient(new Uri(endpoint));

            clientBuilder.ConfigureDefaults(options => options.Retry.MaxRetries = 3);
        });
    }

    public static void AddAzureSignalR(this IServiceCollection services, IConfiguration configuration)
    {
        var signalRConnectionString = configuration.GetConnectionString("AzureSignalR")
            ?? throw new InvalidOperationException("SignalR connection string is not configured.");

        services.AddSignalR().AddAzureSignalR(options =>
        {
            options.ConnectionString = signalRConnectionString;
        });
    }

    public static void AddAzureServiceBus(this IServiceCollection services, IConfiguration configuration)
    {
        var sbConnectionString = configuration.GetConnectionString("ServiceBusConnection")
            ?? throw new InvalidOperationException("ServiceBus connection string is not configured.");

        var emailQueueName = configuration.GetSection("ServiceBusSettings")["EmailQueueName"]
            ?? throw new InvalidOperationException("EmailQueueName is missing in configuration.");

        services.AddSingleton(sp => new ServiceBusClient(sbConnectionString));

        services.AddSingleton(sp =>
        {
            var client = sp.GetRequiredService<ServiceBusClient>();

            return client.CreateSender(emailQueueName);
        });
    }
}
