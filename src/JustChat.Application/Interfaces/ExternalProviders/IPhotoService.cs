using JustChat.Application.AppResult;
using JustChat.Contracts.DTOs.UserProfile;

namespace JustChat.Application.Interfaces.ExternalProviders;

public interface IPhotoService
{
    Task<Result<ProfilePhotoDto>> UploadPhotoAsync(Stream fileStream, string fileName, CancellationToken ct = default);
    Task<Result> DeletePhotoAsync(string fileName, CancellationToken ct = default);
}
