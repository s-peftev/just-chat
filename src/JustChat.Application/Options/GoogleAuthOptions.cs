namespace JustChat.Application.Options;

public class GoogleAuthOptions
{
    public const string GoogleAuthOptionsKey = "GoogleAuth";

    /// <summary>OAuth 2.0 client IDs allowed as the ID token <c>aud</c> claim (e.g. Web client ID).</summary>
    public IList<string> ClientIds { get; set; } = [];
}
