using Serilog;

namespace JustChat.API.Configurators;

public static class SerilogConfigurator
{
    public static void Configure()
    {
        Log.Logger = new LoggerConfiguration()
            .Enrich.FromLogContext()
            .Enrich.WithProperty("CorrelationId", "N/A")
            .WriteTo.Console(
                outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] [CorrelationId: {CorrelationId:l}] {Message:lj} {NewLine}{Exception}")
            .CreateLogger();
    }
}
