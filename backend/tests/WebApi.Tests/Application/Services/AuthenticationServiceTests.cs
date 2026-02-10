using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using WebApi.Application.Services;
using WebApi.Infrastructure.Data;
using WebApi.Infrastructure.Interfaces;
using Xunit;

namespace WebApi.Tests.Application.Services;

public class AuthenticationServiceTests
{
    private readonly Mock<IAuthenticationRepository> _repositoryMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<AuthenticationService>> _loggerMock;
    private readonly AuthenticationService _service;

    public AuthenticationServiceTests()
    {
        _repositoryMock = new Mock<IAuthenticationRepository>();
        _configurationMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<AuthenticationService>>();

        // Setup JWT configuration
        var jwtSection = new Mock<IConfigurationSection>();
        jwtSection.Setup(s => s["SecretKey"]).Returns("DEVELOPMENT_SECRET_KEY_CHANGE_IN_PRODUCTION_12345678901234567890");
        jwtSection.Setup(s => s["Issuer"]).Returns("AiddApp");
        jwtSection.Setup(s => s["Audience"]).Returns("AiddApp");
        jwtSection.Setup(s => s["ExpirationMinutes"]).Returns("30");

        _configurationMock.Setup(c => c.GetSection("Jwt")).Returns(jwtSection.Object);

        _service = new AuthenticationService(
            _repositoryMock.Object,
            _configurationMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task AuthenticateAsync_ValidCredentials_ReturnsSuccessResult()
    {
        // Arrange
        var username = "Admin";
        var password = "Admin123@";
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password, 12);
        
        var authResult = new TStateResult
        {
            Status = "OK",
            ErrorCode = "00000",
            Data = new Dictionary<string, string>
            {
                { "USERID", "1" },
                { "PASSWORDHASH", passwordHash }
            },
            Message = "Success"
        };

        _repositoryMock.Setup(r => r.AuthenticateUserAsync(username, It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(authResult);

        // Act
        var result = await _service.AuthenticateAsync(username, password, "127.0.0.1", "TestAgent");

        // Assert
        result.Should().NotBeNull();
        result.IsAuthenticated.Should().BeTrue();
        result.UserId.Should().Be(1);
        result.Username.Should().Be(username);
        result.ErrorCode.Should().BeNull();
    }

    [Fact]
    public async Task AuthenticateAsync_InvalidPassword_ReturnsFailureResult()
    {
        // Arrange
        var username = "Admin";
        var password = "WrongPassword";
        var correctPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123@", 12);
        
        var authResult = new TStateResult
        {
            Status = "OK",
            ErrorCode = "00000",
            Data = new Dictionary<string, string>
            {
                { "USERID", "1" },
                { "PASSWORDHASH", correctPasswordHash }
            },
            Message = "Success"
        };

        _repositoryMock.Setup(r => r.AuthenticateUserAsync(username, It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(authResult);

        // Act
        var result = await _service.AuthenticateAsync(username, password, "127.0.0.1", "TestAgent");

        // Assert
        result.Should().NotBeNull();
        result.IsAuthenticated.Should().BeFalse();
        result.ErrorCode.Should().Be("SEC-01-003");
        result.ErrorMessage.Should().Be("Invalid credentials");
    }

    [Fact]
    public async Task AuthenticateAsync_UserNotFound_ReturnsFailureResult()
    {
        // Arrange
        var username = "NonExistentUser";
        var password = "Password123";
        
        var authResult = new TStateResult
        {
            Status = "ERR",
            ErrorCode = "SEC-01-001",
            Message = "User not found"
        };

        _repositoryMock.Setup(r => r.AuthenticateUserAsync(username, It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(authResult);

        // Act
        var result = await _service.AuthenticateAsync(username, password, "127.0.0.1", "TestAgent");

        // Assert
        result.Should().NotBeNull();
        result.IsAuthenticated.Should().BeFalse();
        result.ErrorCode.Should().Be("SEC-01-001");
        result.ErrorMessage.Should().Be("User not found");
    }

    [Fact]
    public async Task CreateSessionAsync_ValidUserId_ReturnsSessionInfo()
    {
        // Arrange
        var userId = 1;
        var expiry = DateTime.UtcNow.AddMinutes(30);
        
        var sessionResult = new TStateResult
        {
            Status = "OK",
            ErrorCode = "00000",
            Data = new Dictionary<string, string>
            {
                { "SESSIONID", "123" },
                { "EXPIRY", expiry.ToString("yyyy-MM-dd HH:mm:ss") }
            },
            Message = "Session created"
        };

        _repositoryMock.Setup(r => r.CreateSessionAsync(userId, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(sessionResult);

        // Act
        var result = await _service.CreateSessionAsync(userId, "TestUser", "127.0.0.1", "TestAgent");

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue();
        result.SessionId.Should().Be(123);
        result.UserId.Should().Be(userId);
        result.SessionToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LogoutAsync_ValidToken_ReturnsTrue()
    {
        // Arrange
        var sessionToken = "test-token";
        
        var logoutResult = new TStateResult
        {
            Status = "OK",
            ErrorCode = "00000",
            Message = "Session ended"
        };

        _repositoryMock.Setup(r => r.EndSessionAsync(sessionToken, It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(logoutResult);

        // Act
        var result = await _service.LogoutAsync(sessionToken, "127.0.0.1", "TestAgent");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task LogoutAsync_InvalidToken_ReturnsFalse()
    {
        // Arrange
        var sessionToken = "invalid-token";
        
        var logoutResult = new TStateResult
        {
            Status = "ERR",
            ErrorCode = "SEC-02-001",
            Message = "Session not found"
        };

        _repositoryMock.Setup(r => r.EndSessionAsync(sessionToken, It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(logoutResult);

        // Act
        var result = await _service.LogoutAsync(sessionToken, "127.0.0.1", "TestAgent");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateSessionAsync_ValidToken_ReturnsValidSession()
    {
        // Arrange
        var sessionToken = "valid-token";
        var expiry = DateTime.UtcNow.AddMinutes(15);
        
        var validationResult = new TStateResult
        {
            Status = "OK",
            ErrorCode = "00000",
            Data = new Dictionary<string, string>
            {
                { "USERID", "1" },
                { "USERNAME", "Admin" },
                { "EXPIRY", expiry.ToString("yyyy-MM-dd HH:mm:ss") }
            },
            Message = "Session valid"
        };

        _repositoryMock.Setup(r => r.ValidateSessionAsync(sessionToken))
            .ReturnsAsync(validationResult);

        // Act
        var result = await _service.ValidateSessionAsync(sessionToken);

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue();
        result.UserId.Should().Be(1);
    }

    [Fact]
    public async Task ValidateSessionAsync_ExpiredToken_ReturnsInvalidSession()
    {
        // Arrange
        var sessionToken = "expired-token";
        
        var validationResult = new TStateResult
        {
            Status = "ERR",
            ErrorCode = "SEC-03-002",
            Message = "Session expired"
        };

        _repositoryMock.Setup(r => r.ValidateSessionAsync(sessionToken))
            .ReturnsAsync(validationResult);

        // Act
        var result = await _service.ValidateSessionAsync(sessionToken);

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeFalse();
        result.ErrorCode.Should().Be("SEC-03-002");
    }
}
