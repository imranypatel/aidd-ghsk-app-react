using FluentAssertions;
using Moq;
using WebApi.Infrastructure.Data;
using WebApi.Infrastructure.Interfaces;
using WebApi.Infrastructure.Repositories;
using Xunit;

namespace WebApi.Tests.Infrastructure.Repositories;

public class AuthenticationRepositoryTests
{
    private readonly Mock<IDbConnectionFactory> _connectionFactoryMock;
    private readonly TStateParser _parser;
    private readonly AuthenticationRepository _repository;

    public AuthenticationRepositoryTests()
    {
        _connectionFactoryMock = new Mock<IDbConnectionFactory>();
        _parser = new TStateParser();

        _repository = new AuthenticationRepository(
            _connectionFactoryMock.Object,
            _parser);
    }

    [Fact]
    public void Constructor_WithNullFactory_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            new AuthenticationRepository(null!, _parser));
    }

    [Fact]
    public void Constructor_WithNullParser_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            new AuthenticationRepository(_connectionFactoryMock.Object, null!));
    }

    [Fact]
    public void Repository_ImplementsInterface()
    {
        // Assert
        _repository.Should().BeAssignableTo<IAuthenticationRepository>();
    }

    // Note: For actual database interaction tests, see Integration tests
    // Unit tests for repository would require complex mocking of Dapper
    // which is better tested through integration tests
}
