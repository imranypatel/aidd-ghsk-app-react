namespace WebApi.Database;

public class MigrationRunner
{
    private readonly string _connectionString;

    public MigrationRunner(string connectionString)
    {
        _connectionString = connectionString;
    }

    public bool ExecuteMigrations()
    {
        var upgrader = DbUp.DeployChanges.To
            .SqlDatabase(_connectionString)
            .WithScriptsEmbeddedInAssembly(typeof(MigrationRunner).Assembly, script => script.Contains(".Migrations."))
            .LogToConsole()
            .Build();

        var result = upgrader.PerformUpgrade();

        if (!result.Successful)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Database migration failed: {result.Error}");
            Console.ResetColor();
            return false;
        }

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("Database migration successful!");
        Console.ResetColor();
        return true;
    }
}
