using FluentValidation;
using JustChat.Contracts.Requests.UserProfile;
using JustChat.Domain.Constants.Validation;

namespace JustChat.Application.Validators.UserProfile;

public class ProfilePhotoUploadRequestValidator : AbstractValidator<ProfilePhotoUploadRequest>
{
    public ProfilePhotoUploadRequestValidator()
    {
        RuleFor(x => x.File)
            .NotNull().WithMessage("File is required");

        RuleFor(x => x.File.Length)
            .GreaterThan(0).WithMessage("File is empty")
            .LessThanOrEqualTo(ProfilePhotoValidationRules.MaxFileSize)
            .WithMessage($"File size must be <= {ProfilePhotoValidationRules.MaxFileSize / 1024 / 1024} MB");

        RuleFor(x => x.File.ContentType)
            .Must(ct => ProfilePhotoValidationRules.AllowedContentTypes.Contains(ct))
            .WithMessage($"Wrong file type. Allowed types: {string.Join(", ", ProfilePhotoValidationRules.AllowedContentTypes)}");
    }
}
