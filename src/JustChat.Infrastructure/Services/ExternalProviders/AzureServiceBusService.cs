using Azure.Messaging.ServiceBus;
using JustChat.Application.Interfaces.ExternalProviders;
using JustChat.Contracts.DTOs;
using System.Text.Json;

namespace JustChat.Infrastructure.Services.ExternalProviders;

public class AzureServiceBusService(ServiceBusSender sender) : IMessageBusService
{
    public async Task PublishEmailNotification(EmailNotification notification, CancellationToken ct = default)
    {
        var json = JsonSerializer.Serialize(notification);
        var message = new ServiceBusMessage(json);

        await sender.SendMessageAsync(message, ct);
    }
}
