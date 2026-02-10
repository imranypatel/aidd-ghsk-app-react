# tState Contracts Reference

**Feature**: User Login and Logout  
**Date**: February 9, 2026  
**Purpose**: Comprehensive tState format reference for all stored procedures

---

## Overview

All stored procedures in this feature return a standardized `@tState VARCHAR(500) OUTPUT` parameter following the constitutional tState format:

```
<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>
```

**Where**:
- `STATUS`: `OK` (success) or `ERR` (error/failure)
- `ERRORCODE`: `00000` (success), application error code (e.g., `SEC-01-001`), or native SQL Server error number (e.g., `2627`)
- `PROCEDURE_NAME`: Name of the stored procedure that generated the tState
- `DATA`: Pipe-separated key=value pairs (e.g., `USERID=1|EXPIRY=2026-02-09T15:30:00`) or `N/A` if no data
- `MESSAGE`: Human-readable description of the result or error

---

## Application Error Code Taxonomy

### Security Domain (SEC)

| Error Code | Category | Description | Resolution |
|------------|----------|-------------|------------|
| SEC-01-001 | Authentication | Invalid credentials (password mismatch) | User should re-enter correct password |
| SEC-01-002 | Authentication | User not found | User should verify username or contact support |
| SEC-01-003 | Authentication | Password hash verification failed | Internal error, retry or contact support |
| SEC-01-004 | Authentication | User account is inactive | Contact support to reactivate account |
| SEC-02-001 | Session | Session not found | User should log in again |
| SEC-02-002 | Session | Session expired (timeout) | User should log in again |
| SEC-02-003 | Session | Session inactive (logged out) | User should log in again |
| SEC-02-004 | Session | Session creation failed | Retry login or contact support |
| SEC-03-001 | Audit | Audit event insert failed | Logged but does not block operation |

### Validation Domain (VAL)

| Error Code | Category | Description | Resolution |
|------------|----------|-------------|------------|
| VAL-01-001 | Input Validation | Username is required | Provide username |
| VAL-01-002 | Input Validation | Password is required | Provide password |
| VAL-01-003 | Input Validation | Username too short (< 3 characters) | Provide valid username |
| VAL-01-004 | Input Validation | SessionToken is required | Include session token |

### System Domain (SYS)

| Error Code | Category | Description | Resolution |
|------------|----------|-------------|------------|
| SYS-01-001 | Database | General database error | Retry or contact support |
| SYS-01-002 | Database | Connection timeout | Retry or check network connectivity |

---

## Stored Procedure Contracts

### 1. Sec_Users_Authenticate_User

**Purpose**: Validates user credentials and returns UserId for session creation.

**Parameters**:
- `@Username NVARCHAR(100)` — Username to authenticate
- `@PasswordHash NVARCHAR(255)` — BCrypt hash of password (pre-validated by Application layer)
- `@IpAddress NVARCHAR(45)` — Client IP address (optional, for audit logging)
- `@UserAgent NVARCHAR(500)` — Client user agent (optional, for audit logging)
- `@tState VARCHAR(500) OUTPUT` — Standardized tState result

**tState Examples**:

#### Success
```
OK~00000~Sec_Users_Authenticate_User~USERID=1~Login successful
```
**Parsing**:
- Status: `OK`
- ErrorCode: `00000` (success)
- Data: `USERID=1` (UserId of authenticated user)
- Message: `Login successful`

**Application Layer Action**: Extract UserId, proceed to create session.

---

#### Error: User Not Found
```
ERR~SEC-01-002~Sec_Users_Authenticate_User~USERNAME=Admin~User does not exist
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `SEC-01-002`
- Data: `USERNAME=Admin` (attempted username)
- Message: `User does not exist`

**Application Layer Action**: Return 401 Unauthorized, log failed attempt, display "Invalid username or password" to user.

---

#### Error: User Inactive
```
ERR~SEC-01-004~Sec_Users_Authenticate_User~USERID=1~User account is inactive
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `SEC-01-004`
- Data: `USERID=1`
- Message: `User account is inactive`

