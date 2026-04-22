using JustChat.Contracts.DTOs.Identity;
using JustChat.Infrastructure.Constants;
using JustChat.Infrastructure.Constants.ExceptionMessages;
using JustChat.Infrastructure.Interfaces.Services.Identity;
using Microsoft.AspNetCore.Http;

namespace JustChat.Infrastructure.Services.Identity;

/// <summary>
/// HttpOnly refresh-token cookie helpers. <see cref="SameSiteMode.None"/> with <c>Secure = true</c> is required for cross-site
/// API calls (SPA on another origin) while still sending the cookie only over HTTPS.
/// </summary>
public class RefreshTokenCookieWriter(IHttpContextAccessor httpContextAccessor) : IRefreshTokenCookieWriter
{
    private HttpContext Context => httpContextAccessor.HttpContext
        ?? throw new InvalidOperationException(HttpContextExceptionMessages.NotAvailable);

    /// <summary>Writes the refresh token with SameSite=None and Secure for cross-origin SPA usage.</summary>
    public void Set(RefreshTokenInfoDto refreshToken)
    {
        Context.Response.Cookies.Append(
            CookieNames.RefreshToken,
            refreshToken.Token,
            new CookieOptions
            {
                HttpOnly = true,
                Expires = refreshToken.ExpiresAtUtc,
                IsEssential = true,
                Secure = true,
                SameSite = SameSiteMode.None
            }
        );
    }

    public void Delete()
    {
        Context.Response.Cookies.Delete(CookieNames.RefreshToken);
    }
}
