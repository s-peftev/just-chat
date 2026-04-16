namespace JustChat.Domain.Constants.Validation;

public static class UserValidationRules
{
    public static class Password
    {
        public const int MinLength = 8;
        public const int MaxLength = 20;
    }

    public const int MaxNameLength = 20;
    public const int MaxEmailLength = 254;
}