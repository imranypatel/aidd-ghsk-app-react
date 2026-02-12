using System.Net;
using System.Text.Json;
using Serilog;
using WebApi.Application.Exceptions;
using WebApi.Models;

namespace WebApi.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.Items["CorrelationId"]?.ToString() ?? "N/A";
        
        _logger.LogError(exception, 
            "Unhandled exception occurred. CorrelationId: {CorrelationId}, Path: {Path}", 
            correlationId, context.Request.Path);

        var (statusCode, errorCode, message) = exception switch
        {
            AuthenticationException authEx => (HttpStatusCode.Unauthorized, authEx.ErrorCode, authEx.Message),
            ArgumentException argEx => (HttpStatusCode.BadRequest, "VAL-00-001", argEx.Message),
            InvalidOperationException invEx => (HttpStatusCode.BadRequest, "VAL-00-002", invEx.Message),
            _ => (HttpStatusCode.InternalServerError, "SYS-00-999", "An unexpected error occurred")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<object>.ErrorResult(errorCode, message);
        
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var json = JsonSerializer.Serialize(response, options);
        await context.Response.WriteAsync(json);
    }
}
