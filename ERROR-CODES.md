# Error Code Reference

**AIDD EMS - Enterprise Management System**  
**Version**: 1.0.0  
**Last Updated**: February 10, 2026

---

## Error Code Format

All error codes follow the pattern: `<CATEGORY>-<MODULE>-<CODE>`

- **CATEGORY**: Error category (VAL, SEC, SYS, ERR)
- **MODULE**: Feature module (00 = global, 01 = authentication, 02 = logout, 03 = session)
- **CODE**: Specific error identifier (001-999)

---

## Error Categories

| Category | Description | HTTP Status Range | Severity |
|----------|-------------|-------------------|----------|
| **VAL** | Validation errors (input, business rules) | 400 | Low |
| **SEC** | Security errors (authentication, authorization) | 401, 403 | Medium |
| **SYS** | System errors (database, infrastructure) | 500 | High |
| **ERR** | Database errors (SQL Server exceptions) | 500 | Critical |

---

## Validation Errors (VAL)

### VAL-00: Global Validation

| Code | Description | HTTP Status | Trigger |
|------|-------------|-------------|---------|
| `VAL-00-001` | Invalid argument | 400 | ArgumentException thrown |
| `VAL-00-002` | Invalid operation | 400 | InvalidOperationException thrown |
| `VAL-00-003` | Invalid request data | 400 | Model validation failed (missing username/password) |

#### VAL-00-001: Invalid Argument

**Cause**: Method called with invalid, null, or out-of-range arguments.

**Example Response**:
```json
{
  "success": false,
  "errorCode": "VAL-00-001",
  "message": "Username cannot be null or empty",
  "data": null
}
```

**Resolution**:
- Check input parameters
- Ensure required fields are provided
- Validate data types match API expectations

#### VAL-00-002: Invalid Operation

**Cause**: Operation attempted in an invalid state or violates business rules.

**Example Response**:
```json
{
  "success": false,
  "errorCode": "VAL-00-002",
  "message": "Cannot create session without valid user ID",
  "data": null
}
```

**Resolution**:
- Verify prerequisites are met
- Check business logic constraints
- Ensure operations are called in correct sequence

#### VAL-00-003: Invalid Request Data

**Cause**: Request body missing required fields or has invalid format.

**Example Scenarios**:
- Missing `username` field in login request
- Missing `password` field in login request
- Empty string for required fields

**Example Response**:
```json
{
  "success": false,
  "errorCode": "VAL-00-003",
  "message": "Invalid request data",
  "data": null
}
```

**Frontend Validation** (prevents most of these):
- Username: minimum 3 characters
- Password: minimum 8 characters

**Resolution**:
- Check request payload structure
- Ensure all required fields are included
- Verify field types match API contract

---

## Security Errors (SEC)

### SEC-01: Authentication Errors

| Code | Description | HTTP Status | Trigger |
|------|-------------|-------------|---------|
| `SEC-01-001` | User not found or invalid credentials | 401 | Authentication failed (wrong username/password) |
| `SEC-01-002` | User account inactive | 401 | User exists but IsActive = 0 |
| `SEC-01-003` | User account locked | 401 | User exists but IsLocked = 1 |
| `SEC-01-999` | Generic authentication failure | 401 | Fallback for unexpected auth errors |

#### SEC-01-001: User Not Found or Invalid Credentials

**Cause**: 
- Username doesn't exist in database
- Password doesn't match stored hash

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SEC-01-001",
  "message": "User not found or invalid credentials",
  "data": null
}
```

**Security Note**: Intentionally vague to prevent user enumeration attacks.

**Resolution**:
1. Verify username spelling (case-sensitive)
2. Verify password is correct
3. Default credentials: Username `Admin`, Password `Admin123@`
4. Contact administrator if account may be deleted

**Troubleshooting**:
```sql
-- Check if user exists
SELECT Username, IsActive, IsLocked 
FROM Sec_Users 
WHERE Username = 'Admin';
```

#### SEC-01-002: User Account Inactive

**Cause**: User record exists but `IsActive = 0` (soft deleted or deactivated).

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SEC-01-002",
  "message": "User account is inactive",
  "data": null
}
```

**Resolution**:
- Contact administrator to reactivate account
- Administrator can update: `UPDATE Sec_Users SET IsActive = 1 WHERE Username = 'YourUsername'`

