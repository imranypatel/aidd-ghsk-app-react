using FluentAssertions;
using WebApi.Infrastructure.Data;
using Xunit;

namespace WebApi.Tests.Infrastructure.Data;

public class TStateParserTests
{
    private readonly TStateParser _parser;

    public TStateParserTests()
    {
        _parser = new TStateParser();
    }

    [Fact]
    public void Parse_ValidSuccessResponse_ReturnsSuccessResult()
    {
        // Arrange
        var tState = "OK~00000~Sec_Users_Authenticate_User~USERID=1|PASSWORDHASH=$2a$12$abc~Login successful";

        // Act
        var result = _parser.Parse(tState);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be("OK");
        result.ErrorCode.Should().Be("00000");
        result.ProcedureName.Should().Be("Sec_Users_Authenticate_User");
        result.Message.Should().Be("Login successful");
        result.IsSuccess.Should().BeTrue();
        result.IsError.Should().BeFalse();
        result.Data.Should().ContainKey("USERID");
        result.Data["USERID"].Should().Be("1");
        result.Data.Should().ContainKey("PASSWORDHASH");
        result.Data["PASSWORDHASH"].Should().Be("$2a$12$abc");
    }

    [Fact]
    public void Parse_ValidErrorResponse_ReturnsErrorResult()
    {
        // Arrange
        var tState = "ERR~SEC-01-001~Sec_Users_Authenticate_User~N/A~User not found";

        // Act
        var result = _parser.Parse(tState);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be("ERR");
        result.ErrorCode.Should().Be("SEC-01-001");
        result.ProcedureName.Should().Be("Sec_Users_Authenticate_User");
        result.Message.Should().Be("User not found");
        result.IsSuccess.Should().BeFalse();
        result.IsError.Should().BeTrue();
        result.Data.Should().BeEmpty();
    }

    [Fact]
    public void Parse_MultipleDataFields_ParsesAllCorrectly()
    {
        // Arrange
        var tState = "OK~00000~Test_Procedure~SESSIONID=123|USERID=456|EXPIRY=2026-02-10 14:00:00~Success";

        // Act
        var result = _parser.Parse(tState);

        // Assert
        result.Data.Should().HaveCount(3);
        result.Data["SESSIONID"].Should().Be("123");
        result.Data["USERID"].Should().Be("456");
        result.Data["EXPIRY"].Should().Be("2026-02-10 14:00:00");
    }

    [Fact]
    public void Parse_DataFieldWithEqualsSign_ParsesCorrectly()
    {
        // Arrange
        var tState = "OK~00000~Test~KEY=VALUE=WITH=EQUALS~Success";

        // Act
        var result = _parser.Parse(tState);

        // Assert
        result.Data["KEY"].Should().Be("VALUE=WITH=EQUALS");
    }

    [Fact]
    public void Parse_NullTState_ReturnsError()
    {
        // Act
        var result = _parser.Parse(null!);

        // Assert
        result.Status.Should().Be("ERR");
        result.ErrorCode.Should().Be("SYS-00-001");
        result.IsError.Should().BeTrue();
    }

    [Fact]
    public void Parse_EmptyTState_ReturnsError()
    {
        // Act
        var result = _parser.Parse(string.Empty);

        // Assert
        result.Status.Should().Be("ERR");
        result.ErrorCode.Should().Be("SYS-00-001");
        result.IsError.Should().BeTrue();
    }

    [Fact]
    public void Parse_InvalidFormat_ReturnsError()
    {
        // Arrange
        var tState = "INVALID~FORMAT";

        // Act
        var result = _parser.Parse(tState);

        // Assert
        result.Status.Should().Be("ERR");
        result.ErrorCode.Should().Be("SYS-00-002");
        result.IsError.Should().BeTrue();
    }

    [Fact]
    public void Parse_NAData_ReturnsEmptyDataDictionary()
    {
        // Arrange
        var tState = "ERR~SEC-01-002~Test_Procedure~N/A~Error message";

        // Act
        var result = _parser.Parse(tState);

        // Assert
        result.Data.Should().BeEmpty();
    }

    [Fact]
    public void Parse_EmptyDataSection_ReturnsEmptyDataDictionary()
    {
        // Arrange
        var tState = "OK~00000~Test_Procedure~~Success";

        // Act
        var result = _parser.Parse(tState);

        // Assert
        result.Data.Should().BeEmpty();
    }

    [Fact]
    public void Parse_MessageWithPipeCharacter_PreservesMessage()
    {
        // Arrange - Use pipe instead of tilde since tilde is the delimiter
        var tState = "ERR~SEC-01-001~Test~N/A~Message with | pipe character";

        // Act
        var result = _parser.Parse(tState);

        // Assert
        result.Message.Should().Be("Message with | pipe character");
    }
}
