using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Interfaces.Identity;
using JustChat.Contracts.DTOs.Identity;
using JustChat.Infrastructure.Persistence.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JustChat.Infrastructure.Services.Identity;

public class AppUserService(
    UserManager<AppUser> userManager
    ) : IAppUserService
{
    public async Task<Result<UserAuthDto>> AuthenticateAsync(string email, string password, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var user = await userManager.FindByEmailAsync(email);

        if (user is null)
            return Result<UserAuthDto>.Failure(GeneralErrors.NotFound);

        var isPasswordValid = await userManager.CheckPasswordAsync(user, password);

        if (!isPasswordValid)
            return Result<UserAuthDto>.Failure(UserErrors.LoginFailed);

        return Result<UserAuthDto>.Success(new UserAuthDto(user.Id, user.Email!));
    }

    public async Task<Result<UserAuthDto>> RegisterAppUserAsync(string Email, string Password, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var user = new AppUser
        {
            UserName = Email,
            Email = Email,
        };

        var identityResult = await userManager.CreateAsync(user, Password);

        if (!identityResult.Succeeded)
        {
            if (identityResult.Errors.Any(e => e.Code is "DuplicateEmail" or "DuplicateUserName"))
                return Result<UserAuthDto>.Failure(UserErrors.EmailIsTaken);

            var details = identityResult.Errors.Select(e => e.Description).ToList();

            return Result<UserAuthDto>.Failure(UserErrors.RegistrationFailed(details));
        }

        return Result<UserAuthDto>.Success(new UserAuthDto(user.Id, user.Email!));
    }

    public async Task<Result<UserAuthDto>> GetUserAuthInfoByIdAsync(string userId, CancellationToken ct = default)
    {
        var userInfo = await userManager.Users
                .Where(u => u.Id == userId)
                .Select(u => new UserAuthDto(u.Id, u.Email!))
                .FirstOrDefaultAsync(ct);

        return userInfo is null
            ? Result<UserAuthDto>.Failure(GeneralErrors.NotFound)
            : Result<UserAuthDto>.Success(userInfo);
    }

    public async Task<Result> FindUserByEmailAsync(string email, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var user = await userManager.FindByEmailAsync(email);

        return user is null
            ? Result.Failure(GeneralErrors.NotFound)
            : Result.Success();
    }
}
