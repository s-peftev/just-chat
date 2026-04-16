using JustChat.Application.Interfaces.Utils;

namespace JustChat.Infrastructure.Utils;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}