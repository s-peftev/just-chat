using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.Persistence.Repositories;
using JustChat.Domain.Entities;

namespace JustChat.Application.Services.Entities;

public class UserProfileService(IUserProfileRepository repository)
    : EntityService<UserProfile, string>(repository), IUserProfileService
{
    public UserProfile AddForNewUser(string userId, string? firstName, string? lastName)
    {
        var profile = new UserProfile
        {
            UserId = userId,
            FirstName = firstName,
            LastName = lastName,
        };

        return Add(profile);
    }
}
