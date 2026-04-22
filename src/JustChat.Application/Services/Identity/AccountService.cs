using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.ExternalProviders;
using JustChat.Application.Interfaces.Identity;
using JustChat.Application.Interfaces.Persistence;
using JustChat.Application.Interfaces.System;
using JustChat.Application.Interfaces.Utils;
using JustChat.Application.Options;
using JustChat.Contracts.DTOs;
using JustChat.Contracts.DTOs.Identity;
using JustChat.Contracts.Enums;
using JustChat.Contracts.Requests.Identity;
using JustChat.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JustChat.Application.Services.Identity;

public class AccountService(
    IAppUserService appUserService,
    ITokenService tokenService,
    IMessageBusService messageBusService,
    IGoogleIdTokenReader googleIdTokenReader,
    IOptions<RefreshTokenOptions> refreshTokenOptions,
    IRequestInfoService requestInfoService,
    IDateTimeProvider dateTimeProvider,
    IRefreshTokenService refreshTokenService,
    IUserProfileService userProfileService,
    IUnitOfWork unitOfWork,
    ILogger<AccountService> logger 
    ) : IAccountService
{
    public async Task<Result<AuthResultDto>> LoginAsync(UserLoginRequest request, CancellationToken ct = default)
    {
        var authResult = await appUserService.AuthenticateAsync(request.Email, request.Password, ct);

        if (!authResult.IsSuccess)
            return Result<AuthResultDto>.Failure(UserErrors.LoginFailed);

        return await AuthenticateUserAsync(authResult.Value, ct: ct);
    }

    /// <summary>
    /// Validates the Google ID token, provisions or links the user inside a DB transaction, then optionally creates/updates profile
    /// (including Google <c>picture</c> when the profile has no photo). Publishes welcome email only for brand-new Google users.
    /// </summary>
    public async Task<Result<AuthResultDto>> LoginWithGoogleAsync(GoogleLoginRequest request, CancellationToken ct = default)
    {
        var payloadResult = await googleIdTokenReader.ValidateAndReadAsync(request.IdToken, ct);

        if (!payloadResult.IsSuccess)
            return Result<AuthResultDto>.Failure(payloadResult.Error);

        var payload = payloadResult.Value;

        await unitOfWork.BeginTransactionAsync(ct);

        UserAuthDto? userAuth;
        bool requiresUserProfile;

        try
        {
            var provisionResult = await appUserService.ProvisionGoogleUserAsync(payload, ct);

            if (!provisionResult.IsSuccess)
            {
                await unitOfWork.RollbackTransactionAsync(ct);

                return Result<AuthResultDto>.Failure(provisionResult.Error);
            }

            var provision = provisionResult.Value;
            requiresUserProfile = provision.RequiresUserProfile;

            // Create profile for new users or update existing ones with google profile photo if they don't have one yet
            if (requiresUserProfile)
            {
                var (firstName, lastName) = SplitGoogleDisplayName(payload.Name);
                var profile = userProfileService.AddForNewUser(provision.UserAuth.UserId, firstName, lastName);

                if (!string.IsNullOrWhiteSpace(payload.PictureUri)
                    && string.IsNullOrWhiteSpace(profile.ProfilePhotoUrl))
                {
                    profile.ProfilePhotoUrl = payload.PictureUri;
                }
            }
            else if (!string.IsNullOrWhiteSpace(payload.PictureUri))
            {
                var profile = await userProfileService.GetByIdAsync(provision.UserAuth.UserId, ct);

                if (profile is not null && string.IsNullOrWhiteSpace(profile.ProfilePhotoUrl))
                    profile.ProfilePhotoUrl = payload.PictureUri;
            }

            await unitOfWork.SaveChangesAsync(ct);
            await unitOfWork.CommitTransactionAsync(ct);

            userAuth = provision.UserAuth;
        }
        catch
        {
            await unitOfWork.RollbackTransactionAsync(ct);
            throw;
        }

        if (requiresUserProfile)
        {
            try
            {
                await messageBusService.PublishEmailNotification(new EmailNotification(payload.Email, EmailType.Welcome), ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send welcome email to {Email}", payload.Email);
            }
        }

        return await AuthenticateUserAsync(userAuth!, ct: ct);
    }

    private static (string? FirstName, string? LastName) SplitGoogleDisplayName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return (null, null);

        var parts = name.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        return parts.Length == 1
            ? (parts[0], null)
            : (parts[0], parts[1]);
    }

    public async Task<Result> LogoutAsync(string refreshTokenValue, CancellationToken ct = default)
    {
        var rtResult = await refreshTokenService.GetByTokenValueAsync(refreshTokenValue, ct);

        if (!rtResult.IsSuccess)
            return Result.Success();

        rtResult.Value.IsRevoked = true;
        rtResult.Value.RevokedAtUtc = dateTimeProvider.UtcNow;

        await refreshTokenService.SaveChangesAsync(ct);

        return Result.Success();
    }

    /// <summary>
    /// Returns new tokens when valid. If the refresh token is within <see cref="RefreshTokenOptions.RotationThresholdDays"/> of expiry,
    /// the current token is revoked and a full re-auth issues a new refresh token (rotation); otherwise the same refresh cookie value is returned with a new JWT.
    /// </summary>
    public async Task<Result<AuthResultDto>> RefreshTokenAsync(string refreshTokenValue, CancellationToken ct = default)
    {
        var rtResult = await refreshTokenService.GetByTokenValueAsync(refreshTokenValue, ct);

        if (!rtResult.IsSuccess
            || rtResult.Value.IsRevoked
            || rtResult.Value.ExpiresAtUtc < dateTimeProvider.UtcNow)
        {
            return Result<AuthResultDto>.Failure(UserErrors.RefreshTokenInvalid);
        }

        var refreshToken = rtResult.Value;
        var userAuthDtoResult = await appUserService.GetUserAuthInfoByIdAsync(refreshToken.UserId, ct);

        if (!userAuthDtoResult.IsSuccess)
            return Result<AuthResultDto>.Failure(UserErrors.RefreshTokenInvalid);

        var userAuthDto = userAuthDtoResult.Value;

        if (IsTimeToRotateToken(refreshToken))
        {
            refreshToken.IsRevoked = true;
            refreshToken.RevokedAtUtc = dateTimeProvider.UtcNow;

            await refreshTokenService.SaveChangesAsync(ct);

            return await AuthenticateUserAsync(userAuthDto, refreshToken.SessionId, ct);
        }

        var jwtToken = tokenService.GenerateJwtToken(userAuthDto);

        return Result<AuthResultDto>.Success(BuildAuthResult(jwtToken, refreshToken));
    }

    public async Task<Result<AuthResultDto>> RegisterAsync(UserRegisterRequest request, CancellationToken ct = default)
    {
        var userCheck = await EnsureEmailIsUniqueAsync(request.Email, ct);

        if (!userCheck.IsSuccess)
            return Result<AuthResultDto>.Failure(userCheck.Error);

        await unitOfWork.BeginTransactionAsync(ct);

        UserAuthDto? registeredUser;

        try
        {
            var registerResult = await appUserService.RegisterAppUserAsync(request.Email, request.Password, ct);

            if (!registerResult.IsSuccess)
            {
                await unitOfWork.RollbackTransactionAsync(ct);

                return Result<AuthResultDto>.Failure(registerResult.Error);
            }

            userProfileService.AddForNewUser(registerResult.Value.UserId, request.FirstName, request.LastName);

            await unitOfWork.SaveChangesAsync(ct);
            await unitOfWork.CommitTransactionAsync(ct);

            registeredUser = registerResult.Value;
        }
        catch
        {
            await unitOfWork.RollbackTransactionAsync(ct);
            throw;
        }

        try 
        {
            await messageBusService.PublishEmailNotification(new EmailNotification(registeredUser.Email, EmailType.Welcome), ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send welcome email to {Email}", registeredUser.Email);
        }

        return await AuthenticateUserAsync(registeredUser!, ct: ct);
    }

    private async Task<Result<AuthResultDto>> AuthenticateUserAsync(UserAuthDto userAuthDto, Guid? sessionId = default, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var jwtToken = tokenService.GenerateJwtToken(userAuthDto);

        var refreshTokenGenerationDto = new RefreshTokenGenerationDto(
            userAuthDto.UserId,
            refreshTokenOptions.Value.ExpirationTimeInDays,
            sessionId ?? Guid.NewGuid(),
            requestInfoService.GetUserAgent(),
            requestInfoService.GetIpAddress());

        var refreshToken = tokenService.GenerateRefreshToken(refreshTokenGenerationDto);

        refreshTokenService.Add(refreshToken);

        await refreshTokenService.SaveChangesAsync(ct);

        return Result<AuthResultDto>.Success(BuildAuthResult(jwtToken, refreshToken));
    }

    private static AuthResultDto BuildAuthResult(string jwtToken, RefreshToken refreshToken)
    {
        var accessTokenDto = new AccessTokenDto(jwtToken);
        var refreshTokenInfoDto = new RefreshTokenInfoDto(refreshToken.Token, refreshToken.ExpiresAtUtc);

        return new AuthResultDto(accessTokenDto, refreshTokenInfoDto);
    }

    /// <summary>True when remaining lifetime is below the configured rotation threshold (proactive refresh-token rotation).</summary>
    private bool IsTimeToRotateToken(RefreshToken refreshToken) =>
            (refreshToken.ExpiresAtUtc - dateTimeProvider.UtcNow)
                < TimeSpan.FromDays(refreshTokenOptions.Value.RotationThresholdDays);

    private async Task<Result> EnsureEmailIsUniqueAsync(string email, CancellationToken ct = default)
    {
        var userEmailResult = await appUserService.FindUserByEmailAsync(email, ct);

        if (!string.IsNullOrEmpty(email) && userEmailResult.IsSuccess)
            return Result.Failure(UserErrors.EmailIsTaken);

        return Result.Success();
    }
}
