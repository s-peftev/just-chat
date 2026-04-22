using JustChat.Infrastructure.Interfaces.Services.System;
using System.Collections.Concurrent;
using System.Collections.ObjectModel;

namespace JustChat.Infrastructure.Services.System;

/// <summary>
/// In-memory, process-local presence: maps user id to a set of SignalR connection ids (a user may have multiple tabs/devices).
/// </summary>
public class ChatOnlineTracker : IChatOnlineTracker
{
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _onlineUsers = new();

    /// <summary>Registers one connection for a user (idempotent per connection id).</summary>
    public Task UserConnected(string userId, string connectionId)
    {
        var connections = _onlineUsers.GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());
        connections.TryAdd(connectionId, 0);

        return Task.CompletedTask;
    }

    /// <summary>Removes a connection; drops the user entry when no connections remain.</summary>
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

    /// <summary>Returns user ids that currently have at least one active connection.</summary>
    public Task<ReadOnlyCollection<string>> GetOnlineUsers()
    {
        return Task.FromResult(_onlineUsers.Keys.ToList().AsReadOnly());
    }

    /// <summary>
    /// True only when the user is already tracked and has exactly one connection (typical first tab right after connect).
    /// Returns false if the user is unknown (e.g. not yet registered in the tracker or already has multiple connections).
    /// </summary>
    public Task<bool> IsFirstConnection(string userId)
    {
        const int InitialConnectionCount = 1;

        if (_onlineUsers.TryGetValue(userId, out var userConnections))
        {
            return Task.FromResult(userConnections.Count == InitialConnectionCount);
        }

        return Task.FromResult(false);
    }

    /// <summary>True if the user has at least one registered connection.</summary>
    public Task<bool> IsUserOnline(string userId)
    {
        return Task.FromResult(_onlineUsers.ContainsKey(userId));
    }
}
