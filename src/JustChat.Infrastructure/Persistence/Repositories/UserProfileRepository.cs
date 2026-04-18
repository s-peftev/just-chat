using JustChat.Application.Interfaces.Persistence.Repositories;
using JustChat.Domain.Entities;

namespace JustChat.Infrastructure.Persistence.Repositories;

public class UserProfileRepository(AppDbContext context)
    : Repository<UserProfile, string>(context), IUserProfileRepository
{
}
