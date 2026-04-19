namespace JustChat.Contracts.DTOs;

public class PaginatedResult<T>
{
    public PaginationMetadata Metadata { get; init; } = new PaginationMetadata();
    public IEnumerable<T> Items { get; init; } = [];

    public PaginatedResult(int pageNumber, int pageSize, int totalCount, IEnumerable<T> items)
    {
        Metadata = new PaginationMetadata
        {
            CurrentPage = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        Items = items;
    }

    public PaginatedResult(PaginationMetadata metadata, IEnumerable<T> items)
    {
        Metadata = metadata;

        Items = items;
    }
}

public class PaginationMetadata
{
    public int CurrentPage { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
    public int TotalCount { get; init; }
}