**Application Layer Action**: Return 401 Unauthorized, display "User account is inactive. Please contact support."

---

#### Error: Database Error (Example: Deadlock)
```
ERR~1205~Sec_Users_Authenticate_User~N/A~Transaction was deadlocked on lock resources with another process and has been chosen as the deadlock victim
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `1205` (native SQL Server error number for deadlock)
- Data: `N/A`
- Message: Native SQL Server error message

**Application Layer Action**: Log error with correlation ID, retry with Polly policy (up to 3 attempts), or return 500 Internal Server Error.

---

### 2. Sec_Users_Create_Session

**Purpose**: Creates a new session record for authenticated user.

**Parameters**:
- `@UserId INT` — UserId of authenticated user
- `@SessionToken NVARCHAR(500)` — JWT token generated by Application layer
- `@IpAddress NVARCHAR(45)` — Client IP address (optional, for tracking)
- `@UserAgent NVARCHAR(500)` — Client user agent (optional, for tracking)
- `@tState VARCHAR(500) OUTPUT` — Standardized tState result

**tState Examples**:

#### Success
```
OK~00000~Sec_Users_Create_Session~SESSIONID=5|EXPIRY=2026-02-09T15:30:00.0000000~Session created
```
**Parsing**:
- Status: `OK`
- ErrorCode: `00000` (success)
- Data: `SESSIONID=5|EXPIRY=2026-02-09T15:30:00.0000000` (pipe-separated key=value pairs)
- Message: `Session created`

**Application Layer Action**: Extract SessionId and ExpiresDate, return session details to client, set httpOnly cookie with JWT token.

---

#### Error: Unique Constraint Violation (SessionToken Collision)
```
ERR~2627~Sec_Users_Create_Session~N/A~Violation of UNIQUE KEY constraint 'UQ_Sec_Sessions_SessionToken'. Cannot insert duplicate key in object 'dbo.Sec_Sessions'.
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `2627` (native SQL Server error for unique constraint violation)
- Data: `N/A`
- Message: Native SQL Server error message

**Application Layer Action**: Regenerate SessionToken (crypto random collision extremely unlikely), retry insert, or return 500 Internal Server Error.

---

#### Error: Foreign Key Violation (Invalid UserId)
```
ERR~547~Sec_Users_Create_Session~N/A~The INSERT statement conflicted with the FOREIGN KEY constraint "FK_Sec_Sessions_UserId". The conflict occurred in database "AiddApp", table "dbo.Sec_Users", column 'UserId'.
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `547` (native SQL Server error for foreign key violation)
- Data: `N/A`
- Message: Native SQL Server error message

**Application Layer Action**: Log error (should never happen if authentication succeeded), return 500 Internal Server Error.

---

### 3. Sec_Users_End_Session

**Purpose**: Marks a session as inactive (logout).

**Parameters**:
- `@SessionToken NVARCHAR(500)` — JWT token to terminate
- `@IpAddress NVARCHAR(45)` — Client IP address (optional, for audit logging)
- `@UserAgent NVARCHAR(500)` — Client user agent (optional, for audit logging)
- `@tState VARCHAR(500) OUTPUT` — Standardized tState result

**tState Examples**:

#### Success
```
OK~00000~Sec_Users_End_Session~SESSIONID=5~Logout successful
```
**Parsing**:
- Status: `OK`
- ErrorCode: `00000` (success)
- Data: `SESSIONID=5`
- Message: `Logout successful`

**Application Layer Action**: Clear httpOnly cookie, return 200 OK, log logout event.

---

#### Error: Session Not Found
```
ERR~SEC-02-001~Sec_Users_End_Session~TOKEN=eyJhbGciOiJIUzI1NiI...~Session does not exist or already inactive
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `SEC-02-001`
- Data: `TOKEN=eyJhbGciOiJIUzI1NiI...` (truncated token for security)
- Message: `Session does not exist or already inactive`

**Application Layer Action**: Return 401 Unauthorized (idempotent: multiple logout calls are safe), clear cookie anyway.

---

