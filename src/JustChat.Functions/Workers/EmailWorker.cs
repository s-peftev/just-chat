using Azure.Communication.Email;
using JustChat.Contracts.DTOs;
using JustChat.Functions.Constants;
using JustChat.Functions.Interfaces;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JustChat.Functions.Workers;

public class EmailWorker(
        EmailClient emailClient,
        IConfiguration config,
        IEnumerable<IEmailStrategy> strategies,
        ILogger<EmailWorker> logger)
{
    private readonly EmailClient _emailClient = emailClient;
    private readonly string _senderEmail = config[WorkerConfig.SenderEmail]!;
    private readonly IEnumerable<IEmailStrategy> _strategies = strategies;
    private readonly ILogger<EmailWorker> _logger = logger;

    [Function("SendEmail")]
    public async Task Run([ServiceBusTrigger(WorkerConfig.EmailQueueName, Connection = WorkerConfig.ServiceBusConnection)] EmailNotification msg)
    {
        try
        {
            var strategy = _strategies.FirstOrDefault(s => s.Type == msg.Type);

            if (strategy == null)
            {
                _logger.LogError("Strategy for EmailType {Type} not found.", msg.Type);

                return;
            }

            var content = strategy.CreateContent(msg);

            var emailMessage = new EmailMessage(_senderEmail, msg.Email, content);

            await _emailClient.SendAsync(Azure.WaitUntil.Completed, emailMessage);

            _logger.LogInformation("Email of type {Type} sent to {Recipient}", msg.Type, msg.Email);
        }
        catch (Exception ex)
        {
            // Suppress the exception to prevent Service Bus from retrying and avoid triggering ACS throttling (429)
            _logger.LogError(ex, "Permanent error for {Recipient}", msg.Email);
        }
    }
}
