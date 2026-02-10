using FluentAssertions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using WebApi.Infrastructure.Data;
using WebApi.Infrastructure.Repositories;
using Xunit;

namespace WebApi.Tests.Integration.Repositories;

/// <summary>
/// Integration tests for AuthenticationRepository
/// Tests ValidateSessionAsync method with real database operations
/// T088: Create session, validate active session (success), validate expired session (failure), validate non-existent token (failure)
/// </summary>
[Collection("Database")]
public class AuthenticationRepositoryIntegrationTests : IDisposable
{
    private readonly string _connectionString;
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly TStateParser _parser;
    private readonly AuthenticationRepository _repository;
    private readonly SqlConnection _connection;

    public AuthenticationRepositoryIntegrationTests()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found");

        _connectionFactory = new DbConnectionFactory(_connectionString);
        _parser = new TStateParser();
        _repository = new AuthenticationRepository(_connectionFactory, _parser);

        // Keep a connection open for test data manipulation
        _connection = new SqlConnection(_connectionString);
        _connection.Open();
    }

    [Fact]
    public async Task ValidateSessionAsync_WithActiveSession_ReturnsSuccessWithUserData()
    {
        // Arrange: Create an active session for the Admin user (UserId = 1)
        var sessionToken = $"test-session-{Guid.NewGuid()}";
        var expiresDate = DateTime.UtcNow.AddMinutes(30);

        // Insert session directly into database
        await using var cmd = _connection.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO Sec_Sessions (UserId, SessionToken, CreatedDate, ExpiresDate, IsActive)
            VALUES (1, @SessionToken, GETUTCDATE(), @ExpiresDate, 1)";
        cmd.Parameters.AddWithValue("@SessionToken", sessionToken);
        cmd.Parameters.AddWithValue("@ExpiresDate", expiresDate);
        await cmd.ExecuteNonQueryAsync();

        // Act: Validate the session using repository
        var result = await _repository.ValidateSessionAsync(sessionToken);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be("OK");
        result.ErrorCode.Should().Be("00000");
        result.Data.Should().ContainKey("USERID");
        result.Data["USERID"].Should().Be("1");
        result.Data.Should().ContainKey("USERNAME");
        result.Data["USERNAME"].Should().Be("Admin");

        // Cleanup
        cmd.CommandText = "DELETE FROM Sec_Sessions WHERE SessionToken = @SessionToken";
        await cmd.ExecuteNonQueryAsync();
    }

    [Fact]
    public async Task ValidateSessionAsync_WithExpiredSession_ReturnsError()
    {
        // Arrange: Create an expired session
        var sessionToken = $"test-session-expired-{Guid.NewGuid()}";
        var expiredDate = DateTime.UtcNow.AddMinutes(-1); // Expired 1 minute ago

        // Insert expired session directly into database
        await using var cmd = _connection.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO Sec_Sessions (UserId, SessionToken, CreatedDate, ExpiresDate, IsActive)
            VALUES (1, @SessionToken, GETUTCDATE(), @ExpiresDate, 1)";
        cmd.Parameters.AddWithValue("@SessionToken", sessionToken);
        cmd.Parameters.AddWithValue("@ExpiresDate", expiredDate);
        await cmd.ExecuteNonQueryAsync();

        // Act: Validate the expired session
        var result = await _repository.ValidateSessionAsync(sessionToken);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be("ERR");
        result.ErrorCode.Should().Be("SEC-02-002"); // Actual error code from stored procedure
        result.Message.Should().Contain("expired");

        // Cleanup
        cmd.CommandText = "DELETE FROM Sec_Sessions WHERE SessionToken = @SessionToken";
        await cmd.ExecuteNonQueryAsync();
    }

    [Fact]
    public async Task ValidateSessionAsync_WithNonExistentToken_ReturnsError()
    {
        // Arrange: Use a token that doesn't exist in database
        var nonExistentToken = $"non-existent-{Guid.NewGuid()}";

        // Act: Validate the non-existent session
        var result = await _repository.ValidateSessionAsync(nonExistentToken);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be("ERR");
        result.ErrorCode.Should().Be("SEC-02-001"); // Actual error code from stored procedure
        result.Message.Should().Contain("does not exist");
    }

    [Fact]
    public async Task ValidateSessionAsync_WithInactiveSession_ReturnsError()
    {
        // Arrange: Create an inactive session (IsActive = 0)
        var sessionToken = $"test-session-inactive-{Guid.NewGuid()}";
        var expiresDate = DateTime.UtcNow.AddMinutes(30); // Not expired, but inactive

        // Insert inactive session directly into database
        await using var cmd = _connection.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO Sec_Sessions (UserId, SessionToken, CreatedDate, ExpiresDate, IsActive)
            VALUES (1, @SessionToken, GETUTCDATE(), @ExpiresDate, 0)"; // IsActive = 0
        cmd.Parameters.AddWithValue("@SessionToken", sessionToken);
        cmd.Parameters.AddWithValue("@ExpiresDate", expiresDate);
        await cmd.ExecuteNonQueryAsync();

        // Act: Validate the inactive session
        var result = await _repository.ValidateSessionAsync(sessionToken);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be("ERR");
        result.ErrorCode.Should().Be("SEC-02-003"); // Actual error code from stored procedure
        result.Message.Should().Contain("terminated");

        // Cleanup
        cmd.CommandText = "DELETE FROM Sec_Sessions WHERE SessionToken = @SessionToken";
        await cmd.ExecuteNonQueryAsync();
    }

    public void Dispose()
    {
        _connection?.Dispose();
    }
}
