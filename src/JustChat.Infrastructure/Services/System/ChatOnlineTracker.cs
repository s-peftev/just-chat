using JustChat.Infrastructure.Interfaces.Services.System;
using System.Collections.Concurrent;
using System.Collections.ObjectModel;

namespace JustChat.Infrastructure.Services.System;

public class ChatOnlineTracker : IChatOnlineTracker
{
    private readonly ConcurrentDictionary<string, HashSet<string>> _onlineUsers = new();

    public Task UserConnected(string userId, string connectionId)
    {
        _onlineUsers.AddOrUpdate(userId,
            new HashSet<string> { connectionId },
            (_, set) => {
                lock (set) { set.Add(connectionId); }
                return set;
            });

        return Task.CompletedTask;
    }

    public Task UserDisconnected(string userId, string connectionId)
    {
        if (_onlineUsers.TryGetValue(userId, out var set))
        {
            lock (set)
            {
                set.Remove(connectionId);
                if (set.Count == 0) _onlineUsers.TryRemove(userId, out _);
            }
        }

        return Task.CompletedTask;
    }

    public Task<ReadOnlyCollection<string>> GetOnlineUsers()
    {
        return Task.FromResult(_onlineUsers.Keys.ToList().AsReadOnly());
    }

    public Task<bool> IsFirstConnection(string userId)
    {
        const int InitialConnectionCount = 1;

        if (_onlineUsers.TryGetValue(userId, out var set))
        {
            lock (set)
            {
                return Task.FromResult(set.Count == InitialConnectionCount);
            }
        }

        return Task.FromResult(false);
    }

    public Task<bool> IsUserOnline(string userId)
    {
        return Task.FromResult(_onlineUsers.ContainsKey(userId));
    }
}
