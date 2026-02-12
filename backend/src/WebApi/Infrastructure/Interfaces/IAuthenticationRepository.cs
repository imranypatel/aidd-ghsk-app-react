using WebApi.Infrastructure.Data;

namespace WebApi.Infrastructure.Interfaces;

public interface IAuthenticationRepository
{
    Task<TStateResult> AuthenticateUserAsync(string username, string? ipAddress, string? userAgent);
    Task<TStateResult> CreateSessionAsync(int userId, string sessionToken, string? ipAddress, string? userAgent);
    Task<TStateResult> EndSessionAsync(string sessionToken, string? ipAddress, string? userAgent);
    Task<TStateResult> ValidateSessionAsync(string sessionToken);
}
