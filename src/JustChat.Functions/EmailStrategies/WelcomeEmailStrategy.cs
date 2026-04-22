using Azure.Communication.Email;
using JustChat.Contracts.DTOs;
using JustChat.Contracts.Enums;
using JustChat.Functions.Interfaces;

namespace JustChat.Functions.EmailStrategies;

public class WelcomeEmailStrategy(ITemplateService templateService) : BaseEmailStrategy
{
    public override EmailType Type => EmailType.Welcome;

    public override EmailContent CreateContent(EmailNotification msg)
    {
        var html = templateService.GetTemplate(this.TemplateName, new Dictionary<string, string>
            {
                { "Email", msg.Email }
            });

        return new EmailContent("Wellcome to JustChat!") { Html = html };
    }
}
