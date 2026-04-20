using JustChat.API.Extensions;
using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.Identity;
using JustChat.Contracts.Requests.Chat;
using JustChat.Infrastructure.Constants.HubEvents;
using JustChat.Infrastructure.Interfaces.Services.System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace JustChat.API.Hubs;

[Authorize]
public class ChatHub(
    IMessageService messageService,
    IAppUserService appUserService,
    IChatOnlineTracker chatOnlineTracker
    ) : Hub
{
    public async Task CreateConnectionAsync(ChatMessagesRequest request)
    {
        CancellationToken ct = Context.ConnectionAborted;
        var userId = GetUserProfileId();

        var newUserResult = await appUserService.GetUserProfileDetailsAsync(userId);
        if (!newUserResult.IsSuccess) 
            throw new HubException("Cannot get new user info");

        var onlineTrackingTask = chatOnlineTracker.UserConnected(userId, Context.ConnectionId);
        var messagesTask = messageService.GetMessagesForChatAsync(request, ct);

        await Task.WhenAll(onlineTrackingTask, messagesTask);

        var onlineIds = await chatOnlineTracker.GetOnlineUsers();
        var onlineUsersResult = await appUserService.GetUserProfileDetailsListAsync(onlineIds, ct);

        var usersInChat = onlineUsersResult.Value;
        var chatMessages = await messagesTask;

        await Clients.Caller.SendAsync(ChatHubEvents.InitChat, usersInChat, chatMessages.Value);

        if (await chatOnlineTracker.IsFirstConnection(userId))
            await Clients.Others.SendAsync(ChatHubEvents.UserConnected, newUserResult.Value);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserProfileId();

        await chatOnlineTracker.UserDisconnected(userId, Context.ConnectionId);

        var isStillOnline = await chatOnlineTracker.IsUserOnline(userId);

        if (!isStillOnline)
            await Clients.Others.SendAsync(ChatHubEvents.UserDisconnected, userId);

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessageAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return;

        var ct = Context.ConnectionAborted;
        var userId = GetUserProfileId();

        var senderResult = await appUserService.GetUserProfileDetailsAsync(userId);
        if (!senderResult.IsSuccess) 
            throw new HubException("Cannot get sender info");

        var saveResult = await messageService.SaveMessageAsync(text, senderResult.Value, ct);
        if (!saveResult.IsSuccess) 
            throw new HubException("Cannot save message");

        await Clients.All.SendAsync(ChatHubEvents.NewMessage, saveResult.Value);
    }

    private string GetUserProfileId()
    {
        return Context.User?.GetAppUserId()
            ?? throw new HubException("Cannot get member id");
    }
}
