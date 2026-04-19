using JustChat.Application.Interfaces.Persistence.Repositories;
using JustChat.Contracts.DTOs;
using JustChat.Contracts.DTOs.Chat;
using JustChat.Contracts.DTOs.UserProfile;
using JustChat.Domain.Entities;
using JustChat.Infrastructure.Extensions;

namespace JustChat.Infrastructure.Persistence.Repositories;

internal class MessageRepository(AppDbContext context)
    : Repository<Message, Guid>(context), IMessageRepository
{
    public async Task<PaginatedResult<MessageDto>> GetMessagesForChatAsync(int pageNumber, int pageSize, DateTime? beforeTimeStamp, CancellationToken ct = default)
    {
        var query = _dbSet.AsQueryable();

        if (beforeTimeStamp.HasValue)
        {
            query = query.Where(m => m.CreatedAt < beforeTimeStamp.Value);
        }

        return await query
            .OrderByDescending(m => m.CreatedAt)
            .Join(
                _context.Users,
                m => m.UserId,
                u => u.Id,
                (message, user) => new MessageDto(
                    message.Text,
                    message.CreatedAt,
                    message.Sentiment,
                    new UserProfileDetailsDto(
                        message.UserId,
                        user.Email!,
                        message.UserProfile!.FirstName,
                        message.UserProfile!.LastName,
                        message.UserProfile.ProfilePhotoUrl)))
            .ToPagedAsync<MessageDto>(pageNumber, pageSize, ct);
    }
}
