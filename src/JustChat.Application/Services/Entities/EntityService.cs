using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.Persistence;

namespace JustChat.Application.Services.Entities;

public abstract class EntityService<TEntity, TKey>(IRepository<TEntity, TKey> repository) : IEntityService<TEntity, TKey>
    where TEntity : class
{
    public virtual TEntity Add(TEntity entity)
    {
        return repository.Add(entity);
    }

    public virtual TEntity Update(TEntity entity)
    {
        return repository.Update(entity);
    }

    public virtual async Task<Result> RemoveAsync(TKey id, CancellationToken ct = default)
    {
        if (!await repository.RemoveAsync(id, ct))
            return Result.Failure(GeneralErrors.NotFound);

        return Result.Success();
    }

    public virtual async Task<Result<int>> SaveChangesAsync(CancellationToken ct = default)
    {
        var changes = await repository.SaveChangesAsync(ct);

        return Result<int>.Success(changes);
    }
}
