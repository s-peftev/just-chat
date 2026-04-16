using JustChat.Application.AppResult;
using JustChat.Domain.Entities;

namespace JustChat.Application.Interfaces.Entities;

public interface IRefreshTokenService : IEntityService<RefreshToken, Guid>
{
    Task<Result<RefreshToken>> GetByTokenValueAsync(string refreshTokenValue, CancellationToken ct = default);
}
