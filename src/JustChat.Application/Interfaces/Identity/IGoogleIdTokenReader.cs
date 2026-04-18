using JustChat.Application.AppResult;
using JustChat.Contracts.DTOs.Identity;

namespace JustChat.Application.Interfaces.Identity;

public interface IGoogleIdTokenReader
{
    Task<Result<GoogleIdTokenPayload>> ValidateAndReadAsync(string idToken, CancellationToken ct = default);
}
