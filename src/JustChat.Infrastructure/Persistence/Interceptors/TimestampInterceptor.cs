using JustChat.Application.Interfaces.Utils;
using JustChat.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace JustChat.Infrastructure.Persistence.Interceptors;

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