### 4. Sec_Users_Validate_Session

**Purpose**: Validates session token and checks expiration.

**Parameters**:
- `@SessionToken NVARCHAR(500)` — JWT token to validate
- `@tState VARCHAR(500) OUTPUT` — Standardized tState result

**tState Examples**:

#### Success
```
OK~00000~Sec_Users_Validate_Session~USERID=1|EXPIRY=2026-02-09T15:30:00.0000000~Session valid
```
**Parsing**:
- Status: `OK`
- ErrorCode: `00000` (success)
- Data: `USERID=1|EXPIRY=2026-02-09T15:30:00.0000000`
- Message: `Session valid`

**Application Layer Action**: Attach User to HttpContext, allow request to proceed.

---

#### Error: Session Not Found
```
ERR~SEC-02-001~Sec_Users_Validate_Session~TOKEN=eyJhbGciOiJIUzI1NiI...~Session does not exist
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `SEC-02-001`
- Data: `TOKEN=eyJhbGciOiJIUzI1NiI...` (truncated)
- Message: `Session does not exist`

**Application Layer Action**: Return 401 Unauthorized, trigger client-side redirect to login.

---

#### Error: Session Expired
```
ERR~SEC-02-002~Sec_Users_Validate_Session~EXPIRY=2026-02-09T15:00:00.0000000~Session has expired
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `SEC-02-002`
- Data: `EXPIRY=2026-02-09T15:00:00.0000000` (expiration timestamp)
- Message: `Session has expired`

**Application Layer Action**: Return 401 Unauthorized, trigger client-side redirect to login with "Your session has expired. Please log in again."

---

#### Error: Session Inactive (Logged Out)
```
ERR~SEC-02-003~Sec_Users_Validate_Session~SESSIONID=5~Session has been terminated
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `SEC-02-003`
- Data: `SESSIONID=5`
- Message: `Session has been terminated`

**Application Layer Action**: Return 401 Unauthorized, trigger client-side redirect to login.

---

### 5. Audit_AuthEvents_Insert

**Purpose**: Logs authentication event to audit table.

**Parameters**:
- `@UserId INT` — UserId (nullable for failed login where user doesn't exist)
- `@Username NVARCHAR(100)` — Username attempted
- `@EventType NVARCHAR(50)` — Event type: LOGIN, LOGOUT, SESSION_EXPIRED, SESSION_VALIDATION, PASSWORD_CHANGE
- `@Success BIT` — 1 = success, 0 = failure
- `@ErrorCode NVARCHAR(20)` — Application error code (nullable for success)
- `@IpAddress NVARCHAR(45)` — Client IP address (optional)
- `@UserAgent NVARCHAR(500)` — Client user agent (optional)
- `@AdditionalInfo NVARCHAR(MAX)` — JSON-formatted additional context (optional)
- `@tState VARCHAR(500) OUTPUT` — Standardized tState result

**tState Examples**:

#### Success
```
OK~00000~Audit_AuthEvents_Insert~EVENTID=123~Audit event logged
```
**Parsing**:
- Status: `OK`
- ErrorCode: `00000` (success)
- Data: `EVENTID=123` (auto-generated EventId)
- Message: `Audit event logged`

**Application Layer Action**: Continue execution (audit logging is non-blocking).

---

#### Error: Audit Insert Failed
```
ERR~SEC-03-001~Audit_AuthEvents_Insert~N/A~Failed to log audit event: Arithmetic overflow error converting expression to data type int.
```
**Parsing**:
- Status: `ERR`
- ErrorCode: `SEC-03-001`
- Data: `N/A`
- Message: `Failed to log audit event: {SQL error details}`

**Application Layer Action**: Log error to Serilog with correlation ID, **but do NOT block primary operation** (authentication should still succeed/fail based on credentials, not audit logging).

---

## tState Parsing Strategy

### Infrastructure Layer (C#)

```csharp
public class TStateParser
{
    public TStateResult Parse(string tState)
    {
        if (string.IsNullOrWhiteSpace(tState))
            throw new ArgumentException("tState cannot be null or empty", nameof(tState));
        
        var parts = tState.Split('~');
        if (parts.Length != 5)
            throw new FormatException($"Invalid tState format: {tState}");
        
        return new TStateResult
        {
            Status = parts[0], // OK or ERR
            ErrorCode = parts[1], // 00000, SEC-01-001, or SQL error number
            ProcedureName = parts[2],
            Data = ParseData(parts[3]), // Parse pipe-separated key=value pairs
            Message = parts[4]
        };
    }
    
