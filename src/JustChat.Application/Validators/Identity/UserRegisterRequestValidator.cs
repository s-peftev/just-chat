using FluentValidation;
using JustChat.Contracts.Requests.Identity;
using JustChat.Domain.Constants.Validation;

namespace JustChat.Application.Validators.Identity;

public class UserRegisterRequestValidator : AbstractValidator<UserRegisterRequest>
{
    public UserRegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .EmailAddress()
            .NotEmpty()
            .MaximumLength(UserValidationRules.MaxEmailLength);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(UserValidationRules.Password.MinLength)
            .MaximumLength(UserValidationRules.Password.MaxLength)
            .Must(p => p.Any(char.IsDigit)).WithMessage("Password must contain at least one digit.")
            .Must(p => p.Any(char.IsUpper)).WithMessage("Password must contain at least one uppercase letter.")
            .Must(p => p.Any(char.IsLower)).WithMessage("Password must contain at least one lowercase letter.");

        RuleFor(x => x.FirstName)
            .MaximumLength(UserValidationRules.MaxNameLength)
            .When(x => x.FirstName is not null);

        RuleFor(x => x.LastName)
            .MaximumLength(UserValidationRules.MaxNameLength)
            .When(x => x.LastName is not null);
    }
}
