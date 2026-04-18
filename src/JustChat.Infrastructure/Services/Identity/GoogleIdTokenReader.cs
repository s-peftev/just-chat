using Google.Apis.Auth;
using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.Identity;
using JustChat.Application.Options;
using JustChat.Contracts.DTOs.Identity;
using JustChat.Infrastructure.Constants.ExceptionMessages;
using Microsoft.Extensions.Options;

namespace JustChat.Infrastructure.Services.Identity;

public class GoogleIdTokenReader(IOptions<GoogleAuthOptions> options) : IGoogleIdTokenReader
{
    private readonly GoogleAuthOptions _options = options.Value;

    public async Task<Result<GoogleIdTokenPayload>> ValidateAndReadAsync(string idToken, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(idToken))
            return Result<GoogleIdTokenPayload>.Failure(UserErrors.GoogleIdTokenInvalid);

        if (_options.ClientIds is null || _options.ClientIds.Count == 0)
            throw new InvalidOperationException(GoogleAuthExceptionMessages.ClientIdsNotConfigured);

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = _options.ClientIds,
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            if (string.IsNullOrWhiteSpace(payload.Subject) || string.IsNullOrWhiteSpace(payload.Email))
                return Result<GoogleIdTokenPayload>.Failure(UserErrors.GoogleIdTokenInvalid);

            var dto = new GoogleIdTokenPayload(
                payload.Subject,
                payload.Email,
                payload.EmailVerified,
                payload.Name,
                payload.Picture);

            return Result<GoogleIdTokenPayload>.Success(dto);
        }
        catch (InvalidJwtException)
        {
            return Result<GoogleIdTokenPayload>.Failure(UserErrors.GoogleIdTokenInvalid);
        }
    }
}
