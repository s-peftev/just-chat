using FluentValidation;
using JustChat.Contracts.Requests.Identity;

namespace JustChat.Application.Validators.Identity;

public class UserLoginRequestValidator : AbstractValidator<UserLoginRequest>
{
    public UserLoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .EmailAddress()
            .NotEmpty();

        RuleFor(x => x.Password)
            .NotEmpty();
    }
}
