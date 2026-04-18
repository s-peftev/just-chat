using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.ExternalProviders;
using JustChat.Application.Interfaces.Images;
using JustChat.Application.Interfaces.Persistence.Repositories;
using JustChat.Contracts.DTOs.UserProfile;
using JustChat.Contracts.Requests.UserProfile;
using JustChat.Domain.Entities;

namespace JustChat.Application.Services.Entities;

public class UserProfileService(
    IUserProfileRepository repository,
    IPhotoService photoService,
    IProfilePhotoImageProcessor profilePhotoImageProcessor
    ) : EntityService<UserProfile, string>(repository), IUserProfileService
{
    public UserProfile AddForNewUser(string userId, string? firstName, string? lastName)
    {
        var profile = new UserProfile
        {
            UserId = userId,
            FirstName = firstName,
            LastName = lastName,
        };

        return Add(profile);
    }

    public async Task<Result> ChangePersonalInfoAsync(string userId, ChangePersonalInfoRequest request, CancellationToken ct = default)
    {
        var userProfile = await GetByIdAsync(userId, ct);

        if (userProfile is null)
            return Result.Failure(GeneralErrors.NotFound);

        userProfile.FirstName = request.FirstName;
        userProfile.LastName = request.LastName;

        await repository.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<ProfilePhotoDto>> UploadProfilePhotoAsync(ProfilePhotoUploadRequest request, string userId, CancellationToken ct = default)
    {
        var userProfile = await GetByIdAsync(userId, ct);

        if (userProfile is null)
            return Result<ProfilePhotoDto>.Failure(UserProfileErrors.UserProfileNotFound);

        await using var inputStream = request.File.OpenReadStream();
        var processed = await profilePhotoImageProcessor.ProcessAsync(inputStream, ct);

        if (!processed.IsSuccess)
            return Result<ProfilePhotoDto>.Failure(processed.Error);

        await using var processedStream = processed.Value;
        processedStream.Position = 0;

        var fileName = $"{userId}.webp";

        var uploadResult = await photoService.UploadPhotoAsync(processedStream, fileName, ct);
        if (!uploadResult.IsSuccess)
            return Result<ProfilePhotoDto>.Failure(uploadResult.Error);

        var dto = uploadResult.Value;

        if (userProfile.ProfilePhotoUrl != dto.ProfilePhotoUrl)
        {
            userProfile.ProfilePhotoUrl = dto.ProfilePhotoUrl;
            await repository.SaveChangesAsync(ct);
        }

        return Result<ProfilePhotoDto>.Success(dto);
    }

    public async Task<Result> DeleteProfilePhotoAsync(string userId, CancellationToken ct = default)
    {
        var userProfile = await GetByIdAsync(userId, ct);

        if (userProfile is null)
            return Result.Failure(UserProfileErrors.UserProfileNotFound);

        var fileName = $"{userId}.webp";

        if (!string.IsNullOrWhiteSpace(userProfile.ProfilePhotoUrl))
        {
            userProfile.ProfilePhotoUrl = null;
            await repository.SaveChangesAsync(ct);
        }

        var deleteResult = await photoService.DeletePhotoAsync(fileName, ct);
        if (!deleteResult.IsSuccess)
            return Result.Failure(deleteResult.Error);

        return Result.Success();
    }
}
