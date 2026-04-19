using JustChat.Application.AppResult;
using JustChat.Contracts.DTOs;
using JustChat.Contracts.DTOs.Chat;
using JustChat.Contracts.DTOs.UserProfile;
using JustChat.Contracts.Requests.Chat;
using JustChat.Domain.Entities;

namespace JustChat.Application.Interfaces.Entities;

public interface IMessageService : IEntityService<Message, Guid>
{
    Task<Result<PaginatedResult<MessageDto>>> GetMessagesForChatAsync(ChatMessagesRequest request, CancellationToken ct = default);
    Task<Result<MessageDto>> SaveMessageAsync(string text, UserProfileDetailsDto sender, CancellationToken ct = default);
}
