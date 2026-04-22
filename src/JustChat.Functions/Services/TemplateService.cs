using JustChat.Functions.Interfaces;
using System.Reflection;
using System.Text;
using System.Text.Encodings.Web;

namespace JustChat.Functions.Services;

public class TemplateService : ITemplateService
{
    public string GetTemplate(string templateName, Dictionary<string, string> replacements)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = ResolveEmbeddedTemplateName(assembly, templateName);

        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new FileNotFoundException($"Template {templateName} is not found!");

        using var reader = new StreamReader(stream);
        var html = reader.ReadToEnd();

        var sb = new StringBuilder(html);
        var encoder = HtmlEncoder.Default;

        foreach (var item in replacements)
        {
            var encodedValue = encoder.Encode(item.Value);
            sb.Replace("{{" + item.Key + "}}", encodedValue);
        }

        return sb.ToString();
    }

    private static string ResolveEmbeddedTemplateName(Assembly assembly, string templateName)
    {
        var suffix = "." + templateName;
        string? match = null;

        foreach (var name in assembly.GetManifestResourceNames())
        {
            if (!name.EndsWith(suffix, StringComparison.Ordinal))
                continue;

            if (match is not null)
                throw new InvalidOperationException(
                    $"Multiple embedded resources end with '{suffix}': '{match}', '{name}'.");

            match = name;
        }

        return match ?? throw new FileNotFoundException($"Template {templateName} is not found!");
    }
}
