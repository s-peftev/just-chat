using JustChat.Application.Constants.ErrorIDs;
using JustChat.Contracts.Enums;

namespace JustChat.Application.AppResult.Errors;

public static class UserProfileErrors
{
    public static readonly Error UserProfileNotFound = new(
        UserProfileErrorIDs.UserProfileNotFound,
        ErrorType.NotFound);

    public static readonly Error InvalidProfilePhoto = new(
        UserProfileErrorIDs.InvalidProfilePhoto,
        ErrorType.Validation);

    public static readonly Error ProfilePhotoProcessingFailed = new(
        UserProfileErrorIDs.ProfilePhotoProcessingFailed,
        ErrorType.InternalServerError);

    public static readonly Error ProfilePhotoUploadFailed = new(
        UserProfileErrorIDs.ProfilePhotoUploadFailed,
        ErrorType.ServiceUnavailable);

    public static readonly Error ProfilePhotoDeleteFailed = new(
        UserProfileErrorIDs.ProfilePhotoDeleteFailed,
        ErrorType.ServiceUnavailable);
}
