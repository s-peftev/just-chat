using JustChat.Contracts.DTOs.Identity;
using JustChat.Infrastructure.Constants;
using JustChat.Infrastructure.Constants.ExceptionMessages;
using JustChat.Infrastructure.Interfaces.Services.Identity;
using Microsoft.AspNetCore.Http;

namespace JustChat.Infrastructure.Services.Identity;

public class RefreshTokenCookieWriter(IHttpContextAccessor httpContextAccessor) : IRefreshTokenCookieWriter
{
    private HttpContext Context => httpContextAccessor.HttpContext
        ?? throw new InvalidOperationException(HttpContextExceptionMessages.NotAvailable);

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
