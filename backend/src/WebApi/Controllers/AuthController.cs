using Microsoft.AspNetCore.Mvc;
using WebApi.Application.Interfaces;
using WebApi.Models;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authService;
    private readonly ILogger<AuthController> _logger;
    private const string SessionCookieName = "AIDD_SESSION";

    public AuthController(
        IAuthenticationService authService,
        ILogger<AuthController> logger)
    {
        _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<LoginResponse>.ErrorResult("VAL-00-003", "Invalid request data"));
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        // Authenticate user (password verification happens here)
        var authResult = await _authService.AuthenticateAsync(request.Username, request.Password, ipAddress, userAgent);

        if (!authResult.IsAuthenticated)
        {
            _logger.LogWarning("Login failed for user {Username}: {ErrorCode}", request.Username, authResult.ErrorCode);
            return Unauthorized(ApiResponse<LoginResponse>.ErrorResult(
                authResult.ErrorCode ?? "SEC-01-999", 
                authResult.ErrorMessage ?? "Authentication failed"));
        }

        // Create session
        var sessionResult = await _authService.CreateSessionAsync(
            authResult.UserId!.Value, 
            authResult.Username!, 
            ipAddress, 
            userAgent);

        if (!sessionResult.IsValid)
        {
            _logger.LogError("Session creation failed for user {Username}: {ErrorCode}", 
                request.Username, sessionResult.ErrorCode);
            return StatusCode(500, ApiResponse<LoginResponse>.ErrorResult(
                sessionResult.ErrorCode ?? "SYS-00-010", 
                "Failed to create session"));
        }

        // Set httpOnly cookie
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // False for localhost development
            SameSite = SameSiteMode.Lax, // Lax for same-site requests
            Expires = sessionResult.ExpiresDate,
            Path = "/"
            // No Domain - let browser handle it (will be set for the origin that receives the Set-Cookie header)
        };

        Response.Cookies.Append(SessionCookieName, sessionResult.SessionToken!, cookieOptions);

        // Return response
        var loginResponse = new LoginResponse
        {
            User = new LoginResponse.UserInfo
            {
                UserId = authResult.UserId!.Value,
                Username = authResult.Username!
            },
            Session = new LoginResponse.SessionDetails
            {
                Token = sessionResult.SessionToken!,
                ExpiresAt = sessionResult.ExpiresDate!.Value
            }
        };

        _logger.LogInformation("Login successful for user {Username} (UserId: {UserId})", 
            authResult.Username, authResult.UserId);

        return Ok(ApiResponse<LoginResponse>.SuccessResult(loginResponse, "Login successful"));
    }

    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse<object>>> Logout()
    {
        var sessionToken = Request.Cookies[SessionCookieName];

        if (string.IsNullOrEmpty(sessionToken))
        {
            _logger.LogWarning("Logout attempt without session cookie");
            return BadRequest(ApiResponse<object>.ErrorResult("SEC-02-001", "No active session"));
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        var logoutSuccess = await _authService.LogoutAsync(sessionToken, ipAddress, userAgent);

        // Clear cookie regardless of logout result
        Response.Cookies.Delete(SessionCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        if (!logoutSuccess)
        {
            _logger.LogWarning("Logout failed for session token");
            return Ok(ApiResponse<object>.SuccessResult(null, "Session cleared (logout may have failed)"));
        }

        _logger.LogInformation("Logout successful");
        return Ok(ApiResponse<object>.SuccessResult(null, "Logout successful"));
    }

    [HttpGet("session")]
    public async Task<ActionResult<ApiResponse<object>>> ValidateSession()
    {
        // Try cookie first (production)
        var sessionToken = Request.Cookies[SessionCookieName];

        // WORKAROUND: Fallback to Authorization header for E2E tests where cookies don't work properly
        // In production, cookies should always be used for security
        if (string.IsNullOrEmpty(sessionToken))
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                sessionToken = authHeader.Substring("Bearer ".Length).Trim();
            }
        }

        if (string.IsNullOrEmpty(sessionToken))
        {
            return Unauthorized(ApiResponse<object>.ErrorResult("SEC-03-001", "No session cookie"));
        }

        var sessionInfo = await _authService.ValidateSessionAsync(sessionToken);

        if (!sessionInfo.IsValid)
        {
        // Clear invalid session cookie
        Response.Cookies.Delete(SessionCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });            return Unauthorized(ApiResponse<object>.ErrorResult(
                sessionInfo.ErrorCode ?? "SEC-03-002", 
                sessionInfo.ErrorMessage ?? "Invalid session"));
        }

        var sessionData = new
        {
            UserId = sessionInfo.UserId,
            Username = sessionInfo.Username,
            ExpiresAt = sessionInfo.ExpiresDate,
            IsValid = true
        };

        return Ok(ApiResponse<object>.SuccessResult(sessionData, "Session is valid"));
    }
}
