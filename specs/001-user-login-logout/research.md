# Phase 0: Research & Technology Decisions

**Feature**: User Login and Logout  
**Date**: February 9, 2026  
**Status**: Complete

---

## Research Tasks

This document consolidates research findings for all technical unknowns identified during Technical Context evaluation. Each section documents decisions, rationale, alternatives considered, and constitutional alignment.

---

## 1. Session Token Storage Strategy (Client-Side)

### Decision
**Use httpOnly cookies for session token storage** with localStorage as fallback for environments where cookies are restricted.

### Rationale
- **Security**: httpOnly cookies are not accessible via JavaScript, providing protection against XSS attacks
- **Automatic transmission**: Cookies are automatically sent with every request to the same domain, simplifying API client implementation
- **Built-in expiration**: Cookie expiration can mirror server-side session timeout (30 minutes)
- **CSRF mitigation**: Can be combined with SameSite attribute (SameSite=Strict or Lax) to prevent cross-site request forgery
- **Standard practice**: Widely adopted pattern for session management in enterprise applications

### Alternatives Considered
1. **localStorage only**: 
   - **Rejected because**: Vulnerable to XSS attacks (any injected script can read tokens), requires manual token inclusion in every request
   - **When to use**: Fallback for environments where cookies are disabled or when cross-domain requests require explicit Authorization header

