using JustChat.Contracts.DTOs;
using Microsoft.EntityFrameworkCore;

namespace JustChat.Infrastructure.Extensions;

public static class QueryableExtensions
{
    /// <summary>
    /// Paginates the given <see cref="IQueryable{TItem}"/> by applying skip and take based on the specified page number and page size.
    /// </summary>
    /// <typeparam name="TItem">The entity type of the query. Must be a class.</typeparam>
    /// <param name="query">The source query to paginate.</param>
    /// <param name="pageNumber">The 1-based page number. Values less than 1 will skip 0 items.</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="ct">Optional <see cref="CancellationToken"/> to cancel the operation.</param>
    /// <returns>
    /// A <see cref="PaginatedResult{TItem}"/> containing the current page, page size, total count of items, and the items for the current page.
    /// </returns>
    public static async Task<PaginatedResult<TItem>> ToPagedAsync<TItem>(this IQueryable<TItem> query, int pageNumber, int pageSize, CancellationToken ct = default)
        where TItem : class
    {
        var totalCount = await query.CountAsync(ct);

        var pagedList = await query
            .AsNoTracking()
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PaginatedResult<TItem>(pageNumber, pageSize, totalCount, pagedList);
    }
}
