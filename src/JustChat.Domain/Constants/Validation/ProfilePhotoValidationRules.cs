namespace JustChat.Domain.Constants.Validation;

public static class ProfilePhotoValidationRules
{
    public const int MaxFileSize = 4 * 1024 * 1024; // 4 MB

    public static readonly string[] AllowedContentTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];
}
