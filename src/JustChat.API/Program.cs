using JustChat.API.Configurators;
using JustChat.API.Filters;
using JustChat.API.Middleware;
using JustChat.Infrastructure.Constants;
using JustChat.Infrastructure.DI;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(options =>
{
    options.Filters.Add<FluentValidationActionFilter>();
    options.Filters.Add<ApiResponseEnvelopeFilter>();
});

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.ConfigureCorsPolicy(builder.Configuration);

SerilogConfigurator.Configure();
builder.Host.UseSerilog();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors(Policies.DefaultCorsPolicy);
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseExceptionHandler(_ => { });

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
