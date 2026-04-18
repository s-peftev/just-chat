using Microsoft.AspNetCore.Http;

namespace JustChat.Contracts.Requests.UserProfile;

public record ProfilePhotoUploadRequest(IFormFile File);
