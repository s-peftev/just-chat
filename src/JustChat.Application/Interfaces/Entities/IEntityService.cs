using JustChat.Application.AppResult;

namespace JustChat.Application.Interfaces.Entities;

public interface IEntityService<TEntity, TKey>
        where TEntity : class
{
    TEntity Add(TEntity entity);
    TEntity Update(TEntity entity);
    Task<Result> RemoveAsync(TKey id, CancellationToken ct = default);
    Task<Result<int>> SaveChangesAsync(CancellationToken ct = default);
}
