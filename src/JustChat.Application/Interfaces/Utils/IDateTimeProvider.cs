namespace JustChat.Application.Interfaces.Utils;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
