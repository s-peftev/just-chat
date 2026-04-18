namespace JustChat.Contracts.Requests.Identity;

public record UserRegisterRequest(string Email, string Password, string? FirstName, string? LastName);
