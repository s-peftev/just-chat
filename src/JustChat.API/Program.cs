using JustChat.API.Configurators;
using JustChat.API.Filters;
using JustChat.API.Hubs;
using JustChat.API.Middleware;
using JustChat.Infrastructure.Constants;
using JustChat.Infrastructure.DI;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureKeyVault();
builder.ConfigureBlobStorage();
builder.ConfigureTextAnalytics();

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

builder.Services.AddControllers(options =>
{
    options.Filters.Add<FluentValidationActionFilter>();
    options.Filters.Add<PaginationNormalizationFilter>();
    options.Filters.Add<ApiResponseEnvelopeFilter>();
});

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.ConfigureCorsPolicy(builder.Configuration);
builder.Services.AddAzureSignalR(builder.Configuration);
builder.Services.AddAzureServiceBus(builder.Configuration);

SerilogConfigurator.Configure();
builder.Host.UseSerilog();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseExceptionHandler(_ => { });
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(Policies.DefaultCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("hubs/chat");

app.Run();
