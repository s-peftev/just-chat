using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.Images;
using JustChat.Application.Options;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace JustChat.Infrastructure.Services.Images;

public class ProfilePhotoImageProcessor(
    IOptions<ProfilePhotoProcessingOptions> options
    ) : IProfilePhotoImageProcessor
{
    public async Task<Result<MemoryStream>> ProcessAsync(Stream source, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(source);

        var opts = options.Value;

        try
        {
            await using var buffer = new MemoryStream();
            await source.CopyToAsync(buffer, ct);

            if (buffer.Length == 0)
                return Result<MemoryStream>.Failure(UserProfileErrors.InvalidProfilePhoto);

            buffer.Position = 0;

            using var image = await Image.LoadAsync(buffer, ct);

            image.Mutate(ctx => ctx.Resize(new ResizeOptions
            {
                Size = new Size(opts.OutputWidth, opts.OutputHeight),
                Mode = ResizeMode.Crop,
                Position = AnchorPositionMode.Center,
            }));

            var output = new MemoryStream();
            var encoder = new WebpEncoder { Quality = opts.WebpQuality };
            await image.SaveAsync(output, encoder, ct);
            output.Position = 0;

            return Result<MemoryStream>.Success(output);
        }
        catch (UnknownImageFormatException)
        {
            return Result<MemoryStream>.Failure(UserProfileErrors.InvalidProfilePhoto);
        }
        catch (InvalidImageContentException)
        {
            return Result<MemoryStream>.Failure(UserProfileErrors.InvalidProfilePhoto);
        }
        catch (ImageProcessingException)
        {
            return Result<MemoryStream>.Failure(UserProfileErrors.InvalidProfilePhoto);
        }
        catch (Exception)
        {
            return Result<MemoryStream>.Failure(UserProfileErrors.ProfilePhotoProcessingFailed);
        }
    }
}
