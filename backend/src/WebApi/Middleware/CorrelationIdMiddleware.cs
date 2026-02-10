using Serilog.Context;

namespace WebApi.Middleware;

public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationIdHeaderName = "X-Correlation-ID";

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[CorrelationIdHeaderName].FirstOrDefault() 
            ?? Guid.NewGuid().ToString();

        // Store in HttpContext for access in other middleware/controllers
        context.Items["CorrelationId"] = correlationId;

        // Add to Serilog log context
        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            // Add to response headers
            context.Response.OnStarting(() =>
            {
                context.Response.Headers[CorrelationIdHeaderName] = correlationId;
                return Task.CompletedTask;
            });

            await _next(context);
        }
    }
}
