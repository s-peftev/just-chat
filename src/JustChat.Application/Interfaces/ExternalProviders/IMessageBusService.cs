using JustChat.Contracts.DTOs;

namespace JustChat.Application.Interfaces.ExternalProviders;

public interface IMessageBusService
{
    public Task PublishEmailNotification(EmailNotification notification, CancellationToken ct = default);
}
