using Serilog;
using WebApi.Application.Interfaces;
using WebApi.Application.Services;
using WebApi.Infrastructure.Data;
using WebApi.Infrastructure.Interfaces;
using WebApi.Infrastructure.Repositories;
using WebApi.Middleware;

namespace WebApi;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Configure Serilog
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithThreadId()
            .WriteTo.Console()
            .WriteTo.File(
                path: "logs/webapi-.log",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 7,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [{SourceContext}] {Message:lj}{NewLine}{Exception}")
            .CreateLogger();

        builder.Host.UseSerilog();

        // Add services to the container
        builder.Services.AddControllers();

        // Configure CORS for React frontend
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp", policy =>
            {
                policy.WithOrigins("http://localhost:3000")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        // Register Infrastructure services
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        
        builder.Services.AddSingleton<IDbConnectionFactory>(_ => new DbConnectionFactory(connectionString));
        builder.Services.AddSingleton<TStateParser>();
        builder.Services.AddScoped<IAuthenticationRepository, AuthenticationRepository>();

        // Register Application services
        builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();

        var app = builder.Build();

        // Add custom middleware (order matters!)
        app.UseMiddleware<CorrelationIdMiddleware>();
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        app.UseCors("AllowReactApp");

        app.UseAuthorization();

        app.MapControllers();
        
        // Add health check endpoint
        app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

        Log.Information("Starting AIDD Web API on http://localhost:5000");
        
        try
        {
            app.Run();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Application terminated unexpectedly");
            throw;
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
