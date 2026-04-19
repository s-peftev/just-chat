using System.Collections.ObjectModel;

namespace JustChat.Infrastructure.Interfaces.Services.System;

public interface IChatOnlineTracker
{
    Task UserConnected(string userId, string connectionId);
    Task UserDisconnected(string userId, string connectionId);
    Task<ReadOnlyCollection<string>> GetOnlineUsers();
    Task<bool> IsFirstConnection(string userId);
    Task<bool> IsUserOnline(string userId);
}
