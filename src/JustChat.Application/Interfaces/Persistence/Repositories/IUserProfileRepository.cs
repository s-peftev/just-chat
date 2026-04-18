using JustChat.Domain.Entities;

namespace JustChat.Application.Interfaces.Persistence.Repositories;

public interface IUserProfileRepository : IRepository<UserProfile, string>
{
}
