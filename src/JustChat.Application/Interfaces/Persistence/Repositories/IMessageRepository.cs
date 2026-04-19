using JustChat.Contracts.DTOs;
using JustChat.Contracts.DTOs.Chat;
using JustChat.Domain.Entities;

namespace JustChat.Application.Interfaces.Persistence.Repositories;

public interface IMessageRepository : IRepository<Message, Guid>
{
    Task<PaginatedResult<MessageDto>> GetMessagesForChatAsync(int pageNumber, int pageSize, DateTime? beforeTimeStamp, CancellationToken ct = default);
}
