using JustChat.Application.AppResult;
using JustChat.Contracts.DTOs.Identity;

namespace JustChat.Application.Interfaces.Identity;

public interface IAppUserService
{
    Task<Result<UserAuthDto>> AuthenticateAsync(string email, string password, CancellationToken ct = default);
    Task<Result<UserAuthDto>> GetUserAuthInfoByIdAsync(string userId, CancellationToken ct = default);
}
