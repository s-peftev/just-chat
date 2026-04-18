using JustChat.Application.AppResult;
using JustChat.Contracts.DTOs.UserProfile;
using JustChat.Contracts.Requests.UserProfile;
using JustChat.Domain.Entities;

namespace JustChat.Application.Interfaces.Entities;

public interface IUserProfileService : IEntityService<UserProfile, string>
{
    UserProfile AddForNewUser(string userId, string? firstName, string? lastName);
    Task<Result> ChangePersonalInfoAsync(string userId, ChangePersonalInfoRequest request, CancellationToken ct = default);
    Task<Result<ProfilePhotoDto>> UploadProfilePhotoAsync(ProfilePhotoUploadRequest request, string userId, CancellationToken ct = default);
    Task<Result> DeleteProfilePhotoAsync(string userId, CancellationToken ct = default);
}
