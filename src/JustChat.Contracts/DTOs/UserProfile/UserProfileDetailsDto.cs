namespace JustChat.Contracts.DTOs.UserProfile;

public record UserProfileDetailsDto(
    string UserId, 
    string Email,
    string? FirstName,
    string? LastName,
    string? ProfilePhotoUrl);
