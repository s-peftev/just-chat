using JustChat.Contracts.DTOs.Identity;
using JustChat.Domain.Entities;

namespace JustChat.Application.Interfaces.Identity;

public interface ITokenService
{
    string GenerateJwtToken(UserAuthDto dto);
    RefreshToken GenerateRefreshToken(RefreshTokenGenerationDto dto);
}
