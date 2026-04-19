using Azure.Storage.Blobs;
using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.ExternalProviders;
using JustChat.Application.Options;
using JustChat.Contracts.DTOs.UserProfile;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JustChat.Infrastructure.Services.ExternalProviders;

public class PhotoService(
    BlobServiceClient blobServiceClient,
    IOptions<BlobStorageContainersOptions> blobOptions,
    ILogger<PhotoService> logger
    ) : IPhotoService
{
    private readonly BlobContainerClient _containerClient = blobServiceClient.GetBlobContainerClient(blobOptions.Value.ProfilePhotos);

    public async Task<Result<ProfilePhotoDto>> UploadPhotoAsync(Stream fileStream, string fileName, CancellationToken ct = default)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);

        try
        {
            await blobClient.UploadAsync(fileStream, overwrite: true, cancellationToken: ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload photo");

            return Result<ProfilePhotoDto>.Failure(UserProfileErrors.ProfilePhotoUploadFailed);
        }

        return Result<ProfilePhotoDto>.Success(new ProfilePhotoDto(blobClient.Uri.ToString()));
    }

    public async Task<Result> DeletePhotoAsync(string fileName, CancellationToken ct = default)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);

        try
        {
            await blobClient.DeleteIfExistsAsync(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to delete photo");

            return Result.Failure(UserProfileErrors.ProfilePhotoDeleteFailed);
        }

        return Result.Success();
    }
}