#### SEC-01-003: User Account Locked

**Cause**: Account locked due to security policy (e.g., multiple failed login attempts).

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SEC-01-003",
  "message": "User account is locked",
  "data": null
}
```

**Resolution**:
- Wait for automatic unlock (if implemented)
- Contact administrator to manually unlock account
- Administrator can update: `UPDATE Sec_Users SET IsLocked = 0 WHERE Username = 'YourUsername'`

**Note**: Account lockout feature not yet implemented in v1.0.0 (planned for Phase 7).

#### SEC-01-999: Generic Authentication Failure

**Cause**: Unexpected error during authentication (fallback error code).

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SEC-01-999",
  "message": "Authentication failed",
  "data": null
}
```

**Resolution**:
- Check server logs for detailed error (includes correlation ID)
- Retry request
- Contact support if issue persists

---

### SEC-02: Logout Errors

| Code | Description | HTTP Status | Trigger |
|------|-------------|-------------|---------|
| `SEC-02-001` | No active session | 400 | Logout attempt without session cookie |
| `SEC-02-002` | Session already expired | 200 | Session expired before logout |
| `SEC-02-003` | Session already ended | 200 | Session already logged out |

#### SEC-02-001: No Active Session

**Cause**: Logout API called without session cookie.

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SEC-02-001",
  "message": "No active session",
  "data": null
}
```

**Behavior**: Cookie is cleared even if invalid (graceful degradation).

**Resolution**:
- User is already logged out
- No action needed
- Can safely redirect to login page

#### SEC-02-002: Session Already Expired

**Cause**: Session expired before logout was called (ExpiresDate < GETDATE()).

**Example Response**:
```json
{
  "success": true,
  "message": "Session already expired",
  "data": null
}
```

**HTTP Status**: 200 OK (not an error, just informational)

**Behavior**: Session marked as inactive (IsActive = 0) anyway.

**Resolution**: No action needed, user can log in again.

#### SEC-02-003: Session Already Ended

**Cause**: Session was already logged out (IsActive = 0).

**Example Response**:
```json
{
  "success": true,
  "message": "Session already ended",
  "data": null
}
```

**HTTP Status**: 200 OK (idempotent operation)

**Resolution**: No action needed.

---

### SEC-03: Session Validation Errors

| Code | Description | HTTP Status | Trigger |
|------|-------------|-------------|---------|
| `SEC-03-001` | No session cookie | 401 | Session validation without cookie |
| `SEC-03-002` | Session expired | 401 | Session ExpiresDate < current time |
| `SEC-03-003` | Session inactive | 401 | Session IsActive = 0 |

#### SEC-03-001: No Session Cookie

**Cause**: `/api/auth/session` called without `AIDD_SESSION` cookie.

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SEC-03-001",
  "message": "No session cookie",
  "data": null
}
```

**Resolution**:
- User not logged in
- Redirect to login page
- Login to create new session

**E2E Test Workaround**: Authorization header fallback for Playwright tests.

#### SEC-03-002: Session Expired

**Cause**: Session expired (30 minutes since creation or last validation).

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SEC-03-002",
  "message": "Session expired",
  "data": null
}
```

**Behavior**: Invalid session cookie is automatically cleared by API.

**Resolution**:
- Redirect to login page
- Login to create new session

**Frontend Handling**:
```typescript
if (error.errorCode === 'SEC-03-002') {
  // Clear auth state
  setUser(null);
  setIsAuthenticated(false);
  
  // Redirect to login
  navigate('/login');
}
```

#### SEC-03-003: Session Inactive

**Cause**: Session was logged out (IsActive = 0).

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SEC-03-003",
  "message": "Session inactive",
  "data": null
}
```

**Behavior**: Invalid session cookie is automatically cleared.

**Resolution**:
- Redirect to login page
- Login to create new session

---

## System Errors (SYS)

### SYS-00: System-Level Errors

| Code | Description | HTTP Status | Trigger |
|------|-------------|-------------|---------|
| `SYS-00-010` | Session creation failed | 500 | Database error during session creation |
| `SYS-00-999` | Unexpected error occurred | 500 | Unhandled exception (catch-all) |

#### SYS-00-010: Session Creation Failed

