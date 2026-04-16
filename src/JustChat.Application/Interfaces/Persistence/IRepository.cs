namespace JustChat.Application.Interfaces.Persistence;

public interface IRepository<TEntity, TKey>
        where TEntity : class
{
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken ct = default);
    TEntity Add(TEntity entity);
    TEntity Update(TEntity entity);
    Task<bool> RemoveAsync(TKey id, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
