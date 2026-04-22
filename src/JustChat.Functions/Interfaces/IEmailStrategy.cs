using Azure.Communication.Email;
using JustChat.Contracts.DTOs;
using JustChat.Contracts.Enums;

namespace JustChat.Functions.Interfaces;

public interface IEmailStrategy
{
    EmailType Type { get; }
    EmailContent CreateContent(EmailNotification msg);
}
