using JustChat.Application.AppResult;

namespace JustChat.Application.Interfaces.Images;

/// <summary>
/// Resizes and encodes a profile photo for storage (e.g. fixed square WebP).
/// </summary>
public interface IProfilePhotoImageProcessor
{
    /// <summary>
    /// Reads an image from <paramref name="source"/>, processes it, and returns a new stream positioned at 0.
    /// Caller owns the returned <see cref="MemoryStream"/> and must dispose it.
    /// </summary>
    Task<Result<MemoryStream>> ProcessAsync(Stream source, CancellationToken ct = default);
}
