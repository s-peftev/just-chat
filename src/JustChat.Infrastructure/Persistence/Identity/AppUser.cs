using JustChat.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace JustChat.Infrastructure.Persistence.Identity;

public class AppUser : IdentityUser
{
    public UserProfile UserProfile { get; set; } = null!;
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
