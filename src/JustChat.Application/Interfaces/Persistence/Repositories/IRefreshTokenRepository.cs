using JustChat.Domain.Entities;

namespace JustChat.Application.Interfaces.Persistence.Repositories;

public interface IRefreshTokenRepository : IRepository<RefreshToken, Guid>
{
    Task<RefreshToken?> GetByTokenValueAsync(string refreshTokenValue, CancellationToken ct = default);
}
