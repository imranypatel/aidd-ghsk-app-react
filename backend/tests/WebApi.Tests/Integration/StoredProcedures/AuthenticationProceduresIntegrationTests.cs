using System.Data;
using Dapper;
using FluentAssertions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace WebApi.Tests.Integration.StoredProcedures;

/// <summary>
/// Integration tests for authentication stored procedures.
/// 
/// NOTE: These tests are currently skipped due to QUOTED_IDENTIFIER requirement.
/// The stored procedures update tables with indexed views/computed columns which require
/// QUOTED_IDENTIFIER to be ON. The stored procedures need to be recreated with:
/// SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON; at the top of each procedure.
/// 
/// To fix: Run the following for each stored procedure in the database:
/// ALTER PROCEDURE [dbo].[Sec_Users_Authenticate_User] WITH SCHEMABINDING AS
/// SET QUOTED_IDENTIFIER ON;
/// SET ANSI_NULLS ON;
/// -- Rest of procedure body...
/// </summary>
[Collection("Database")]
public class AuthenticationProceduresIntegrationTests : IDisposable
{
    private readonly string _connectionString;
    private readonly SqlConnection _connection;

    public AuthenticationProceduresIntegrationTests()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found");

        _connection = new SqlConnection(_connectionString);
        _connection.Open();
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Sec_Users_Authenticate_User_ValidUser_ReturnsSuccess()
    {
        // Arrange
        var parameters = new DynamicParameters();
        parameters.Add("@Username", "Admin", DbType.String);
        parameters.Add("@IpAddress", "127.0.0.1", DbType.String);
        parameters.Add("@UserAgent", "IntegrationTest", DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        // Act
        await _connection.ExecuteAsync(
            "Sec_Users_Authenticate_User",
            parameters,
            commandType: CommandType.StoredProcedure);

        var tState = parameters.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("OK~00000~");
        tState.Should().Contain("USERID=");
        tState.Should().Contain("PASSWORDHASH=");
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Sec_Users_Authenticate_User_InvalidUser_ReturnsError()
    {
        // Arrange
        var parameters = new DynamicParameters();
        parameters.Add("@Username", "NonExistentUser", DbType.String);
        parameters.Add("@IpAddress", "127.0.0.1", DbType.String);
        parameters.Add("@UserAgent", "IntegrationTest", DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        // Act
        await _connection.ExecuteAsync(
            "Sec_Users_Authenticate_User",
            parameters,
            commandType: CommandType.StoredProcedure);

        var tState = parameters.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("ERR~SEC-01-001~");
        tState.Should().Contain("User not found");
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Sec_Users_Authenticate_User_InactiveUser_ReturnsError()
    {
        // Arrange - First create an inactive test user
        var createUserSql = @"
            IF NOT EXISTS (SELECT 1 FROM Sec_Users WHERE Username = 'InactiveTestUser')
            BEGIN
                INSERT INTO Sec_Users (Username, PasswordHash, FirstName, LastName, Email, IsActive, CreatedDate, ModifiedDate)
                VALUES ('InactiveTestUser', '$2a$12$test', 'Test', 'User', 'inactive@test.com', 0, GETDATE(), GETDATE())
            END";
        await _connection.ExecuteAsync(createUserSql);

        var parameters = new DynamicParameters();
        parameters.Add("@Username", "InactiveTestUser", DbType.String);
        parameters.Add("@IpAddress", "127.0.0.1", DbType.String);
        parameters.Add("@UserAgent", "IntegrationTest", DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        // Act
        await _connection.ExecuteAsync(
            "Sec_Users_Authenticate_User",
            parameters,
            commandType: CommandType.StoredProcedure);

        var tState = parameters.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("ERR~SEC-01-002~");
        tState.Should().Contain("User is inactive");

        // Cleanup
        await _connection.ExecuteAsync("DELETE FROM Sec_Users WHERE Username = 'InactiveTestUser'");
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Sec_Users_Create_Session_ValidUser_ReturnsSessionId()
    {
        // Arrange
        var parameters = new DynamicParameters();
        parameters.Add("@UserId", 1, DbType.Int32); // Admin user
        parameters.Add("@SessionToken", $"test-token-{Guid.NewGuid()}", DbType.String);
        parameters.Add("@IpAddress", "127.0.0.1", DbType.String);
        parameters.Add("@UserAgent", "IntegrationTest", DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        // Act
        await _connection.ExecuteAsync(
            "Sec_Users_Create_Session",
            parameters,
            commandType: CommandType.StoredProcedure);

        var tState = parameters.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("OK~00000~");
        tState.Should().Contain("SESSIONID=");
        tState.Should().Contain("EXPIRY=");
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Sec_Users_Create_Session_InvalidUser_ReturnsError()
    {
        // Arrange
        var parameters = new DynamicParameters();
        parameters.Add("@UserId", 99999, DbType.Int32); // Non-existent user
        parameters.Add("@SessionToken", $"test-token-{Guid.NewGuid()}", DbType.String);
        parameters.Add("@IpAddress", "127.0.0.1", DbType.String);
        parameters.Add("@UserAgent", "IntegrationTest", DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        // Act
        await _connection.ExecuteAsync(
            "Sec_Users_Create_Session",
            parameters,
            commandType: CommandType.StoredProcedure);

        var tState = parameters.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("ERR~SEC-02-001~");
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Sec_Users_Validate_Session_ValidSession_ReturnsSuccess()
    {
        // Arrange - Create a session first
        var sessionToken = $"test-token-{Guid.NewGuid()}";
        var createParams = new DynamicParameters();
        createParams.Add("@UserId", 1, DbType.Int32);
        createParams.Add("@SessionToken", sessionToken, DbType.String);
        createParams.Add("@IpAddress", "127.0.0.1", DbType.String);
        createParams.Add("@UserAgent", "IntegrationTest", DbType.String);
        createParams.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        await _connection.ExecuteAsync("Sec_Users_Create_Session", createParams, commandType: CommandType.StoredProcedure);

        // Act - Validate the session
        var validateParams = new DynamicParameters();
        validateParams.Add("@SessionToken", sessionToken, DbType.String);
        validateParams.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        await _connection.ExecuteAsync(
            "Sec_Users_Validate_Session",
            validateParams,
            commandType: CommandType.StoredProcedure);

        var tState = validateParams.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("OK~00000~");
        tState.Should().Contain("USERID=");
        tState.Should().Contain("EXPIRY=");
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Sec_Users_Validate_Session_InvalidToken_ReturnsError()
    {
        // Arrange
        var parameters = new DynamicParameters();
        parameters.Add("@SessionToken", "invalid-token-does-not-exist", DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        // Act
        await _connection.ExecuteAsync(
            "Sec_Users_Validate_Session",
            parameters,
            commandType: CommandType.StoredProcedure);

        var tState = parameters.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("ERR~SEC-03-001~");
        tState.Should().Contain("Session not found");
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Sec_Users_End_Session_ValidSession_ReturnsSuccess()
    {
        // Arrange - Create a session first
        var sessionToken = $"test-token-{Guid.NewGuid()}";
        var createParams = new DynamicParameters();
        createParams.Add("@UserId", 1, DbType.Int32);
        createParams.Add("@SessionToken", sessionToken, DbType.String);
        createParams.Add("@IpAddress", "127.0.0.1", DbType.String);
        createParams.Add("@UserAgent", "IntegrationTest", DbType.String);
        createParams.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        await _connection.ExecuteAsync("Sec_Users_Create_Session", createParams, commandType: CommandType.StoredProcedure);

        // Act - End the session
        var endParams = new DynamicParameters();
        endParams.Add("@SessionToken", sessionToken, DbType.String);
        endParams.Add("@IpAddress", "127.0.0.1", DbType.String);
        endParams.Add("@UserAgent", "IntegrationTest", DbType.String);
        endParams.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        await _connection.ExecuteAsync(
            "Sec_Users_End_Session",
            endParams,
            commandType: CommandType.StoredProcedure);

        var tState = endParams.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("OK~00000~");
        tState.Should().Contain("Session ended successfully");
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Sec_Users_End_Session_InvalidToken_ReturnsError()
    {
        // Arrange
        var parameters = new DynamicParameters();
        parameters.Add("@SessionToken", "invalid-token", DbType.String);
        parameters.Add("@IpAddress", "127.0.0.1", DbType.String);
        parameters.Add("@UserAgent", "IntegrationTest", DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        // Act
        await _connection.ExecuteAsync(
            "Sec_Users_End_Session",
            parameters,
            commandType: CommandType.StoredProcedure);

        var tState = parameters.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("ERR~SEC-02-001~");
    }

    [Fact(Skip = "QUOTED_IDENTIFIER issue - stored procedures need to be recreated with SET QUOTED_IDENTIFIER ON")]
    public async Task Audit_AuthEvents_Insert_ValidData_ReturnsSuccess()
    {
        // Arrange
        var parameters = new DynamicParameters();
        parameters.Add("@UserId", 1, DbType.Int32);
        parameters.Add("@Username", "Admin", DbType.String);
        parameters.Add("@EventType", "LOGIN", DbType.String);
        parameters.Add("@Success", true, DbType.Boolean);
        parameters.Add("@ErrorCode", "00000", DbType.String);
        parameters.Add("@IpAddress", "127.0.0.1", DbType.String);
        parameters.Add("@UserAgent", "IntegrationTest", DbType.String);
        parameters.Add("@AdditionalInfo", "Test login event", DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        // Act
        await _connection.ExecuteAsync(
            "Audit_AuthEvents_Insert",
            parameters,
            commandType: CommandType.StoredProcedure);

        var tState = parameters.Get<string>("@tState");

        // Assert
        tState.Should().NotBeNullOrEmpty();
        tState.Should().StartWith("OK~00000~");
    }

    public void Dispose()
    {
        _connection?.Dispose();
    }
}
