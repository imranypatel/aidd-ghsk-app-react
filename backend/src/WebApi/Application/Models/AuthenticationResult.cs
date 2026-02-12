namespace WebApi.Application.Models;

public class AuthenticationResult
{
    public bool IsAuthenticated { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string? PasswordHash { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }

    public static AuthenticationResult Success(int userId, string username, string passwordHash)
    {
        return new AuthenticationResult
        {
            IsAuthenticated = true,
            UserId = userId,
            Username = username,
            PasswordHash = passwordHash
        };
    }

    public static AuthenticationResult Failure(string errorCode, string errorMessage)
    {
        return new AuthenticationResult
        {
            IsAuthenticated = false,
            ErrorCode = errorCode,
            ErrorMessage = errorMessage
        };
    }
}
