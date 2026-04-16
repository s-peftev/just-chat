using JustChat.Application.AppResult;
using JustChat.Contracts.DTOs.Identity;
using JustChat.Contracts.Requests.Identity;

namespace JustChat.Application.Interfaces.Identity;

public interface IAccountService
{
    Task<Result<AuthResultDto>> LoginAsync(UserLoginRequest request, CancellationToken ct = default);
    Task<Result> LogoutAsync(string refreshTokenValue, CancellationToken ct = default);
    Task<Result<AuthResultDto>> RefreshToken(string refreshTokenValue, CancellationToken ct = default);
}
