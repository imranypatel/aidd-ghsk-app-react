using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WebApi.Application.Interfaces;
using WebApi.Application.Models;
using WebApi.Infrastructure.Interfaces;

namespace WebApi.Application.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly IAuthenticationRepository _repository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        IAuthenticationRepository repository,
        IConfiguration configuration,
        ILogger<AuthenticationService> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<AuthenticationResult> AuthenticateAsync(string username, string password, string? ipAddress, string? userAgent)
    {
        _logger.LogInformation("Authentication attempt for user: {Username}", username);

        // Call repository to get user and stored password hash
        var authResult = await _repository.AuthenticateUserAsync(username, ipAddress, userAgent);

        if (!authResult.IsSuccess)
        {
            _logger.LogWarning("Authentication failed for user {Username}: {ErrorCode} - {Message}", 
                username, authResult.ErrorCode, authResult.Message);
            return AuthenticationResult.Failure(authResult.ErrorCode, authResult.Message);
        }

        // Extract stored password hash from tState data
        if (!authResult.Data.TryGetValue("USERID", out var userIdStr) || 
            !authResult.Data.TryGetValue("PASSWORDHASH", out var storedHash))
        {
            _logger.LogError("Authentication response missing USERID or PASSWORDHASH for user: {Username}", username);
            return AuthenticationResult.Failure("SYS-00-003", "Invalid authentication response");
        }

        // Verify password with BCrypt
        if (!BCrypt.Net.BCrypt.Verify(password, storedHash))
        {
            _logger.LogWarning("Password verification failed for user: {Username}", username);
            return AuthenticationResult.Failure("SEC-01-003", "Invalid credentials");
        }

        // Parse UserId
        if (!int.TryParse(userIdStr, out var userId))
        {
            _logger.LogError("Invalid UserId format in authentication response: {UserIdStr}", userIdStr);
            return AuthenticationResult.Failure("SYS-00-004", "Invalid user ID");
        }

        _logger.LogInformation("Authentication successful for user: {Username} (UserId: {UserId})", username, userId);
        return AuthenticationResult.Success(userId, username, storedHash);
    }

    public async Task<SessionInfo> CreateSessionAsync(int userId, string username, string? ipAddress, string? userAgent)
    {
        _logger.LogInformation("Creating session for UserId: {UserId}, Username: {Username}", userId, username);

        // Generate JWT token
        var sessionToken = GenerateJwtToken(userId);

        // Call repository to create session
        var sessionResult = await _repository.CreateSessionAsync(userId, sessionToken, ipAddress, userAgent);

        if (!sessionResult.IsSuccess)
        {
            _logger.LogError("Session creation failed for UserId {UserId}: {ErrorCode} - {Message}", 
                userId, sessionResult.ErrorCode, sessionResult.Message);
            return SessionInfo.Invalid(sessionResult.ErrorCode, sessionResult.Message);
        }

        // Extract session info from tState data
        if (!sessionResult.Data.TryGetValue("SESSIONID", out var sessionIdStr) ||
            !sessionResult.Data.TryGetValue("EXPIRY", out var expiryStr))
        {
            _logger.LogError("Session response missing SESSIONID or EXPIRY for UserId: {UserId}", userId);
            return SessionInfo.Invalid("SYS-00-005", "Invalid session response");
        }

        if (!int.TryParse(sessionIdStr, out var sessionId) ||
            !DateTime.TryParse(expiryStr, out var expiryDate))
        {
            _logger.LogError("Invalid session data format: SessionId={SessionId}, Expiry={Expiry}", 
                sessionIdStr, expiryStr);
            return SessionInfo.Invalid("SYS-00-006", "Invalid session data");
        }

        _logger.LogInformation("Session created successfully: SessionId={SessionId}, UserId={UserId}, Username={Username}", 
            sessionId, userId, username);
        return SessionInfo.Valid(sessionId, userId, username, sessionToken, expiryDate);
    }

    public async Task<bool> LogoutAsync(string sessionToken, string? ipAddress, string? userAgent)
    {
        _logger.LogInformation("Logout attempt for session token");

        var logoutResult = await _repository.EndSessionAsync(sessionToken, ipAddress, userAgent);

        if (!logoutResult.IsSuccess)
        {
            _logger.LogWarning("Logout failed: {ErrorCode} - {Message}", 
                logoutResult.ErrorCode, logoutResult.Message);
            return false;
        }

        _logger.LogInformation("Logout successful");
        return true;
    }

    public async Task<SessionInfo> ValidateSessionAsync(string sessionToken)
    {
        var validationResult = await _repository.ValidateSessionAsync(sessionToken);

        if (!validationResult.IsSuccess)
        {
            return SessionInfo.Invalid(validationResult.ErrorCode, validationResult.Message);
        }

        // Extract validation info from tState data (USERID, USERNAME, EXPIRY)
        if (!validationResult.Data.TryGetValue("USERID", out var userIdStr) ||
            !validationResult.Data.TryGetValue("USERNAME", out var username) ||
            !validationResult.Data.TryGetValue("EXPIRY", out var expiryStr))
        {
            _logger.LogError("Validation response missing USERID, USERNAME or EXPIRY");
            return SessionInfo.Invalid("SYS-00-007", "Invalid validation response");
        }

        if (!int.TryParse(userIdStr, out var userId) ||
            !DateTime.TryParse(expiryStr, out var expiryDate))
        {
            _logger.LogError("Invalid validation data format");
            return SessionInfo.Invalid("SYS-00-008", "Invalid validation data");
        }

        return SessionInfo.Valid(0, userId, username, sessionToken, expiryDate);
    }

    private string GenerateJwtToken(int userId)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"] ?? "AiddApp";
        var audience = jwtSettings["Audience"] ?? "AiddApp";
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "30");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim("UserId", userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