    private Dictionary<string, string> ParseData(string data)
    {
        var result = new Dictionary<string, string>();
        
        if (data == "N/A" || string.IsNullOrWhiteSpace(data))
            return result;
        
        var pairs = data.Split('|');
        foreach (var pair in pairs)
        {
            var kv = pair.Split('=');
            if (kv.Length == 2)
                result[kv[0]] = kv[1];
        }
        
        return result;
    }
}

public class TStateResult
{
    public string Status { get; set; } // OK or ERR
    public string ErrorCode { get; set; }
    public string ProcedureName { get; set; }
    public Dictionary<string, string> Data { get; set; }
    public string Message { get; set; }
    
    public bool IsSuccess => Status == "OK";
    public bool IsError => Status == "ERR";
    public bool IsApplicationError => ErrorCode.StartsWith("SEC-") || ErrorCode.StartsWith("VAL-") || ErrorCode.StartsWith("SYS-");
    public bool IsSqlError => !IsApplicationError && ErrorCode != "00000";
}
```

---

## Error Mapping: tState → HTTP Response

### Application Layer Strategy

| tState ErrorCode | HTTP Status | User-Facing Message | Log Level |
|------------------|-------------|---------------------|-----------|
| 00000 | 200 | {operation-specific success message} | Information |
| SEC-01-001 | 401 | Invalid username or password. Please try again. | Warning |
| SEC-01-002 | 401 | Invalid username or password. Please try again. | Warning |
| SEC-01-003 | 500 | An unexpected error occurred. Please try again later. | Error |
| SEC-01-004 | 401 | User account is inactive. Please contact support. | Warning |
| SEC-02-001 | 401 | No active session found. Please log in. | Information |
| SEC-02-002 | 401 | Your session has expired. Please log in again. | Information |
| SEC-02-003 | 401 | Your session has been terminated. Please log in again. | Information |
| SEC-02-004 | 500 | An unexpected error occurred. Please try again later. | Error |
| SEC-03-001 | N/A (non-blocking) | {primary operation continues} | Warning |
| VAL-01-* | 400 | {specific validation message} | Warning |
| SQL Error (1205, 2627, etc.) | 500 | An unexpected error occurred. Please try again later. | Error |

---

## Constitutional Alignment

✅ **tState Mandatory (Section VI)**:
- All stored procedures return `@tState VARCHAR(500) OUTPUT`
- Format strictly follows `<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>`

✅ **Native SQL Server Error Preservation (Section VI)**:
- SQL Server error numbers (e.g., `1205`, `2627`, `547`) preserved in tState
- No masking or suppression of database errors

✅ **Application Error Code Taxonomy (Section VI)**:
- Consistent domain-prefix pattern: `SEC-XX-XXX`, `VAL-XX-XXX`, `SYS-XX-XXX`
- Human-readable and diagnostically useful

✅ **Layered Interpretation (Section IV)**:
- **Infrastructure Layer**: Parses tState, surfaces raw result to Application layer
- **Application Layer**: Interprets error codes, maps to HTTP status codes, constructs user-friendly messages
- **Controllers Layer**: Returns standardized API responses

---

## Next Steps

This tState contract reference is ready for implementation:
1. **Database migrations**: Stored procedures will emit tState exactly as documented
2. **Infrastructure layer**: Implement `TStateParser` utility
3. **Application layer**: Map tState error codes to HTTP status codes and user messages
4. **Controllers layer**: Return standardized `ErrorResponse` and `SuccessResponse` DTOs
5. **Frontend**: Display user-friendly messages based on error codes
