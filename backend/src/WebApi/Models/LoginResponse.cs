namespace WebApi.Models;

public class LoginResponse
{
    public UserInfo? User { get; set; }
    public SessionDetails? Session { get; set; }

    public class UserInfo
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
    }

    public class SessionDetails
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
