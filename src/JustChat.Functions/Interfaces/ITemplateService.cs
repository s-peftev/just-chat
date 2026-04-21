namespace JustChat.Functions.Interfaces;

public interface ITemplateService
{
    string GetTemplate(string templateName, Dictionary<string, string> replacements);
}
