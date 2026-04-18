using JustChat.Application.AppResult;
using JustChat.Application.AppResult.Errors;
using JustChat.Application.Constants.Identity;
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
        var user = CreateAppUserForEmail(Email, emailConfirmed: false);
        var identityResult = await CreateUserAsync(user, Password, ct);

        if (!identityResult.Succeeded)
            return Result<UserAuthDto>.Failure(MapCreateUserFailureToError(identityResult));

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

    public async Task<Result<GoogleUserProvisionResultDto>> ProvisionGoogleUserAsync(GoogleIdTokenPayload payload, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        if (!payload.EmailVerified)
            return Result<GoogleUserProvisionResultDto>.Failure(UserErrors.GoogleEmailNotVerified);

        var provider = ExternalLoginProviders.Google;
        var providerKey = payload.Subject;
        var email = payload.Email;

        var userByLogin = await userManager.FindByLoginAsync(provider, providerKey);
        if (userByLogin is not null)
        {
            return Result<GoogleUserProvisionResultDto>.Success(
                new GoogleUserProvisionResultDto(
                    new UserAuthDto(userByLogin.Id, userByLogin.Email!),
                    RequiresUserProfile: false));
        }

        var userByEmail = await userManager.FindByEmailAsync(email);
        if (userByEmail is not null)
        {
            var addLoginResult = await userManager.AddLoginAsync(
                userByEmail,
                new UserLoginInfo(provider, providerKey, null));

            if (!addLoginResult.Succeeded)
                return Result<GoogleUserProvisionResultDto>.Failure(MapIdentityErrorsToRegistrationError(addLoginResult));

            return Result<GoogleUserProvisionResultDto>.Success(
                new GoogleUserProvisionResultDto(
                    new UserAuthDto(userByEmail.Id, userByEmail.Email!),
                    RequiresUserProfile: false));
        }

        var newUser = CreateAppUserForEmail(email, emailConfirmed: true);

        var createResult = await CreateUserAsync(newUser, password: null, ct);
        if (!createResult.Succeeded)
            return Result<GoogleUserProvisionResultDto>.Failure(MapCreateUserFailureToError(createResult));

        var addLoginAfterCreate = await userManager.AddLoginAsync(
            newUser,
            new UserLoginInfo(provider, providerKey, null));

        if (!addLoginAfterCreate.Succeeded)
            return Result<GoogleUserProvisionResultDto>.Failure(MapIdentityErrorsToRegistrationError(addLoginAfterCreate));

        return Result<GoogleUserProvisionResultDto>.Success(
            new GoogleUserProvisionResultDto(
                new UserAuthDto(newUser.Id, newUser.Email!),
                RequiresUserProfile: true));
    }

    private static AppUser CreateAppUserForEmail(string email, bool emailConfirmed) =>
        new()
        {
            UserName = email,
            Email = email,
            EmailConfirmed = emailConfirmed,
        };

    private async Task<IdentityResult> CreateUserAsync(AppUser user, string? password, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        return password is null
            ? await userManager.CreateAsync(user)
            : await userManager.CreateAsync(user, password);
    }

    private static Error MapCreateUserFailureToError(IdentityResult result)
    {
        if (result.Errors.Any(e => e.Code is "DuplicateEmail" or "DuplicateUserName"))
            return UserErrors.EmailIsTaken;

        return MapIdentityErrorsToRegistrationError(result);
    }

    private static Error MapIdentityErrorsToRegistrationError(IdentityResult result)
    {
        var details = result.Errors.Select(e => e.Description).ToList();

        return UserErrors.RegistrationFailed(details);
    }
}
