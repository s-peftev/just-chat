namespace JustChat.Application.Interfaces.System;

public interface IRequestInfoService
{
    string? GetIpAddress();
    string? GetUserAgent();
}
