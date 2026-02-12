using System.Data;
using Dapper;
using WebApi.Infrastructure.Data;
using WebApi.Infrastructure.Interfaces;

namespace WebApi.Infrastructure.Repositories;

public class AuthenticationRepository : IAuthenticationRepository
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly TStateParser _tStateParser;

    public AuthenticationRepository(IDbConnectionFactory connectionFactory, TStateParser tStateParser)
    {
        _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
        _tStateParser = tStateParser ?? throw new ArgumentNullException(nameof(tStateParser));
    }

    public async Task<TStateResult> AuthenticateUserAsync(string username, string? ipAddress, string? userAgent)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        var parameters = new DynamicParameters();
        parameters.Add("@Username", username, DbType.String);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        await connection.ExecuteAsync(
            "Sec_Users_Authenticate_User",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        var tState = parameters.Get<string>("@tState");
        return _tStateParser.Parse(tState);
    }

    public async Task<TStateResult> CreateSessionAsync(int userId, string sessionToken, string? ipAddress, string? userAgent)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        var parameters = new DynamicParameters();
        parameters.Add("@UserId", userId, DbType.Int32);
        parameters.Add("@SessionToken", sessionToken, DbType.String);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        await connection.ExecuteAsync(
            "Sec_Users_Create_Session",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        var tState = parameters.Get<string>("@tState");
        return _tStateParser.Parse(tState);
    }

    public async Task<TStateResult> EndSessionAsync(string sessionToken, string? ipAddress, string? userAgent)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        var parameters = new DynamicParameters();
        parameters.Add("@SessionToken", sessionToken, DbType.String);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        await connection.ExecuteAsync(
            "Sec_Users_End_Session",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        var tState = parameters.Get<string>("@tState");
        return _tStateParser.Parse(tState);
    }

    public async Task<TStateResult> ValidateSessionAsync(string sessionToken)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        var parameters = new DynamicParameters();
        parameters.Add("@SessionToken", sessionToken, DbType.String);
        parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

        await connection.ExecuteAsync(
            "Sec_Users_Validate_Session",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        var tState = parameters.Get<string>("@tState");
        return _tStateParser.Parse(tState);
    }
}
