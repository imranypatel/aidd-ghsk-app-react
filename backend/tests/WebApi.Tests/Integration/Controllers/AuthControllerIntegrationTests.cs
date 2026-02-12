using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using WebApi.Models;
using Xunit;

namespace WebApi.Tests.Integration.Controllers;

/// <summary>
/// Integration tests for AuthController endpoints
/// T092: GET /api/auth/session - login, validate session (200), manually expire session, validate again (401)
/// </summary>
[Collection("Database")]
public class AuthControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly string _connectionString;
    private readonly SqlConnection _connection;

    public AuthControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found");

        _connection = new SqlConnection(_connectionString);
        _connection.Open();
    }

    [Fact]
    public async Task ValidateSession_AfterSuccessfulLogin_Returns200WithUserData()
    {
        // Arrange: Login to get session cookie
        var loginRequest = new LoginRequest
        {
            Username = "Admin",
            Password = "Admin123@"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResponse.EnsureSuccessStatusCode();

        // Extract session cookie
        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();
        setCookieHeader.Should().NotBeNull();
        var sessionToken = ExtractCookieValue(setCookieHeader!, "AIDD_SESSION");
        sessionToken.Should().NotBeNullOrEmpty();

        // Create request with cookie
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/auth/session");
        request.Headers.Add("Cookie", $"AIDD_SESSION={sessionToken}");

        // Act: Validate session
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<object>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();

        // Parse the data object to check userId and username
        var dataJson = JsonSerializer.Serialize(apiResponse.Data);
        dataJson.Should().Contain("\"userId\":1");
        dataJson.Should().Contain("\"username\":\"Admin\"");
    }

    [Fact]
    public async Task ValidateSession_WithExpiredSession_Returns401()
    {
        // Arrange: Login to get session
        var loginRequest = new LoginRequest
        {
            Username = "Admin",
            Password = "Admin123@"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResponse.EnsureSuccessStatusCode();

        // Extract session token
        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();
        var sessionToken = ExtractCookieValue(setCookieHeader!, "AIDD_SESSION");

        // Manually expire the session in the database
        await using var cmd = _connection.CreateCommand();
        cmd.CommandText = @"
            UPDATE Sec_Sessions 
            SET ExpiresDate = DATEADD(MINUTE, -1, GETUTCDATE())
            WHERE SessionToken = @SessionToken";
        cmd.Parameters.AddWithValue("@SessionToken", sessionToken);
        await cmd.ExecuteNonQueryAsync();

        // Create request with expired session cookie
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/auth/session");
        request.Headers.Add("Cookie", $"AIDD_SESSION={sessionToken}");

        // Act: Validate expired session
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<object>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeFalse();
        apiResponse.ErrorCode.Should().Be("SEC-02-002"); // Session expired error code
        apiResponse.Message.Should().Contain("expired");
    }

    [Fact]
    public async Task ValidateSession_WithAuthorizationHeader_Returns200()
    {
        // Arrange: Login to get session token
        var loginRequest = new LoginRequest
        {
            Username = "Admin",
            Password = "Admin123@"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResponse.EnsureSuccessStatusCode();

        // Extract session token
        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();
        var sessionToken = ExtractCookieValue(setCookieHeader!, "AIDD_SESSION");

        // Create request with Authorization Bearer header (E2E testing workaround)
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/auth/session");
        request.Headers.Add("Authorization", $"Bearer {sessionToken}");

        // Act: Validate session using Authorization header
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<object>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task ValidateSession_WithoutCookieOrHeader_Returns401()
    {
        // Arrange: No authentication provided
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/auth/session");

        // Act: Validate session without credentials
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<object>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeFalse();
        apiResponse.ErrorCode.Should().Be("SEC-03-001"); // No session cookie
    }

    /// <summary>
    /// Extract cookie value from Set-Cookie header
    /// </summary>
    private string ExtractCookieValue(string setCookieHeader, string cookieName)
    {
        // Format: "AIDD_SESSION=token; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1800"
        var parts = setCookieHeader.Split(';');
        var cookiePart = parts.FirstOrDefault(p => p.Trim().StartsWith($"{cookieName}="));
        if (cookiePart == null) return string.Empty;

        return cookiePart.Split('=')[1].Trim();
    }

    public void Dispose()
    {
        _connection?.Dispose();
        _client?.Dispose();
    }
}
