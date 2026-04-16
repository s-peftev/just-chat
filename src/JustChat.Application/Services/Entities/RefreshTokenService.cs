using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.Persistence.Repositories;
using JustChat.Domain.Entities;

namespace JustChat.Application.Services.Entities;

public class RefreshTokenService(IRefreshTokenRepository repository) : EntityService<RefreshToken, Guid>(repository), IRefreshTokenService
{
    public async Task<Result<RefreshToken>> GetByTokenValueAsync(string refreshTokenValue, CancellationToken ct = default)
    {
        var rt = await repository.GetByTokenValueAsync(refreshTokenValue, ct);

        return rt is null
            ? Result<RefreshToken>.Failure(GeneralErrors.NotFound)
            : Result<RefreshToken>.Success(rt);
    }
}
