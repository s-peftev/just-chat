using JustChat.Application.AppResult;
using JustChat.Contracts.DTOs.Identity;
using JustChat.Contracts.DTOs.UserProfile;

namespace JustChat.Application.Interfaces.Identity;

public interface IAppUserService
{
    Task<Result<UserAuthDto>> AuthenticateAsync(string email, string password, CancellationToken ct = default);
    Task<Result<UserAuthDto>> RegisterAppUserAsync(string email, string password, CancellationToken ct = default);
    Task<Result<UserAuthDto>> GetUserAuthInfoByIdAsync(string userId, CancellationToken ct = default);
    Task<Result<UserProfileDetailsDto>> GetUserProfileDetailsAsync(string userId, CancellationToken ct = default);
    Task<Result<List<UserProfileDetailsDto>>> GetUserProfileDetailsListAsync(IEnumerable<string> userIdList, CancellationToken ct = default);
    Task<Result> FindUserByEmailAsync(string email, CancellationToken ct = default);
    Task<Result<GoogleUserProvisionResultDto>> ProvisionGoogleUserAsync(GoogleIdTokenPayload payload, CancellationToken ct = default);
}
