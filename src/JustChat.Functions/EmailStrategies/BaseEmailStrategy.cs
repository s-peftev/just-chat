using Azure.Communication.Email;
using JustChat.Contracts.DTOs;
using JustChat.Contracts.Enums;
using JustChat.Functions.Interfaces;

namespace JustChat.Functions.EmailStrategies;

public abstract class BaseEmailStrategy : IEmailStrategy
{
    public abstract EmailType Type { get; }
    public string TemplateName => $"{Type}.html";
    public abstract EmailContent CreateContent(EmailNotification msg);
}
