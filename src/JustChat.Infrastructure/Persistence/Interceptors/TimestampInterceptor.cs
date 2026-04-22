using JustChat.Application.Interfaces.Utils;
using JustChat.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace JustChat.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Sets <see cref="IHasTimestamps.UpdatedAt"/> (and <see cref="IHasTimestamps.CreatedAt"/> for new entities) before save.
/// </summary>
public class TimestampInterceptor(IDateTimeProvider dateTimeProvider) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateTimestamps(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct = default)
    {
        UpdateTimestamps(eventData.Context);

        return base.SavingChangesAsync(eventData, result, ct);
    }

    /// <summary>
    /// For <see cref="EntityState.Added"/>, both <c>CreatedAt</c> and <c>UpdatedAt</c> are set so the row has a defined "last changed" time
    /// from insert onward; for <see cref="EntityState.Modified"/>, only <c>UpdatedAt</c> is refreshed.
    /// </summary>
    private void UpdateTimestamps(DbContext? context)
    {
        if (context == null) return;

        var entries = context.ChangeTracker
        .Entries()
        .Where(e => e.Entity is IHasTimestamps &&
                    (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (IHasTimestamps)entry.Entity;
            entity.UpdatedAt = dateTimeProvider.UtcNow;

            if (entry.State == EntityState.Added)
                entity.CreatedAt = dateTimeProvider.UtcNow;
        }
    }
}