2. **sessionStorage**: 
   - **Rejected because**: Tokens lost on tab close (doesn't support multi-tab persistence), still vulnerable to XSS
   - **When to use**: Temporary data that should not persist across browser sessions

3. **In-memory storage (React state only)**: 
   - **Rejected because**: Lost on page refresh, doesn't support persistent login across browser restarts
   - **When to use**: Temporary authentication for single-page flows without persistence requirements

### Implementation Details
- **Cookie name**: `auth_session_token`
- **Cookie attributes**: `HttpOnly; Secure; SameSite=Strict; Max-Age=1800` (30 minutes)
- **Secure flag**: Enforced in production (HTTPS only), optional in development
- **Path**: `/` (accessible across entire application)
- **Domain**: Not set (defaults to current domain, prevents subdomain sharing)
- **Fallback mechanism**: If cookie access fails (due to browser settings), fall back to localStorage with warning logged

### Constitutional Alignment
- **Security**: Aligns with enterprise security standards (implicit in Constitution Section VIII: "Trust and reliability are mandatory")
- **No explicit constitutional constraint**: Constitution does not mandate specific session storage mechanism

---

## 2. Password Hashing Algorithm

### Decision
**Use BCrypt with 12 rounds (cost factor)** for password hashing.

### Rationale
- **Industry standard**: BCrypt is specifically designed for password hashing with built-in salt generation
- **Adaptive cost**: Cost factor (rounds) can be increased over time as hardware improves
- **Resistance to brute-force**: Computationally expensive by design, slows down password cracking attempts
- **Built-in salt**: Automatically generates random salt per password, prevents rainbow table attacks
- **Proven security**: Battle-tested algorithm used by major platforms (GitHub, Stack Overflow, etc.)
- **.NET support**: BCrypt.Net-Next library is well-maintained and widely used in ASP.NET Core

### Alternatives Considered
1. **PBKDF2**: 
   - **Rejected because**: While secure, BCrypt is specifically optimized for password hashing and has wider adoption in .NET ecosystem
   - **When to use**: When FIPS 140-2 compliance is mandatory (BCrypt is not FIPS-approved)

2. **Argon2**: 
   - **Rejected because**: Newer algorithm (winner of Password Hashing Competition 2015) but less mature .NET library support, may introduce dependency risks
   - **When to use**: When memory-hardness is critical (defense against GPU-based attacks), when using well-maintained libraries like Konscious.Security.Cryptography

3. **SHA-256 with salt**: 
   - **Rejected because**: SHA family is designed for speed, not password hashing; too fast for password storage (enables brute-force attacks)
   - **When to use**: Never for password storage; only for data integrity verification

### Implementation Details
- **Library**: BCrypt.Net-Next (NuGet package)
- **Cost factor**: 12 rounds (balance between security and performance; increases computation time to ~300-500ms)
- **Salt generation**: Automatic (BCrypt generates unique salt per hash)
- **Hash verification**: `BCrypt.Verify(plainTextPassword, storedHash)`
- **Hash generation**: `BCrypt.HashPassword(plainTextPassword, 12)`

### Constitutional Alignment
- **Performance constraint**: 12-round BCrypt hashing adds ~300-500ms to login, within <500ms p95 target (see Technical Context Performance Goals)
- **Security mandate**: Aligns with enterprise security standards (Constitution Section VIII: "Trust and reliability are mandatory")

---

## 3. Application-Level Error Code Taxonomy

### Decision
**Implement 5-digit error code system with domain prefix pattern**: `<Domain><Category><Sequence>` (e.g., `SEC-01-001`)

### Rationale
- **Human-readable**: Prefix identifies domain and category at a glance
- **Scalable**: Can support hundreds of errors per domain without collision
- **Diagnostic clarity**: Error codes uniquely identify failure points for support and debugging
- **Constitutional compliance**: Satisfies tState format requirement (`<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>`)
- **Separation from SQL Server errors**: Application errors use domain prefix; native SQL Server errors preserve numeric codes (e.g., `8134` for divide by zero)

### Taxonomy Structure
```
<Domain>-<Category>-<Sequence>
  │       │          │
  │       │          └─ 001-999: Specific error within category
  │       │
  │       └─ 01-99: Error category (Authentication, Authorization, Validation, etc.)
  │
  └─ 2-3 letter domain prefix (SEC, COM, AUD, etc.)
```

### Authentication Domain Error Codes (SEC)

| Code | Category | Description | Example tState |
|------|----------|-------------|----------------|
| SEC-01-001 | Authentication | Invalid credentials | `ERR~SEC-01-001~Sec_Users_Authenticate_User~N/A~Invalid username or password` |
| SEC-01-002 | Authentication | User not found | `ERR~SEC-01-002~Sec_Users_Authenticate_User~USERNAME=Admin~User does not exist` |
| SEC-01-003 | Authentication | Password hash mismatch | `ERR~SEC-01-003~Sec_Users_Authenticate_User~N/A~Password verification failed` |
| SEC-02-001 | Session | Session not found | `ERR~SEC-02-001~Sec_Users_Validate_Session~TOKEN=xyz~Session does not exist` |
| SEC-02-002 | Session | Session expired | `ERR~SEC-02-002~Sec_Users_Validate_Session~EXPIRY=2026-02-09T14:30:00~Session has expired` |
| SEC-02-003 | Session | Session inactive | `ERR~SEC-02-003~Sec_Users_Validate_Session~N/A~Session has been terminated` |
| SEC-02-004 | Session | Session creation failed | `ERR~SEC-02-004~Sec_Users_Create_Session~N/A~Failed to generate session token` |
| SEC-03-001 | Audit | Audit insert failed | `ERR~SEC-03-001~Audit_AuthEvents_Insert~N/A~Failed to log authentication event` |

### Native SQL Server Error Codes (Preserved)
When SQL Server errors occur (e.g., deadlock, constraint violation, divide by zero), the native error number is preserved in tState:
- Example: `ERR~8134~Sec_Users_Insert~N/A~Divide by zero error encountered`
- Example: `ERR~1205~Sec_Sessions_Create~N/A~Transaction was deadlocked`

### Alternatives Considered
1. **Numeric-only codes (e.g., 50001-59999 for security domain)**: 
   - **Rejected because**: Not human-readable, requires lookup table for every error, harder to categorize at a glance
   - **When to use**: When maintaining legacy system with existing numeric error code infrastructure

2. **HTTP status codes only**: 
   - **Rejected because**: Too coarse-grained (e.g., 401 doesn't distinguish between "user not found" and "wrong password"), doesn't satisfy tState requirement for specific error codes
   - **When to use**: API response status codes (complementary to application error codes, not replacement)

3. **Exception-based error handling without codes**: 
   - **Rejected because**: Violates constitutional tState requirement (Section VI), makes centralized error tracking and diagnostics difficult
   - **When to use**: Never in this architecture (constitution mandates tState)

### Implementation Details
- **Error code registry**: Maintain centralized error code documentation in `backend/src/Application/ErrorCodes.cs` as constants
- **tState parsing**: Infrastructure layer parses tState and maps error codes to exception types (e.g., `SEC-01-001` → `InvalidCredentialsException`)
- **Client-side mapping**: Frontend maps error codes to user-friendly messages (e.g., `SEC-01-001` → "Invalid username or password. Please try again.")
- **Logging**: All error codes logged with Serilog for diagnostics and trend analysis

### Constitutional Alignment
- **tState mandate**: Satisfies Constitution Section VI requirement for standardized error contracts
- **Native error preservation**: Complies with "Native SQL Server error numbers MUST be preserved and surfaced" (Section VI)

---

## 4. Material-UI Form Patterns & Best Practices

### Decision
**Use controlled components with React Hook Form + Material-UI integration** for form management with real-time inline validation.

### Rationale
- **Constitutional compliance**: Satisfies "inline, real-time validation is mandatory" (Section VIII)
- **Performance**: React Hook Form uses uncontrolled components internally, reducing re-renders
- **Type safety**: Full TypeScript support with type inference for form values
- **MUI integration**: Official `@mui/material` integration with `Controller` component
- **Validation**: Built-in validation rules (required, pattern, min/max length) with custom async validators
- **Error handling**: Automatic error state management synced with MUI TextField `error` and `helperText` props
- **Accessibility**: MUI components have built-in ARIA attributes and keyboard navigation

### Implementation Pattern
```typescript
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from '@mui/material';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    // API call to authService.login(data)
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="username"
        control={control}
        rules={{ required: 'Username is required' }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Username"
            error={!!errors.username}
            helperText={errors.username?.message}
            fullWidth
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        rules={{ required: 'Password is required' }}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label="Password"
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
          />
        )}
      />
      <Button type="submit" variant="contained">Login</Button>
    </form>
  );
};
```

### Vite Configuration (Port 3000)
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

### Material-UI 24-Column Grid Layout
```typescript
import { Grid2 as Grid, Container } from '@mui/material';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Grid container spacing={3}>
        <Grid size={24}>
          <LoginForm />
        </Grid>
      </Grid>
    </Container>
  );
};
```

### Spacing and Visual Hierarchy
- **Form field spacing**: `spacing={3}` → 24px between fields (3 * 8px)
- **Container padding**: `paddingTop: 8` (64px from top, 8 * 8px)
- **Button spacing**: `marginTop: 2` (16px above submit button, 2 * 8px)
- **Primary action prominence**: Submit button uses `variant="contained"` with primary color, secondary actions use `variant="outlined"`

### Alternatives Considered
1. **Formik**: 
   - **Rejected because**: Larger bundle size, less TypeScript-friendly, React Hook Form has better performance and smaller footprint
   - **When to use**: When team already familiar with Formik or needs Yup schema validation integration

2. **Uncontrolled forms with refs**: 
   - **Rejected because**: Doesn't support real-time inline validation (constitutional requirement), harder to manage form state programmatically
   - **When to use**: Simple forms without validation requirements

3. **Manual state management (useState for each field)**: 
   - **Rejected because**: Verbose, causes unnecessary re-renders, no built-in validation support
   - **When to use**: Never for forms with >2 fields (use form library)

### Constitutional Alignment
- **24-column grid**: Using `<Grid2>` (Grid v2) with `size={24}` for full width (Section VIII)
- **8px spacing**: `spacing` prop multiples of 8px (Section VIII)
- **Real-time validation**: React Hook Form validation rules trigger on blur/change (Section VIII)
- **WCAG AA contrast**: MUI TextField default colors meet contrast requirements (Section VIII)
- **Keyboard navigation**: MUI components support Tab/Enter navigation out of the box (Section VIII)

---

## 5. ASP.NET Core Authentication Middleware Strategy

### Decision
**Implement custom JWT-based authentication middleware** with session token validation against database (hybrid approach: JWT for stateless validation + database lookup for revocation support).

### Rationale
- **Constitutional alignment**: Supports lazy session expiration (validate on next request, not proactive polling)
- **Stateless validation**: JWT payload contains UserId and expiration, enables fast validation without database hit
- **Revocation support**: Database lookup validates session is still active (supports explicit logout)
- **Scalability**: JWTs enable horizontal scaling (any API server can validate token)
- **No ASP.NET Core Identity framework**: Avoids heavyweight Identity framework (constitutional constraint to keep dependencies minimal)
- **Custom implementation**: Full control over session logic to match specification (30-minute timeout, lazy expiration, single session per user)

### Implementation Approach
1. **Login flow**: 
   - Backend authenticates credentials via `Sec_Users_Authenticate_User` stored procedure
   - Generate JWT token with claims: `UserId`, `Username`, `Expiration` (current time + 30 minutes)
   - Insert session record in `Sec_Sessions` table with token and expiration
   - Return JWT token to client (stored in httpOnly cookie)

2. **Authentication middleware**:
   - Extract JWT from cookie on each request
   - Validate JWT signature and expiration (fast, stateless)
   - Extract UserId from JWT claims
   - Database lookup: `Sec_Users_Validate_Session` stored procedure checks session is active and not expired
   - If valid: Attach `User` object to HttpContext for downstream use
   - If invalid: Return 401 Unauthorized, trigger client-side redirect to login

3. **Logout flow**:
   - Extract JWT from cookie
   - Call `Sec_Users_End_Session` stored procedure to mark session inactive
   - Clear cookie on client

### Middleware Implementation Pattern
```csharp
public class JwtAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    
    public async Task InvokeAsync(HttpContext context, IAuthenticationService authService)
    {
        var token = context.Request.Cookies["auth_session_token"];
        
        if (string.IsNullOrEmpty(token))
        {
            await _next(context); // Anonymous request
            return;
        }
        
        try
        {
            // Validate JWT signature and expiration (stateless)
            var principal = ValidateJwtToken(token);
            var userId = principal.FindFirst("UserId")?.Value;
            
            // Database validation (check session active)
            var sessionInfo = await authService.ValidateSessionAsync(token);
            
            if (sessionInfo.IsValid)
            {
                context.User = principal; // Attach authenticated user
            }
            else
            {
                context.Response.StatusCode = 401; // Unauthorized
                return;
            }
        }
        catch (SecurityTokenException)
        {
            context.Response.StatusCode = 401;
            return;
        }
        
        await _next(context);
    }
}
```

### Alternatives Considered
1. **ASP.NET Core Identity framework**: 
   - **Rejected because**: Heavyweight (brings EF Core dependency, violates constitutional Dapper-only constraint), opinionated schema doesn't match `Sec_Users` design, overkill for single-user Admin authentication
   - **When to use**: Multi-user applications with complex role/permission requirements where EF Core is already in use

2. **Session-based authentication (server-side session storage)**: 
   - **Rejected because**: Requires sticky sessions or distributed cache (Redis) for horizontal scaling, adds infrastructure complexity, doesn't align with API-first stateless design
   - **When to use**: Traditional server-rendered applications (MVC/Razor Pages) where sessions are natural fit

3. **API key authentication**: 
   - **Rejected because**: No built-in expiration mechanism, doesn't support session timeout requirement, harder to implement secure logout
   - **When to use**: Machine-to-machine API access, long-lived credentials for service accounts

### JWT Configuration
- **Signing algorithm**: HS256 (HMAC with SHA-256)
- **Secret key**: Stored in `appsettings.json` (development) or Azure Key Vault (production)
- **Token expiration**: 30 minutes (matches session timeout)
- **Claims**: `UserId`, `Username`, `IssuedAt`, `ExpiresAt`
- **Issuer/Audience**: Set to application identifier for additional validation

### Constitutional Alignment
- **Layered architecture**: Middleware invokes Application layer (`IAuthenticationService.ValidateSessionAsync`), which invokes Infrastructure layer (Dapper stored procedure call) (Section IV)
- **Database-as-authority**: Session validity checked via `Sec_Users_Validate_Session` stored procedure (Section V)
- **No EF Core**: Custom JWT middleware avoids ASP.NET Core Identity's EF Core dependency (Section V)
- **Lazy expiration**: Validation only occurs on request, not proactive polling (matches clarification answer)

---

## 6. Client-Side Structured Logging Library

### Decision
**Use custom lightweight logging utility wrapping `console` with log levels and configurable sinks** (initial implementation) with future migration path to `loglevel` or `winston` (browser build) if centralized logging sink is required.

### Rationale
- **Constitutional requirement**: "Structured logging is mandatory for all significant client-side events" (Section VII)
- **Simplicity**: Custom utility sufficient for initial release (log to console in dev, no-op in production unless explicitly enabled)
- **Zero dependencies**: No additional bundle size for MVP
- **Configuration**: Log level controlled via environment variable (`VITE_LOG_LEVEL=debug`)
- **Structured output**: JSON format for easy parsing in browser DevTools
- **Future extensibility**: Can integrate with centralized logging services (e.g., Sentry, LogRocket, Application Insights) when needed

### Implementation Pattern
```typescript
// src/utils/logger.ts
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;

  constructor() {
    const envLevel = import.meta.env.VITE_LOG_LEVEL || 'info';
    this.level = LogLevel[envLevel.toUpperCase() as keyof typeof LogLevel] || LogLevel.INFO;
  }

  error(message: string, context?: Record<string, any>) {
    if (this.level >= LogLevel.ERROR) {
      console.error(JSON.stringify({ level: 'ERROR', message, ...context, timestamp: new Date().toISOString() }));
    }
  }

  warn(message: string, context?: Record<string, any>) {
    if (this.level >= LogLevel.WARN) {
      console.warn(JSON.stringify({ level: 'WARN', message, ...context, timestamp: new Date().toISOString() }));
    }
  }

  info(message: string, context?: Record<string, any>) {
    if (this.level >= LogLevel.INFO) {
      console.info(JSON.stringify({ level: 'INFO', message, ...context, timestamp: new Date().toISOString() }));
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(JSON.stringify({ level: 'DEBUG', message, ...context, timestamp: new Date().toISOString() }));
    }
  }
}

export const logger = new Logger();
```

### Usage Example
```typescript
// Log successful login
logger.info('User authenticated', { userId: 1, username: 'Admin' });

// Log failed login
logger.warn('Authentication failed', { username: 'Admin', errorCode: 'SEC-01-001' });

// Log session expiration
logger.info('Session expired', { userId: 1, sessionExpiry: '2026-02-09T15:00:00Z' });
```

### Alternatives Considered
1. **loglevel**: 
   - **Rejected for initial release because**: Adds dependency (~1KB gzipped), custom solution sufficient for MVP
   - **When to use**: When advanced features needed (persistent log storage, plugin system, multiple transports)

2. **winston (browser build)**: 
   - **Rejected because**: Heavyweight for browser (designed for Node.js), larger bundle size (~10KB+)
   - **When to use**: When migrating existing Node.js logging configuration to isomorphic app (SSR)

3. **Third-party service SDKs (Sentry, LogRocket)**: 
   - **Rejected for initial release because**: Adds external service dependency, privacy considerations for user data, cost implications
   - **When to use**: Production monitoring after MVP, when centralized error tracking is prioritized

### Constitutional Alignment
- **Structured logging mandatory**: Custom logger outputs JSON with level, message, context, timestamp (Section VII)
- **Configurable by level**: `VITE_LOG_LEVEL` environment variable controls verbosity (Section VII)
- **Console-only forbidden in production**: Custom logger can be configured to no-op in production (Section VII: "Console-only logging is strictly forbidden in production environments")
- **Future extensibility**: Design allows adding sinks (e.g., remote logging service) without refactoring call sites

---

## 7. Session Timeout Detection Strategy (Frontend)

### Decision
**Use combination of idle timer + axios response interceptor** for lazy session expiration detection.

### Rationale
- **Constitutional alignment**: Matches "lazy redirect on next interaction" requirement from clarification
- **No polling**: Doesn't make periodic API calls to check session validity (efficient, reduces server load)
- **Idle tracking**: JavaScript timer tracks user inactivity (clicks, keyboard, mouse movement) on client side
- **Server validation**: Axios interceptor detects 401 response from API (indicates server-side session expired), triggers redirect to login
- **User experience**: User can remain on page after 30-minute timeout until they interact (click button, navigate, etc.)

### Implementation Pattern

#### 1. Custom Hook: `useSessionTimeout`
```typescript
// src/hooks/useSessionTimeout.ts
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const useSessionTimeout = (isAuthenticated: boolean) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        // Session expired on client side, redirect to login on next interaction
        navigate('/login', { state: { reason: 'session_expired' } });
      }, SESSION_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    resetTimeout(); // Initial timeout

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated]);
};
```

#### 2. Axios Response Interceptor
```typescript
// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send cookies with requests
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Server returned 401, session expired on server side
      window.location.href = '/login?reason=session_expired';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### User Experience Flow
1. **User logs in**: Session timeout timer starts (30 minutes)
2. **User interacts (clicks, types, scrolls)**: Timer resets to 30 minutes
3. **User idle for 30 minutes**: Timer expires (no action taken yet)
4. **User clicks button (interaction after expiration)**: 
   - If frontend timer expired first: Redirect to login immediately
   - If backend session expired first: API returns 401, axios interceptor redirects to login
5. **Login page**: Shows message "Your session has expired. Please log in again."

### Alternatives Considered
1. **Polling (setInterval to check session validity)**: 
   - **Rejected because**: Inefficient (makes unnecessary API calls), increases server load, doesn't align with "lazy" expiration requirement
   - **When to use**: When server-side session timeout must be enforced immediately (not applicable here)

2. **JWT expiration only (no idle tracking)**: 
   - **Rejected because**: Doesn't account for user inactivity, JWT expires at fixed time regardless of interaction
   - **When to use**: When fixed-duration sessions are required (e.g., "log out after 30 minutes regardless of activity")

3. **Server-sent events (SSE) for session expiration notification**: 
   - **Rejected because**: Overkill for session management, adds complexity (requires SSE infrastructure), doesn't align with stateless API design
   - **When to use**: Real-time notifications required for other features (e.g., chat, live updates)

### Constitutional Alignment
- **Lazy expiration**: User remains on page until next interaction (matches clarification answer)
- **No proactive redirect**: No polling or automatic redirect on timeout, only redirect when user interacts
- **Performance**: No periodic API calls, minimal client-side overhead (event listeners only)

---

## 8. Database Connection Management & Resilience

### Decision
**Use Dapper with connection-per-request pattern + Polly for transient fault handling** (retry logic for deadlocks, timeouts).

### Rationale
- **Constitutional compliance**: Dapper is mandatory data access library (Section V)
- **Connection pooling**: SQL Server connection pooling handled by ADO.NET automatically (efficient resource usage)
- **Connection-per-request**: Each HTTP request gets new connection from pool, returned to pool after request completes (standard ASP.NET Core pattern)
- **Transient fault handling**: Polly retry policy handles temporary database failures (network blips, deadlocks) automatically
- **Layered architecture**: Connection management in Infrastructure layer (`DbConnectionFactory`), business logic unaware of retries

### Implementation Pattern

#### DbConnectionFactory (Infrastructure Layer)
```csharp
// src/Infrastructure/Data/DbConnectionFactory.cs
using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

public class DbConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }
}
```

#### Polly Retry Policy (Infrastructure Layer)
```csharp
// src/Infrastructure/Data/DapperExecutor.cs
using Dapper;
using Polly;
using System.Data;

