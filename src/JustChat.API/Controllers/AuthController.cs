using JustChat.API.Extensions;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.Identity;
using JustChat.Contracts.Requests.Identity;
using JustChat.Infrastructure.Constants;
using JustChat.Infrastructure.Interfaces.Services.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JustChat.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[AllowAnonymous]
public class AuthController(
    IAccountService accountService,
    IRefreshTokenCookieWriter refreshTokenCookieWriter
    ) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest request, CancellationToken ct)
    {
        var result = await accountService.LoginAsync(request, ct);

        return result.Match(
            data =>
            {
                refreshTokenCookieWriter.Set(data.RefreshToken);

                return Ok(data.AccessToken);
            },
            error => error.CreateErrorResponse());
    }

    [HttpPost("login-google")]
    public async Task<IActionResult> LoginWithGoogle([FromBody] GoogleLoginRequest request, CancellationToken ct)
    {
        var result = await accountService.LoginWithGoogleAsync(request, ct);

        return result.Match(
            data =>
            {
                refreshTokenCookieWriter.Set(data.RefreshToken);

                return Ok(data.AccessToken);
            },
            error => error.CreateErrorResponse());
    }

    /// <summary>
    /// Clears the refresh cookie and revokes the token when present. Missing cookie returns <c>TokenMissing</c> without deleting the cookie again (idempotent from the client perspective).
    /// </summary>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var refreshTokenValue = Request.Cookies[CookieNames.RefreshToken];

        if (string.IsNullOrEmpty(refreshTokenValue))
            return UserErrors.TokenMissing.CreateErrorResponse();

        var result = await accountService.LogoutAsync(refreshTokenValue, ct);

        refreshTokenCookieWriter.Delete();

        return result.Match(
            () => Ok(),
            error => error.CreateErrorResponse());
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var refreshTokenValue = Request.Cookies[CookieNames.RefreshToken];

        if (string.IsNullOrEmpty(refreshTokenValue))
            return UserErrors.TokenMissing.CreateErrorResponse();

        var result = await accountService.RefreshTokenAsync(refreshTokenValue, ct);

        return result.Match(
            data =>
            {
                refreshTokenCookieWriter.Set(data.RefreshToken);

                return Ok(data.AccessToken);
            },
            error =>
            {
                refreshTokenCookieWriter.Delete();

                return error.CreateErrorResponse();
            });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegisterRequest request, CancellationToken ct)
    {
        var result = await accountService.RegisterAsync(request, ct);

        return result.Match(
            data =>
            {
                refreshTokenCookieWriter.Set(data.RefreshToken);

                return Ok(data.AccessToken);
            },
            error => error.CreateErrorResponse()
        );
    }
}
