namespace JustChat.Contracts.DTOs.Identity;

public record GoogleIdTokenPayload(
    string Subject,
    string Email,
    bool EmailVerified,
    string? Name,
    string? PictureUri);
