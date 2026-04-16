using JustChat.Application.Interfaces.Persistence.Repositories;
using JustChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JustChat.Infrastructure.Persistence.Repositories;

public class RefreshTokenRepository(AppDbContext context)
        : Repository<RefreshToken, Guid>(context), IRefreshTokenRepository
{
    public async Task<RefreshToken?> GetByTokenValueAsync(string refreshTokenValue, CancellationToken ct)
    {
        return await _dbSet.FirstOrDefaultAsync(rt => rt.Token == refreshTokenValue, ct);
    }
}
