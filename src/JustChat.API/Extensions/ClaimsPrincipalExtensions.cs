using System.Security.Claims;

namespace JustChat.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetAppUserId(this ClaimsPrincipal appUser)
    {
        return appUser.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Cannot get appUserId from token");
    }
}
