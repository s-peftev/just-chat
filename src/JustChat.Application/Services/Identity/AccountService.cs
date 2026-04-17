using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.Identity;
using JustChat.Application.Interfaces.System;
using JustChat.Application.Interfaces.Utils;
using JustChat.Application.Options;
using JustChat.Contracts.DTOs.Identity;
using JustChat.Contracts.Requests.Identity;
using JustChat.Domain.Entities;
using Microsoft.Extensions.Options;

namespace JustChat.Application.Services.Identity;

public class AccountService(
    IAppUserService appUserService,
    ITokenService tokenService,
    IOptions<RefreshTokenOptions> refreshTokenOptions,
    IRequestInfoService requestInfoService,
    IDateTimeProvider dateTimeProvider,
    IRefreshTokenService refreshTokenService
    ) : IAccountService
{
    public async Task<Result<AuthResultDto>> LoginAsync(UserLoginRequest request, CancellationToken ct = default)
    {
        var authResult = await appUserService.AuthenticateAsync(request.Email, request.Password);

        if (!authResult.IsSuccess)
            return Result<AuthResultDto>.Failure(UserErrors.LoginFailed);

        return await AuthenticateUserAsync(authResult.Value, ct: ct);
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

    public async Task<Result<AuthResultDto>> RefreshToken(string refreshTokenValue, CancellationToken ct = default)
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

    private bool IsTimeToRotateToken(RefreshToken refreshToken) =>
            (refreshToken.ExpiresAtUtc - dateTimeProvider.UtcNow)
                < TimeSpan.FromDays(refreshTokenOptions.Value.RotationThresholdDays);
}
