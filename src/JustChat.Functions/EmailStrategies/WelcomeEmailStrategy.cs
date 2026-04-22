using Azure.Communication.Email;
using JustChat.Contracts.DTOs;
using JustChat.Contracts.Enums;
using JustChat.Functions.Interfaces;

namespace JustChat.Functions.EmailStrategies;

/// <summary>
/// Welcome email: loads the embedded HTML template via <see cref="ITemplateService"/> and fills the <c>Email</c> placeholder for the recipient.
/// </summary>
public class WelcomeEmailStrategy(ITemplateService templateService) : BaseEmailStrategy
{
    public override EmailType Type => EmailType.Welcome;

    public override EmailContent CreateContent(EmailNotification msg)
    {
        var html = templateService.GetTemplate(this.TemplateName, new Dictionary<string, string>
            {
                { "Email", msg.Email }
            });

        return new EmailContent("Welcome to JustChat!") { Html = html };
    }
}