public class DapperExecutor
{
    private readonly IAsyncPolicy _retryPolicy;

    public DapperExecutor()
    {
        _retryPolicy = Policy
            .Handle<SqlException>(ex => ex.Number == 1205) // Deadlock
            .Or<SqlException>(ex => ex.Number == -2) // Timeout
            .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
    }

    public async Task<T> ExecuteWithRetryAsync<T>(IDbConnection connection, Func<Task<T>> operation)
    {
        return await _retryPolicy.ExecuteAsync(operation);
    }
}
```

#### Repository Usage (Infrastructure Layer)
```csharp
// src/Infrastructure/Repositories/AuthenticationRepository.cs
public async Task<AuthenticationResult> AuthenticateUserAsync(string username, string password)
{
    using var connection = _connectionFactory.CreateConnection();
    
    var parameters = new DynamicParameters();
    parameters.Add("@Username", username);
    parameters.Add("@Password", password);
    parameters.Add("@tState", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

    await _dapperExecutor.ExecuteWithRetryAsync(connection, async () =>
    {
        await connection.ExecuteAsync("Sec_Users_Authenticate_User", parameters, commandType: CommandType.StoredProcedure);
        return Task.CompletedTask;
    });

    var tState = parameters.Get<string>("@tState");
    return _tStateParser.Parse(tState);
}
```

### Connection String Configuration
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AiddApp;User Id=sa;Password=YourStrongPassword;TrustServerCertificate=True;Connection Timeout=30;Min Pool Size=5;Max Pool Size=100;"
  }
}
```

### Alternatives Considered
1. **Singleton connection (single shared connection)**: 
   - **Rejected because**: Not thread-safe, causes concurrency issues, connection can be closed unexpectedly
   - **When to use**: Never in web applications (use connection pooling instead)

2. **Manual connection pooling**: 
   - **Rejected because**: Reinventing the wheel, ADO.NET connection pooling is battle-tested and optimized
   - **When to use**: Non-ADO.NET database drivers without built-in pooling

3. **No retry logic**: 
   - **Rejected because**: Transient faults (deadlocks, network blips) cause unnecessary user-facing errors, retry improves reliability
   - **When to use**: When idempotency cannot be guaranteed (e.g., financial transactions without idempotency keys)

### Constitutional Alignment
- **Dapper mandatory**: Using Dapper for all stored procedure execution (Section V)
- **Stored procedures only**: All database access via named stored procedures (Section V)
- **Transactional integrity**: Stored procedures own transactions, Infrastructure layer does not manage transactions (Section V)
- **Error handling**: Polly retries preserve native SQL Server error numbers in tState (Section VI)

---

## Summary of Research Decisions

| Research Area | Decision | Key Rationale |
|---------------|----------|---------------|
| Session Token Storage | httpOnly cookies (localStorage fallback) | XSS protection, automatic transmission, CSRF mitigation |
| Password Hashing | BCrypt (12 rounds) | Industry standard, adaptive cost, built-in salt |
| Error Code Taxonomy | Domain-prefix pattern (SEC-01-001) | Human-readable, scalable, satisfies tState requirement |
| Material-UI Form Patterns | React Hook Form + MUI | Real-time validation, performance, TypeScript support |
| Authentication Middleware | Custom JWT + database validation | Lazy expiration, revocation support, no EF Core dependency |
| Client-Side Logging | Custom lightweight utility | Zero dependencies, structured JSON, configurable, extensible |
| Session Timeout Detection | Idle timer + axios interceptor | Lazy expiration, no polling, efficient |
| Database Connection Management | Dapper + Polly retry | Connection pooling, transient fault handling, constitutional compliance |

---

## Next Steps: Phase 1

With all technical unknowns resolved, proceed to Phase 1:
1. **data-model.md**: Define database schemas, entities, and tState contracts
2. **contracts/**: Generate OpenAPI specification for authentication endpoints
3. **quickstart.md**: Document developer onboarding and local setup instructions
4. **Update agent context**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` to add new technology decisions

All research decisions documented here are ready for implementation and aligned with Constitution v1.0.0.
