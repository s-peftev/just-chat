using FluentValidation;
using JustChat.Contracts.Requests.Identity;

namespace JustChat.Application.Validators.Identity;

public class GoogleLoginRequestValidator : AbstractValidator<GoogleLoginRequest>
{
    public const int IdTokenMaxLength = 32768;

    public GoogleLoginRequestValidator()
    {
        RuleFor(x => x.IdToken)
            .NotEmpty()
            .MaximumLength(IdTokenMaxLength);
    }
}
