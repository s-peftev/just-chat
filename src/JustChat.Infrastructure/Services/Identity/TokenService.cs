using JustChat.Application.Interfaces.Identity;
using JustChat.Application.Interfaces.Utils;
using JustChat.Application.Options;
using JustChat.Contracts.DTOs.Identity;
using JustChat.Domain.Entities;
using JustChat.Infrastructure.Constants.ExceptionMessages;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace JustChat.Infrastructure.Services.Identity;

public class TokenService : ITokenService
{
    private readonly JwtOptions _jwtOptions;
    private readonly SigningCredentials _signingCredentials;
    private readonly IDateTimeProvider _dateTimeProvider;

    public TokenService(IOptions<JwtOptions> jwtOptions, IDateTimeProvider dateTimeProvider)
    {
        _jwtOptions = jwtOptions.Value;

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Secret));
        _signingCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        _dateTimeProvider = dateTimeProvider;
    }

    public string GenerateJwtToken(UserAuthDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UserId))
            throw new ArgumentException(TokensExceptionMessages.UserIdRequiredForJwt);

        var claims = new List<Claim>()
            {
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.NameIdentifier, dto.UserId),
                new(JwtRegisteredClaimNames.Email, dto.Email)
            };

        var expires = _dateTimeProvider.UtcNow.AddMinutes(_jwtOptions.ExpirationTimeInMinutes);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: _signingCredentials
        );

        var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);

        return jwtToken;
    }

    public RefreshToken GenerateRefreshToken(RefreshTokenGenerationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UserId))
            throw new ArgumentException(TokensExceptionMessages.UserIdRequiredForRefreshToken);

        if (dto.ExpirationDays <= 0)
            throw new ArgumentException(TokensExceptionMessages.ExpirationDaysPositiveRequired);

        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);

        return new()
        {
            Token = Convert.ToBase64String(randomNumber),
            CreatedAtUtc = _dateTimeProvider.UtcNow,
            ExpiresAtUtc = _dateTimeProvider.UtcNow.AddDays(dto.ExpirationDays),
            UserAgent = dto.UserAgent,
            IpAddress = dto.IpAddress,
            SessionId = dto.SessionId ?? Guid.NewGuid(),
            UserId = dto.UserId
        };
    }
}
