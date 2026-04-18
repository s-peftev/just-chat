using FluentValidation;
using JustChat.Contracts.Requests.UserProfile;
using JustChat.Domain.Constants.Validation;

namespace JustChat.Application.Validators.UserProfile;

public class ChangePersonalInfoRequestValidator : AbstractValidator<ChangePersonalInfoRequest>
{
    public ChangePersonalInfoRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .MaximumLength(UserValidationRules.MaxNameLength)
            .WithMessage("FirstName cannot exceed " + UserValidationRules.MaxNameLength + " characters.")
            .When(x => !string.IsNullOrEmpty(x.FirstName));

        RuleFor(x => x.LastName)
            .MaximumLength(UserValidationRules.MaxNameLength)
            .WithMessage("LastName cannot exceed " + UserValidationRules.MaxNameLength + " characters.")
            .When(x => !string.IsNullOrEmpty(x.LastName));
    }
}
