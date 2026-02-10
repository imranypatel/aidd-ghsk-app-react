using WebApi.Application.Models;

namespace WebApi.Application.Interfaces;

public interface IAuthenticationService
{
    Task<AuthenticationResult> AuthenticateAsync(string username, string password, string? ipAddress, string? userAgent);
    Task<SessionInfo> CreateSessionAsync(int userId, string username, string? ipAddress, string? userAgent);
    Task<bool> LogoutAsync(string sessionToken, string? ipAddress, string? userAgent);
    Task<SessionInfo> ValidateSessionAsync(string sessionToken);
}
