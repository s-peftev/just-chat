using JustChat.Functions.Interfaces;
using System.Reflection;
using System.Text;

namespace JustChat.Functions.Services;

public class TemplateService : ITemplateService
{
    public string GetTemplate(string templateName, Dictionary<string, string> replacements)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = $"{assembly.GetName().Name}.Templates.{templateName}";

        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new FileNotFoundException($"Template {templateName} is not found!");

        using var reader = new StreamReader(stream);
        var html = reader.ReadToEnd();

        var sb = new StringBuilder(html);

        foreach (var item in replacements)
        {
            sb.Replace("{{" + item.Key + "}}", item.Value);
        }

        return sb.ToString();
    }
}
