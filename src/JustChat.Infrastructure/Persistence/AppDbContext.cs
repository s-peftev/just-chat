using JustChat.Domain.Entities;
using JustChat.Infrastructure.Persistence.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace JustChat.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityUserContext<AppUser>(options)
{
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Ignore<IdentityUserClaim<string>>();
        builder.Ignore<IdentityUserToken<string>>();

        base.OnModelCreating(builder);

        builder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(p => p.UserId);

            entity
                .HasOne<AppUser>()
                .WithOne(u => u.UserProfile)
                .HasForeignKey<UserProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity
                .HasOne<AppUser>()
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
