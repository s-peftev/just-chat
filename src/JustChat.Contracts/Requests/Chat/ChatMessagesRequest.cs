namespace JustChat.Contracts.Requests.Chat;

public record ChatMessagesRequest(DateTime? BeforeTimeStamp) : PaginatedRequest;
