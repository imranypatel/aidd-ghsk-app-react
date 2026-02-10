# Developer Quickstart: User Login and Logout

**Feature**: User Login and Logout  
**Date**: February 9, 2026  
**Audience**: Developers setting up local environment and implementing the feature

---

## Overview

This guide provides step-by-step instructions for setting up your local development environment, running the authentication feature, and understanding the implementation workflow. Follow this guide to get started with developing and testing the User Login and Logout feature.

---

## Prerequisites

### Required Software

| Tool | Version | Purpose | Download |
|------|---------|---------|----------|
| **Node.js** | 20.x LTS or higher | Frontend build and dev server | [nodejs.org](https://nodejs.org/) |
| **npm** | 10.x or higher | Frontend package management | Included with Node.js |
| **.NET SDK** | 10.0 or higher | Backend API development | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| **SQL Server** | 2025 or 2022 | Database | [microsoft.com/sql-server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |
| **VS Code** | Latest (recommended) | Code editor | [code.visualstudio.com](https://code.visualstudio.com/) |

### Optional Tools
- **SQL Server Management Studio (SSMS)** or **Azure Data Studio** for database management
- **Postman** or **Swagger UI** for API testing
- **Browser DevTools** for frontend debugging

### Required VS Code Extensions
- **C# Dev Kit** (Microsoft) — C# IntelliSense and debugging
- **ESLint** (Microsoft) — JavaScript/TypeScript linting
- **Prettier** (Prettier) — Code formatting
- **REST Client** or **Thunder Client** — API testing within VS Code

---

## Repository Setup

### 1. Clone the Repository

```powershell
# Clone the repository
git clone <repository-url> aidd-ghsk-app-react
cd aidd-ghsk-app-react

# Checkout the feature branch
git checkout 001-user-login-logout
```

### 2. Verify Directory Structure

Ensure your workspace has the following structure:

```
aidd-ghsk-app-react/
├── backend/               # ASP.NET Core Web API (to be created)
├── frontend/              # React + Vite SPA (to be created)
├── specs/                 # Feature specifications
│   └── 001-user-login-logout/
│       ├── spec.md        # Feature specification
│       ├── plan.md        # Implementation plan
│       ├── research.md    # Technology research
│       ├── data-model.md  # Database schema
│       ├── contracts/     # API contracts (OpenAPI, tState)
│       └── quickstart.md  # This file
└── .specify/              # SpecKit configuration and templates
```

**Note**: `backend/` and `frontend/` directories will be created during initial implementation phase.

---

## Database Setup

### 1. Create Database

Open SQL Server Management Studio (SSMS) or Azure Data Studio and connect to `PRECISION7520\SQLEXPRESSADV25` with credentials:
- **Server**: `PRECISION7520\SQLEXPRESSADV25`
- **User**: `sa`
- **Password**: `trandts@2013`

Then run:

```sql
-- Create database
CREATE DATABASE TRANTS_EMS_DEV;
GO

USE TRANTS_EMS_DEV;
GO
```

### 2. Run Database Migrations

**Option A: Using DbUp (Recommended)**

Once the backend project is created, migrations will run automatically on application startup. DbUp scripts are located in `backend/src/Database/Migrations/`.

```powershell
# Navigate to backend directory
cd backend

# Run the API (migrations execute automatically on startup)
dotnet run --project src/Api/Api.csproj
```

**Option B: Manual Migration (Development Only)**

If you need to run migrations manually:

```powershell
# Navigate to database migrations directory
cd backend/src/Database/Migrations

# Execute each script in order (001, 002, 003, ...)
# Use SSMS or Azure Data Studio to run scripts
```

### 3. Verify Database Schema

Run this query to verify tables and stored procedures were created:

```sql
USE TRANTS_EMS_DEV;
GO

-- Check tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
-- Expected: Sec_Users, Sec_Sessions, Audit_AuthEvents

-- Check stored procedures
SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE';
-- Expected: Sec_Users_Authenticate_User, Sec_Users_Create_Session, 
--           Sec_Users_End_Session, Sec_Users_Validate_Session, 
--           Audit_AuthEvents_Insert

-- Verify Admin user seed data
SELECT UserId, Username, FirstName, LastName, Email, IsActive, CreatedDate FROM Sec_Users;
-- Expected: UserId=1, Username='Admin', FirstName='System', LastName='Administrator', Email='admin@example.com', IsActive=1
```

### 4. Connection String Configuration

Update `backend/src/Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=PRECISION7520\\SQLEXPRESSADV25;Database=TRANTS_EMS_DEV;User Id=sa;Password=trandts@2013;TrustServerCertificate=True;Connection Timeout=30;"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  },
  "Jwt": {
    "SecretKey": "DEVELOPMENT_SECRET_KEY_CHANGE_IN_PRODUCTION_12345678",
    "Issuer": "AiddApp",
    "Audience": "AiddApp",
    "ExpirationMinutes": 30
  }
}
```

**Important**: This connection string uses SQL Server authentication with the specified credentials.

---

## Backend Setup (ASP.NET Core Web API)

### 1. Restore NuGet Packages

```powershell
cd backend
dotnet restore
```

### 2. Build the Solution

```powershell
dotnet build
```

Expected output:
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### 3. Generate Password Hash (First Time Setup)

Before running migrations, generate the BCrypt hash for the Admin password:

```powershell
# Navigate to utilities directory
cd utilities/PasswordHasher

# Run the password hasher utility
dotnet run

# When prompted, enter: Admin123@
# Copy the generated hash (starts with $2a$12$...)
```

The utility will output:
```
Password Hasher Utility
Enter password to hash: Admin123@
BCrypt Hash (12 rounds): $2a$12$abcdefghijklmnopqrstuvwxyz1234567890...
```

**Copy this hash** and update `backend/src/Database/Migrations/009_Seed_Admin_User.sql`:
```sql
INSERT INTO Sec_Users (Username, PasswordHash, FirstName, LastName, Email, Phone, Address, LastLoginDate, IsActive, CreatedDate, ModifiedDate)
VALUES ('Admin', '$2a$12$YOUR_GENERATED_HASH_HERE', 'System', 'Administrator', 'admin@example.com', NULL, NULL, NULL, 1, GETUTCDATE(), GETUTCDATE());
```

### 4. Run Unit Tests

```powershell
# Run all tests
dotnet test

# Run tests with detailed output
dotnet test --verbosity normal

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### 5. Start the API Development Server

```powershell
cd src/Api
dotnet run
```

Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### 6. Test API Endpoints with Swagger

Open browser and navigate to: `http://localhost:5000/swagger`

**Test Login Endpoint**:
1. Expand `POST /api/auth/login`
2. Click "Try it out"
3. Enter request body:
   ```json
   {
     "username": "Admin",
     "password": "Admin123@"
   }
   ```
4. Click "Execute"
5. Verify `200 OK` response with session token

---

## Frontend Setup (React + Vite)

### 1. Install npm Packages

```powershell
cd frontend
npm install
```

Expected packages:
- react 19.2.4
- react-dom 19.2.4
- react-router-dom 7.x
- @mui/material (latest)
- axios (latest)
- react-hook-form (latest)

### 2. Configure Environment Variables

Create `frontend/.env.development`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_LOG_LEVEL=debug
```

### 3. Start Development Server

```powershell
npm run dev
```

Expected output:
```
  VITE v7.3.1  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 4. Open Application in Browser

Navigate to: `http://localhost:3000/`

**Test Login Flow**:
1. Navigate to `/login`
2. Enter Username: `Admin`
3. Enter Password: `Admin123@`
4. Click "Login"
5. Verify redirect to authenticated dashboard

---

## Running Tests

### Backend Tests (xUnit)

```powershell
cd backend

# Run all tests
dotnet test

# Run specific test project
dotnet test tests/Application.Tests/Application.Tests.csproj

# Run tests with filter (e.g., only authentication tests)
dotnet test --filter "FullyQualifiedName~Authentication"

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Frontend Tests (Vitest + React Testing Library)

```powershell
cd frontend

# Run all tests (watch mode)
npm run test

# Run tests once (CI mode)
npm run test:ci

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- LoginPage.test.tsx
```

### End-to-End Tests (Playwright)

```powershell
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- auth.spec.ts
```

---

## Development Workflow (TDD)

Following constitutional mandate for Test-Driven Development (TDD), follow this workflow for all implementation:

### 1. Red Phase: Write Failing Test

**Example: AuthenticationService unit test**

```csharp
// tests/Application.Tests/AuthenticationServiceTests.cs
[Fact]
public async Task AuthenticateAsync_ValidCredentials_ReturnsSuccess()
{
    // Arrange
    var mockRepo = new Mock<IAuthenticationRepository>();
    mockRepo.Setup(r => r.AuthenticateUserAsync("Admin", "Admin123@", null, null))
        .ReturnsAsync(new TStateResult { Status = "OK", Data = new Dictionary<string, string> { ["USERID"] = "1" } });
    
    var service = new AuthenticationService(mockRepo.Object, _mockLogger.Object);
    
    // Act
    var result = await service.AuthenticateAsync("Admin", "Admin123@", null, null);
    
    // Assert
    Assert.True(result.IsAuthenticated);
    Assert.Equal(1, result.UserId);
}
```

Run test → **Expected: Test fails (service not implemented yet)**

### 2. Green Phase: Implement Minimum Code to Pass

```csharp
// src/Application/Services/AuthenticationService.cs
public async Task<AuthenticationResult> AuthenticateAsync(string username, string password, string? ipAddress, string? userAgent)
{
    // Validate password with BCrypt
    var tStateResult = await _repository.AuthenticateUserAsync(username, password, ipAddress, userAgent);
    
    if (tStateResult.IsSuccess && tStateResult.Data.ContainsKey("USERID"))
    {
        return AuthenticationResult.Success(
            int.Parse(tStateResult.Data["USERID"]),
            username
        );
    }
    
    return AuthenticationResult.Failure(tStateResult.ErrorCode, tStateResult.Message);
}
```

Run test → **Expected: Test passes**

### 3. Refactor Phase: Improve Code Quality

- Extract magic strings to constants
- Add error handling edge cases
- Improve readability
- Add integration tests

Run tests again → **Expected: All tests still pass**

### 4. Repeat for Each Requirement

---

## Common Development Tasks

### Add New Database Migration

1. Create new SQL script in `backend/src/Database/Migrations/`
2. Name with sequence number: `011_Add_Column_Example.sql`
3. Create corresponding rollback script in `backend/src/Database/Rollbacks/`
4. Test migration locally:
   ```powershell
   # Run API (migrations auto-execute)
   cd backend/src/Api
   dotnet run
   ```

### Add New API Endpoint

1. **Define contract in OpenAPI spec**: Update `specs/001-user-login-logout/contracts/auth-api.openapi.yaml`
2. **Write controller test** (Red phase):
   ```csharp
   // tests/Api.Tests/AuthControllerTests.cs
   [Fact]
   public async Task GetSession_ValidSession_Returns200() { /* ... */ }
   ```
3. **Implement controller action** (Green phase):
   ```csharp
   // src/Api/Controllers/AuthController.cs
   [HttpGet("session")]
   public async Task<IActionResult> GetSession() { /* ... */ }
   ```
4. **Refactor** (Refactor phase)
5. Test with Swagger UI

### Add New React Component

1. **Write component test** (Red phase):
   ```typescript
   // tests/components/LogoutButton.test.tsx
   it('calls logout service when clicked', () => { /* ... */ });
   ```
2. **Implement component** (Green phase):
   ```typescript
   // src/components/auth/LogoutButton.tsx
   export const LogoutButton: React.FC = () => { /* ... */ };
   ```
3. **Refactor** (Refactor phase)
4. Test in browser

---

## Debugging

### Backend Debugging (VS Code)

1. Open `backend/` folder in VS Code
2. Press `F5` or click "Run and Debug"
3. Select ".NET Core Launch (web)" configuration
4. Set breakpoints in controllers, services, or repositories
5. Trigger API call from frontend or Swagger

**Launch Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": ".NET Core Launch (web)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/src/Api/bin/Debug/net10.0/Api.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/Api",
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "sourceFileMap": {
        "/Views": "${workspaceFolder}/Views"
      }
    }
  ]
}
```

### Frontend Debugging (Browser DevTools)

1. Open application in Chrome/Edge: `http://localhost:5173/`
2. Open DevTools (F12)
3. Navigate to **Sources** tab
4. Set breakpoints in TypeScript files (via source maps)
5. Trigger code execution (e.g., click Login button)

### Database Debugging (SQL Server Profiler)

1. Open SQL Server Profiler
2. Start new trace on `AiddApp` database
3. Filter for `RPC:Completed` events (stored procedure calls)
4. Execute login flow
5. Review stored procedure execution with parameters and tState output

---

## Troubleshooting

### Issue: "Cannot connect to SQL Server"

**Symptoms**: API fails to start with connection error

**Solutions**:
1. Verify SQL Server is running:
   ```powershell
   Get-Service | Where-Object { $_.Name -like '*SQL*' -and $_.Name -like '*ADV25*' }
   ```
2. Check connection string in `appsettings.Development.json`:
   ```
   Server=PRECISION7520\SQLEXPRESSADV25;Database=TRANTS_EMS_DEV;User Id=sa;Password=trandts@2013
   ```
3. Test connection with SSMS or Azure Data Studio using the same credentials
4. Verify SQL Server Browser service is running (required for named instances)

### Issue: "BCrypt hash verification failed"

**Symptoms**: Login fails with 401 even with correct password

**Solutions**:
1. Verify Admin user seed data was inserted:
   ```sql
   SELECT PasswordHash FROM Sec_Users WHERE Username = 'Admin';
   ```
### Issue: "CORS error in browser console"

**Symptoms**: Frontend API calls blocked with CORS error

**Solutions**:
1. Add CORS policy in `Program.cs`:
   ```csharp
   builder.Services.AddCors(options =>
   {
       options.AddDefaultPolicy(policy =>
       {
           policy.WithOrigins("http://localhost:3000")
                 .AllowAnyHeader()
                 .AllowAnyMethod()
                 .AllowCredentials();
       });
   });
   ```
2. Apply CORS middleware:
   ```csharp
   app.UseCors();
   ```ly CORS middleware:
   ```csharp
   app.UseCors();
   ```

### Issue: "Session token not persisted across page refresh"

**Symptoms**: User logged out after browser refresh

**Solutions**:
1. Verify httpOnly cookie is set in response headers (check DevTools → Network → Response Headers)
2. Ensure `withCredentials: true` in axios configuration
3. Check `SameSite` attribute is `Strict` or `Lax` (not `None` for local development)

### Issue: "Tests failing with 'Cannot find module'"

**Symptoms**: Frontend tests fail with import errors

**Solutions**:
1. Verify `vite.config.ts` has correct test configuration
2. Run `npm install` to ensure all dependencies installed
3. Check `tsconfig.json` paths are configured correctly

---

## Architecture Overview

Understanding the architecture helps with navigation and implementation:

### Backend Layers (Strict Dependencies)

```
Controllers (HTTP) 
    ↓ (calls)
Application (Orchestration)
    ↓ (calls)
Infrastructure (Data Access)
    ↓ (calls)
Database (Stored Procedures)
```

**Key Points**:
- Controllers have NO business logic (thin)
- Application layer orchestrates use cases (AuthenticationService)
- Infrastructure layer executes stored procedures via Dapper (AuthenticationRepository)
- Database layer enforces integrity (stored procedures with tState)

### Frontend Architecture

```
Pages (LoginPage)
    ↓ (uses)
Components (LoginForm, LogoutButton)
    ↓ (uses)
Context (AuthContext)
    ↓ (uses)
Services (authService)
    ↓ (calls)
API Client (axios)
```

**Key Points**:
- Pages compose components
- Components use hooks (`useAuth`, `useSessionTimeout`)
- Context provides global state (user, isAuthenticated)
- Services handle API calls (authService.login, authService.logout)

---

## Key Files Reference

### Backend

| File Path | Purpose |
|-----------|---------|
| `src/Api/Controllers/AuthController.cs` | HTTP endpoints: Login, Logout, ValidateSession |
| `src/Application/Services/AuthenticationService.cs` | Business logic orchestration |
| `src/Infrastructure/Repositories/AuthenticationRepository.cs` | Dapper stored procedure execution |
| `src/Infrastructure/Data/TStateParser.cs` | Parse tState output from procedures |
| `src/Database/Migrations/009_Seed_Admin_User.sql` | Admin user seed data |
| `appsettings.Development.json` | Connection string, JWT secret, Serilog config |

### Frontend

| File Path | Purpose |
|-----------|---------|
| `src/components/auth/LoginPage.tsx` | Login page with form |
| `src/components/auth/LogoutButton.tsx` | Logout control |
| `src/context/AuthContext.tsx` | Global authentication state |
| `src/services/authService.ts` | API calls: login, logout, validateSession |
| `src/hooks/useAuth.ts` | Hook to access AuthContext |
| `src/hooks/useSessionTimeout.ts` | Idle timeout detection |
| `.env.development` | API base URL, log level |
| `vite.config.ts` | Vite configuration (port 3000) |

### Utilities

| File Path | Purpose |
|-----------|---------|
| `utilities/PasswordHasher/Program.cs` | Console utility to generate BCrypt password hashes |

---

## Next Steps After Setup

1. **Implement Database Migrations**: Create all 10 migration scripts in `backend/src/Database/Migrations/`
2. **Implement Backend Layers**: Start with Infrastructure (repositories), then Application (services), then Controllers
3. **Implement Frontend Components**: Start with AuthContext, then services, then components
4. **Write Tests**: Follow TDD workflow (Red-Green-Refactor) for all code
5. **Run E2E Tests**: Verify full login/logout/session expiration flow in Playwright

---

## Additional Resources

- **Feature Specification**: `specs/001-user-login-logout/spec.md`
- **Implementation Plan**: `specs/001-user-login-logout/plan.md`
- **Research Document**: `specs/001-user-login-logout/research.md`
- **Data Model**: `specs/001-user-login-logout/data-model.md`
- **API Contracts**: `specs/001-user-login-logout/contracts/auth-api.openapi.yaml`
- **tState Contracts**: `specs/001-user-login-logout/contracts/tstate-contracts.md`
- **Constitution**: `.specify/memory/constitution.md`

---

## Support

For questions or issues:
1. Check this quickstart guide
2. Review feature specification and contracts
3. Consult constitution for architectural guidance
4. Reach out to team lead or senior developer

---

**Happy coding! 🚀**
