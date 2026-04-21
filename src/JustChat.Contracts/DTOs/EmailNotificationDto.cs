using JustChat.Contracts.Enums;

namespace JustChat.Contracts.DTOs;

public record EmailNotification(
        string Email,
        EmailType Type,
        string? BodyContent = null
    );