**Cause**: Database error when inserting session record after successful authentication.

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SYS-00-010",
  "message": "Failed to create session",
  "data": null
}
```

**Possible Causes**:
- Database connection failure
- Transaction timeout
- Foreign key constraint violation (invalid UserId)
- Unique constraint violation (duplicate SessionToken - extremely rare)

**Resolution**:
1. Check server logs for detailed error
2. Verify database connectivity
3. Retry login request
4. Contact support if issue persists

**Troubleshooting** (Administrator):
```sql
-- Check database connectivity
SELECT @@VERSION;

-- Check for blocked transactions
SELECT * FROM sys.dm_exec_requests WHERE blocking_session_id <> 0;

-- Verify Sec_Sessions table exists
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sec_Sessions';
```

#### SYS-00-999: Unexpected Error Occurred

**Cause**: Unhandled exception not caught by specific handlers (fallback error).

**Example Response**:
```json
{
  "success": false,
  "errorCode": "SYS-00-999",
  "message": "An unexpected error occurred",
  "data": null
}
```

**Security Note**: Generic message to avoid exposing stack traces or sensitive data.

**Resolution**:
1. Note the correlation ID from `X-Correlation-ID` response header (if available)
2. Check server logs with correlation ID for full error details
3. Contact support with correlation ID

**Troubleshooting** (Administrator):
```powershell
# Find error in logs using correlation ID
Select-String -Path "logs/webapi-*.log" -Pattern "CorrelationId: <correlation-id>"
```

---

## Database Errors (ERR)

### ERR~<Number>: SQL Server Errors

**Format**: `ERR~<SQL Error Number>~<Error Message>`

**Example**: `ERR~547~The INSERT statement conflicted with the FOREIGN KEY constraint`

**HTTP Status**: Always 500 Internal Server Error

#### Common SQL Server Errors

| Error Number | Description | Common Cause |
|--------------|-------------|--------------|
| `ERR~547` | Foreign key constraint violation | Invalid UserId in session creation |
| `ERR~2627` | Unique constraint violation | Duplicate SessionToken (extremely rare) |
| `ERR~208` | Invalid object name | Table or stored procedure doesn't exist |
| `ERR~-1` | Network error | Database connection timeout |
| `ERR~18456` | Login failed | Incorrect database credentials |

#### ERR~547: Foreign Key Constraint Violation

**Example Response**:
```json
{
  "success": false,
  "errorCode": "ERR~547",
  "message": "The INSERT statement conflicted with the FOREIGN KEY constraint",
  "data": null
}
```

**Cause**: Attempting to insert a session with a UserId that doesn't exist in Sec_Users.

**Resolution** (Administrator):
```sql
-- Verify user exists
SELECT UserId, Username, IsActive FROM Sec_Users WHERE UserId = <UserId>;

