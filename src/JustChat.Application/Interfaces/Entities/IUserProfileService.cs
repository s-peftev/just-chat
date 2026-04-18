using JustChat.Domain.Entities;

namespace JustChat.Application.Interfaces.Entities;

public interface IUserProfileService : IEntityService<UserProfile, string>
{
    UserProfile AddForNewUser(string userId, string? firstName, string? lastName);
}
