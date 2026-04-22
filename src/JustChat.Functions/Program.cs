using Azure.Communication.Email;
using JustChat.Functions.Constants;
using JustChat.Functions.Interfaces;
using JustChat.Functions.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Reflection;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices((context, services) =>
    {
        var acsConnectionString = context.Configuration[WorkerConfig.AcsConnectionString];

        var acsOptions = new EmailClientOptions
        {
            Retry =
            {
                Delay = TimeSpan.FromSeconds(2),
                MaxRetries = 3,
                Mode = Azure.Core.RetryMode.Exponential,
                MaxDelay = TimeSpan.FromSeconds(10)
            }
        };
        services.AddSingleton(new EmailClient(acsConnectionString, acsOptions));

        services.AddSingleton<ITemplateService, TemplateService>();

        var strategyTypes = Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => typeof(IEmailStrategy).IsAssignableFrom(t)
                        && !t.IsInterface
                        && !t.IsAbstract);

        foreach (var type in strategyTypes)
        {
            services.AddTransient(typeof(IEmailStrategy), type);
        }
    })
    .Build();

host.Run();
