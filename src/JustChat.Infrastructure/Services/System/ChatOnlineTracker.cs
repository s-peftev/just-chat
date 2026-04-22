using JustChat.Infrastructure.Interfaces.Services.System;
using System.Collections.Concurrent;
using System.Collections.ObjectModel;

namespace JustChat.Infrastructure.Services.System;

public class ChatOnlineTracker : IChatOnlineTracker
{
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _onlineUsers = new();

    public Task UserConnected(string userId, string connectionId)
    {
        var connections = _onlineUsers.GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());
        connections.TryAdd(connectionId, 0);

        return Task.CompletedTask;
    }

    public Task UserDisconnected(string userId, string connectionId)
    {
        if (_onlineUsers.TryGetValue(userId, out var connections))
        {
            connections.TryRemove(connectionId, out _);

            if (connections.IsEmpty)
            {
                _onlineUsers.TryRemove(KeyValuePair.Create(userId, connections));
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

        if (_onlineUsers.TryGetValue(userId, out var userConnections))
        {
            return Task.FromResult(userConnections.Count == InitialConnectionCount);
        }

        return Task.FromResult(false);
    }

    public Task<bool> IsUserOnline(string userId)
    {
        return Task.FromResult(_onlineUsers.ContainsKey(userId));
    }
}
