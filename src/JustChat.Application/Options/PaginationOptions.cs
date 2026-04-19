namespace JustChat.Application.Options;

public class PaginationOptions
{
    public const string PaginationOptionsKey = "PaginationOptions";

    public int DefaultPageNumber { get; set; }
    public int DefaultPageSize { get; set; }
    public int MaxPageSize { get; set; }
}
