using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Application.Interfaces;
using WebApi.Application.Models;
using WebApi.Controllers;
using WebApi.Models;
using Xunit;

namespace WebApi.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthenticationService> _authServiceMock;
    private readonly Mock<ILogger<AuthController>> _loggerMock;
    private readonly AuthController _controller;
    private readonly DefaultHttpContext _httpContext;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthenticationService>();
        _loggerMock = new Mock<ILogger<AuthController>>();
        _controller = new AuthController(_authServiceMock.Object, _loggerMock.Object);
        
        _httpContext = new DefaultHttpContext();
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = _httpContext
        };
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        // Arrange
        var request = new LoginRequest
        {
            Username = "Admin",
            Password = "Admin123@"
        };

        var authResult = AuthenticationResult.Success(1, "Admin", "hash");
        var sessionInfo = SessionInfo.Valid(123, 1, "Admin", "test-token", DateTime.UtcNow.AddMinutes(30));

        _authServiceMock.Setup(s => s.AuthenticateAsync(
                request.Username, 
                request.Password, 
                It.IsAny<string>(), 
                It.IsAny<string>()))
            .ReturnsAsync(authResult);

        _authServiceMock.Setup(s => s.CreateSessionAsync(
                1, 
                "Admin",
                It.IsAny<string>(), 
                It.IsAny<string>()))
            .ReturnsAsync(sessionInfo);

        // Act
        var result = await _controller.Login(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var apiResponse = okResult.Value.Should().BeOfType<ApiResponse<LoginResponse>>().Subject;
        apiResponse.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.User.Should().NotBeNull();
        apiResponse.Data.User!.Username.Should().Be("Admin");
        apiResponse.Data.Session.Should().NotBeNull();
        apiResponse.Data.Session!.Token.Should().Be("test-token");
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Username = "Admin",
            Password = "WrongPassword"
        };

        var authResult = AuthenticationResult.Failure("SEC-01-003", "Invalid credentials");

        _authServiceMock.Setup(s => s.AuthenticateAsync(
                request.Username, 
                request.Password, 
                It.IsAny<string>(), 
                It.IsAny<string>()))
            .ReturnsAsync(authResult);

        // Act
        var result = await _controller.Login(request);

        // Assert
        result.Should().NotBeNull();
        var unauthorizedResult = result.Result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        var apiResponse = unauthorizedResult.Value.Should().BeOfType<ApiResponse<LoginResponse>>().Subject;
        apiResponse.Success.Should().BeFalse();
        apiResponse.ErrorCode.Should().Be("SEC-01-003");
    }

    [Fact]
    public async Task Login_UserNotFound_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Username = "NonExistent",
            Password = "Password123"
        };

        var authResult = AuthenticationResult.Failure("SEC-01-001", "User not found");

        _authServiceMock.Setup(s => s.AuthenticateAsync(
                request.Username, 
                request.Password, 
                It.IsAny<string>(), 
                It.IsAny<string>()))
            .ReturnsAsync(authResult);

        // Act
        var result = await _controller.Login(request);

        // Assert
        result.Should().NotBeNull();
        var unauthorizedResult = result.Result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        var apiResponse = unauthorizedResult.Value.Should().BeOfType<ApiResponse<LoginResponse>>().Subject;
        apiResponse.Success.Should().BeFalse();
        apiResponse.ErrorCode.Should().Be("SEC-01-001");
    }

    [Fact]
    public async Task Login_SessionCreationFails_ReturnsInternalServerError()
    {
        // Arrange
        var request = new LoginRequest
        {
            Username = "Admin",
            Password = "Admin123@"
        };

        var authResult = AuthenticationResult.Success(1, "Admin", "hash");
        var sessionInfo = SessionInfo.Invalid("SYS-00-010", "Session creation failed");

        _authServiceMock.Setup(s => s.AuthenticateAsync(
                request.Username, 
                request.Password, 
                It.IsAny<string>(), 
                It.IsAny<string>()))
            .ReturnsAsync(authResult);

        _authServiceMock.Setup(s => s.CreateSessionAsync(
                1, 
                "Admin",
                It.IsAny<string>(), 
                It.IsAny<string>()))
            .ReturnsAsync(sessionInfo);

        // Act
        var result = await _controller.Login(request);

        // Assert
        result.Should().NotBeNull();
        var statusResult = result.Result.Should().BeOfType<ObjectResult>().Subject;
        statusResult.StatusCode.Should().Be(500);
    }

    [Fact]
    public async Task Logout_WithValidSession_ReturnsOk()
    {
        // Arrange
        _httpContext.Request.Cookies = new MockRequestCookieCollection(
            new Dictionary<string, string> { { "AIDD_SESSION", "test-token" } });

        _authServiceMock.Setup(s => s.LogoutAsync(
                "test-token", 
                It.IsAny<string>(), 
                It.IsAny<string>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Logout();

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var apiResponse = okResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
        apiResponse.Success.Should().BeTrue();
    }

    [Fact]
    public async Task Logout_WithoutSession_ReturnsBadRequest()
    {
        // Arrange
        _httpContext.Request.Cookies = new MockRequestCookieCollection(
            new Dictionary<string, string>());

        // Act
        var result = await _controller.Logout();

        // Assert
        result.Should().NotBeNull();
        var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var apiResponse = badRequestResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
        apiResponse.Success.Should().BeFalse();
        apiResponse.ErrorCode.Should().Be("SEC-02-001");
    }

    [Fact]
    public async Task ValidateSession_WithValidToken_ReturnsOk()
    {
        // Arrange
        _httpContext.Request.Cookies = new MockRequestCookieCollection(
            new Dictionary<string, string> { { "AIDD_SESSION", "valid-token" } });

        var sessionInfo = SessionInfo.Valid(123, 1, "Admin", "valid-token", DateTime.UtcNow.AddMinutes(15));

        _authServiceMock.Setup(s => s.ValidateSessionAsync("valid-token"))
            .ReturnsAsync(sessionInfo);

        // Act
        var result = await _controller.ValidateSession();

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var apiResponse = okResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
        apiResponse.Success.Should().BeTrue();
    }

    [Fact]
    public async Task ValidateSession_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        _httpContext.Request.Cookies = new MockRequestCookieCollection(
            new Dictionary<string, string> { { "AIDD_SESSION", "invalid-token" } });

        var sessionInfo = SessionInfo.Invalid("SEC-03-002", "Session expired");

        _authServiceMock.Setup(s => s.ValidateSessionAsync("invalid-token"))
            .ReturnsAsync(sessionInfo);

        // Act
        var result = await _controller.ValidateSession();

        // Assert
        result.Should().NotBeNull();
        var unauthorizedResult = result.Result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        var apiResponse = unauthorizedResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
        apiResponse.Success.Should().BeFalse();
        apiResponse.ErrorCode.Should().Be("SEC-03-002");
    }

    [Fact]
    public async Task ValidateSession_WithoutCookie_ReturnsUnauthorized()
    {
        // Arrange
        _httpContext.Request.Cookies = new MockRequestCookieCollection(
            new Dictionary<string, string>());

        // Act
        var result = await _controller.ValidateSession();

        // Assert
        result.Should().NotBeNull();
        var unauthorizedResult = result.Result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        var apiResponse = unauthorizedResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
        apiResponse.Success.Should().BeFalse();
        apiResponse.ErrorCode.Should().Be("SEC-03-001");
    }
}

// Helper class for mocking request cookies
public class MockRequestCookieCollection : IRequestCookieCollection
{
    private readonly Dictionary<string, string> _cookies;

    public MockRequestCookieCollection(Dictionary<string, string> cookies)
    {
        _cookies = cookies;
    }

    public string? this[string key] => _cookies.TryGetValue(key, out var value) ? value : null;
    public int Count => _cookies.Count;
    public ICollection<string> Keys => _cookies.Keys;
    public bool ContainsKey(string key) => _cookies.ContainsKey(key);
    public bool TryGetValue(string key, out string? value)
    {
        if (_cookies.TryGetValue(key, out var val))
        {
            value = val;
            return true;
        }
        value = null;
        return false;
    }
    public IEnumerator<KeyValuePair<string, string>> GetEnumerator() => _cookies.GetEnumerator();
    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => _cookies.GetEnumerator();
}
