using JustChat.API.Extensions;
using JustChat.Application.Interfaces.Entities;
using JustChat.Application.Interfaces.Identity;
using JustChat.Contracts.Requests.UserProfile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JustChat.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserProfileController(
    IAppUserService appUserService,
    IUserProfileService userProfileService
    ) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        var result = await appUserService.GetUserProfileDetailsAsync(User.GetAppUserId(), ct);

        return result.Match(
            data => Ok(data),
            error => error.CreateErrorResponse());
    }

    [HttpPatch("me/personal")]
    public async Task<IActionResult> ChangePersonalInfo([FromBody] ChangePersonalInfoRequest changePersonalInfoRequest, CancellationToken ct)
    { 
        var result = await userProfileService.ChangePersonalInfoAsync(User.GetAppUserId(), changePersonalInfoRequest, ct);

        return result.Match(
            () => Ok(),
            error => error.CreateErrorResponse());
    }

    [HttpPost("photo/upload")]
    public async Task<IActionResult> UploadPhoto([FromForm] ProfilePhotoUploadRequest request, CancellationToken ct)
    {
        var result = await userProfileService.UploadProfilePhotoAsync(request, User.GetAppUserId(), ct);

        return result.Match(
            data => Ok(data),
            error => error.CreateErrorResponse());
    }

    [HttpDelete("photo/delete")]
    public async Task<IActionResult> DeletePhoto(CancellationToken ct)
    {
        var result = await userProfileService.DeleteProfilePhotoAsync(User.GetAppUserId(), ct);

        return result.Match(
            () => Ok(),
            error => error.CreateErrorResponse());
    }
}
