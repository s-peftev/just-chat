using JustChat.Application.AppResult;
using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.ExternalProviders;
using JustChat.Application.Interfaces.Persistence.Repositories;
using JustChat.Contracts.DTOs;
using JustChat.Contracts.DTOs.Chat;
using JustChat.Contracts.DTOs.UserProfile;
using JustChat.Contracts.Enums;
using JustChat.Contracts.Requests.Chat;
using JustChat.Domain.Entities;

namespace JustChat.Application.Services.Entities;

public class MessageService(
    IMessageRepository messageRepository,
    ISentimentService sentimentService
    ) : EntityService<Message, Guid>(messageRepository), IMessageService
{
    public async Task<Result<PaginatedResult<MessageDto>>> GetMessagesForChatAsync(ChatMessagesRequest request, CancellationToken ct = default)
    {
        var messageResult = await messageRepository.GetMessagesForChatAsync(request.PageNumber, request.PageSize, request.BeforeTimeStamp, ct);

        var reversedMessages = new PaginatedResult<MessageDto>(messageResult.Metadata, messageResult.Items.Reverse());

        return Result<PaginatedResult<MessageDto>>.Success(reversedMessages);
    }

    public async Task<Result<MessageDto>> SaveMessageAsync(string text, UserProfileDetailsDto sender, CancellationToken ct = default)
    {
        var sentimentResult = await sentimentService.AnalyzeSentimentAsync(text, ct);
        var sentiment = sentimentResult.IsSuccess ? sentimentResult.Value : Sentiment.None;

        var message = new Message
        {
            Text = text,
            UserId = sender.UserId,
            Sentiment = sentiment,
        };

        Add(message);
        await SaveChangesAsync(ct);

        return Result<MessageDto>.Success(
            new MessageDto(message.Text, message.CreatedAt, sentiment, sender));
    }
}
