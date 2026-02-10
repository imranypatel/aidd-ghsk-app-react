namespace WebApi.Application.Models;

public class SessionInfo
{
    public int? SessionId { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string? SessionToken { get; set; }
    public DateTime? ExpiresDate { get; set; }
    public bool IsValid { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }

    public static SessionInfo Valid(int sessionId, int userId, string username, string sessionToken, DateTime expiresDate)
    {
        return new SessionInfo
        {
            SessionId = sessionId,
            UserId = userId,
            Username = username,
            SessionToken = sessionToken,
            ExpiresDate = expiresDate,
            IsValid = true
        };
    }

    public static SessionInfo Invalid(string errorCode, string errorMessage)
    {
        return new SessionInfo
        {
            IsValid = false,
            ErrorCode = errorCode,
            ErrorMessage = errorMessage
        };
    }
}
