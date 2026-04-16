using JustChat.Contracts.DTOs.Identity;

namespace JustChat.Infrastructure.Interfaces.Services.Identity;

public interface IRefreshTokenCookieWriter
{
    void Set(RefreshTokenInfoDto dto);
    void Delete();
}