-- If missing, check if user was deleted
SELECT * FROM Sec_Users WHERE Username = '<Username>';
```

#### ERR~2627: Unique Constraint Violation

**Example Response**:
```json
{
  "success": false,
  "errorCode": "ERR~2627",
  "message": "Violation of UNIQUE KEY constraint",
  "data": null
}
```

**Cause**: Duplicate SessionToken (GUID collision - statistically near-impossible).

**Resolution**: Retry login request (new GUID will be generated).

#### ERR~208: Invalid Object Name

**Example Response**:
```json
{
  "success": false,
  "errorCode": "ERR~208",
  "message": "Invalid object name 'Sec_Users'",
  "data": null
}
```

**Cause**: Database migrations not run or table dropped.

**Resolution** (Administrator):
1. Check if database exists: `SELECT DB_NAME()`
2. Run all migrations in `backend/src/Database/Migrations/` (001-010)
3. Verify tables exist:
   ```sql
   SELECT * FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_NAME IN ('Sec_Users', 'Sec_Sessions', 'Audit_AuthEvents');
   ```

#### ERR~-1: Database Connection Timeout

**Example Response**:
```json
{
  "success": false,
  "errorCode": "ERR~-1",
  "message": "A network-related or instance-specific error occurred",
  "data": null
}
```

**Cause**: 
- SQL Server not running
- Network connectivity issues
- Connection string incorrect
- Firewall blocking connection

**Resolution** (Administrator):
1. Verify SQL Server is running: `Get-Service MSSQL*` (PowerShell)
2. Test connection: `sqlcmd -S <server> -d <database> -E`
3. Check connection string in `appsettings.json`
4. Verify firewall allows SQL Server connections (port 1433)

#### ERR~18456: Login Failed

**Example Response**:
```json
{
  "success": false,
  "errorCode": "ERR~18456",
  "message": "Login failed for user '<user>'",
  "data": null
}
```

**Cause**: 
- Incorrect SQL Server credentials in connection string
- Windows Authentication failing
- SQL Server login disabled

**Resolution** (Administrator):
1. Check connection string credentials
2. Verify user has access to database
3. Grant permissions:
   ```sql
   CREATE LOGIN [YourLogin] FROM WINDOWS;
   USE TRANTS_EMS_DEV;
   CREATE USER [YourLogin] FOR LOGIN [YourLogin];
   ALTER ROLE db_owner ADD MEMBER [YourLogin];
   ```

---

## Error Response Format

All API errors return a consistent JSON structure:

```json
{
  "success": false,
  "errorCode": "SEC-01-001",
  "message": "User not found or invalid credentials",
  "data": null
}
```

### Success Response Format

Successful responses:

```json
{
  "success": true,
  "data": {
    "user": {
      "userId": 1,
      "username": "Admin"
    },
    "session": {
      "token": "a1b2c3d4-...",
      "expiresAt": "2026-02-10T03:00:00Z"
    }
  },
  "message": "Login successful",
  "errorCode": null
}
```

---

## Correlation IDs

Every API request is assigned a unique correlation ID for tracing.

**Response Header**:
```
X-Correlation-ID: 3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Use Case**: When reporting errors to support, provide the correlation ID.

**Finding Errors in Logs**:
```powershell
Select-String -Path "logs/webapi-*.log" -Pattern "3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

---

## Frontend Error Handling

### React Component Example

```typescript
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const result = await authService.login(credentials);
    
    if (!result.success) {
      switch (result.errorCode) {
        case 'SEC-01-001':
          setError('Invalid username or password');
          break;
        case 'SEC-01-002':
          setError('Your account is inactive. Contact support.');
          break;
        case 'SEC-01-003':
          setError('Your account is locked. Contact support.');
          break;
        case 'VAL-00-003':
          setError('Please enter both username and password');
          break;
        case 'SYS-00-010':
          setError('Server error. Please try again later.');
          break;
        default:
          setError('An unexpected error occurred');
      }
    }
  } catch (error) {
    setError('Network error. Please check your connection.');
  }
};
```

---

## Error Code Summary Table

| Code | Category | Description | HTTP Status | Severity |
|------|----------|-------------|-------------|----------|
| VAL-00-001 | Validation | Invalid argument | 400 | Low |
| VAL-00-002 | Validation | Invalid operation | 400 | Low |
| VAL-00-003 | Validation | Invalid request data | 400 | Low |
| SEC-01-001 | Security | Invalid credentials | 401 | Medium |
| SEC-01-002 | Security | Account inactive | 401 | Medium |
| SEC-01-003 | Security | Account locked | 401 | Medium |
| SEC-01-999 | Security | Auth failure (generic) | 401 | Medium |
| SEC-02-001 | Security | No session cookie | 400 | Low |
| SEC-02-002 | Security | Session expired (logout) | 200 | Info |
| SEC-02-003 | Security | Session ended (logout) | 200 | Info |
| SEC-03-001 | Security | No session cookie | 401 | Medium |
| SEC-03-002 | Security | Session expired | 401 | Medium |
| SEC-03-003 | Security | Session inactive | 401 | Medium |
| SYS-00-010 | System | Session creation failed | 500 | High |
| SYS-00-999 | System | Unexpected error | 500 | Critical |
| ERR~XXX | Database | SQL Server error | 500 | Critical |

**Total Error Codes**: 16 (15 application + 1 database category)

---

## Support

For assistance with error codes:
- **Check Logs**: `backend/src/WebApi/logs/webapi-YYYYMMDD.log`
- **Correlation ID**: Include in support requests
- **Email**: support@aidd-ems.com
- **Issue Tracker**: [GitHub Issues](https://github.com/your-org/aidd-ems/issues)

---

**Last Updated**: February 10, 2026  
**Version**: 1.0.0
