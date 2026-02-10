# Phase 1: Data Model & Database Design

**Feature**: User Login and Logout  
**Date**: February 9, 2026  
**Status**: Complete

---

## Overview

This document defines the complete database schema, entities, stored procedures, and tState contracts for the User Login and Logout feature. All designs follow constitutional mandates: stored procedures as exclusive interface, tState output pattern for error handling, database-as-authority for data integrity, and layered architecture separation.

---

## Database Tables

### 1. Sec_Users

**Purpose**: Stores user credentials and account information.

**Schema**:
```sql
CREATE TABLE Sec_Users (
    UserId          INT IDENTITY(1,1) PRIMARY KEY,
    Username        NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(255) NOT NULL,
    FirstName       NVARCHAR(100) NOT NULL,
    LastName        NVARCHAR(100) NOT NULL,
    Email           NVARCHAR(255) NOT NULL,
    Phone           NVARCHAR(20) NULL,
    Address         NVARCHAR(500) NULL,
    LastLoginDate   DATETIME2 NULL,
    IsActive        BIT NOT NULL DEFAULT 1,
    CreatedDate     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ModifiedDate    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT CK_Sec_Users_Username_Length CHECK (LEN(Username) >= 3),
    CONSTRAINT CK_Sec_Users_PasswordHash_Length CHECK (LEN(PasswordHash) >= 60),
    CONSTRAINT CK_Sec_Users_Email_Format CHECK (Email LIKE '%@%.%')
);

CREATE UNIQUE NONCLUSTERED INDEX IX_Sec_Users_Username 
ON Sec_Users(Username) 
WHERE IsActive = 1;

CREATE UNIQUE NONCLUSTERED INDEX IX_Sec_Users_Email 
ON Sec_Users(Email) 
WHERE IsActive = 1;
```

**Fields**:
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| UserId | INT IDENTITY | No | Primary key, auto-increment |
| Username | NVARCHAR(100) | No | Unique username, minimum 3 characters |
| PasswordHash | NVARCHAR(255) | No | BCrypt hashed password (60 characters for BCrypt hash + salt) |
| FirstName | NVARCHAR(100) | No | User's first name |
| LastName | NVARCHAR(100) | No | User's last name |
| Email | NVARCHAR(255) | No | User's email address (unique) |
| Phone | NVARCHAR(20) | Yes | User's phone number (optional) |
**Constraints**:
- `PK_Sec_Users_UserId`: Primary key on UserId
- `UQ_Sec_Users_Username`: Unique constraint on Username
- `CK_Sec_Users_Username_Length`: Username must be at least 3 characters
- `CK_Sec_Users_PasswordHash_Length`: PasswordHash must be at least 60 characters (BCrypt hash length)
- `CK_Sec_Users_Email_Format`: Email must contain @ and . characters (basic format validation)
- `IX_Sec_Users_Username`: Non-clustered index on Username for fast authentication lookups (filtered for active users only)
**Seed Data**:
```sql
-- Admin user with password "Admin123@" (BCrypt hash with 12 rounds)
-- Hash generated via: BCrypt.HashPassword("Admin123@", 12)
-- Use the PasswordHasher console utility to generate hash
INSERT INTO Sec_Users (Username, PasswordHash, FirstName, LastName, Email, Phone, Address, LastLoginDate, IsActive, CreatedDate, ModifiedDate)
VALUES ('Admin', '<BCRYPT_HASH_PLACEHOLDER>', 'System', 'Administrator', 'admin@example.com', NULL, NULL, NULL, 1, GETUTCDATE(), GETUTCDATE());
```
**Seed Data**:
**Future Considerations**:
- Add column: `RoleId` (FK to Sec_Roles table for role-based access control)
- Add column: `FailedLoginAttempts` (for future account lockout feature)
- Add table: `Sec_Roles` for role-based access control (RBAC)
- Add column: `EmailVerified` BIT for email verification status
- Add column: `ProfileImageUrl` NVARCHAR(500) for user avatar
INSERT INTO Sec_Users (Username, PasswordHash, IsActive, CreatedDate, ModifiedDate)
VALUES ('Admin', '<BCRYPT_HASH_PLACEHOLDER>', 1, GETUTCDATE(), GETUTCDATE());
```

**Future Considerations**:
- Add columns: `Email`, `FirstName`, `LastName`, `RoleId` (FK to Sec_Roles table)
- Add columns: `LastLoginDate`, `FailedLoginAttempts` (for future account lockout feature)
- Add table: `Sec_Roles` for role-based access control (RBAC)

---

### 2. Sec_Sessions

**Purpose**: Tracks active user sessions for authentication and session management.

**Schema**:
```sql
CREATE TABLE Sec_Sessions (
    SessionId       INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NOT NULL,
    SessionToken    NVARCHAR(500) NOT NULL UNIQUE,
    CreatedDate     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ExpiresDate     DATETIME2 NOT NULL,
    IsActive        BIT NOT NULL DEFAULT 1,
    IpAddress       NVARCHAR(45) NULL,
    UserAgent       NVARCHAR(500) NULL,
    
    CONSTRAINT FK_Sec_Sessions_UserId FOREIGN KEY (UserId) REFERENCES Sec_Users(UserId)
);

CREATE UNIQUE NONCLUSTERED INDEX IX_Sec_Sessions_SessionToken 
ON Sec_Sessions(SessionToken) 
WHERE IsActive = 1;

CREATE NONCLUSTERED INDEX IX_Sec_Sessions_UserId_Active 
ON Sec_Sessions(UserId, IsActive) 
INCLUDE (SessionToken, ExpiresDate);
```

**Fields**:
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| SessionId | INT IDENTITY | No | Primary key, auto-increment |
| UserId | INT | No | Foreign key to Sec_Users.UserId |
| SessionToken | NVARCHAR(500) | No | JWT token (base64-encoded, ~300-400 characters) |
| CreatedDate | DATETIME2 | No | UTC timestamp of session creation |
| ExpiresDate | DATETIME2 | No | UTC timestamp when session expires (CreatedDate + 30 minutes) |
| IsActive | BIT | No | Session status (1 = active, 0 = logged out or expired) |
| IpAddress | NVARCHAR(45) | Yes | Client IP address (supports IPv4 and IPv6) |
| UserAgent | NVARCHAR(500) | Yes | Client browser user agent string |

**Constraints**:
- `PK_Sec_Sessions_SessionId`: Primary key on SessionId
- `FK_Sec_Sessions_UserId`: Foreign key to Sec_Users.UserId (cascade prevent delete)
- `UQ_Sec_Sessions_SessionToken`: Unique constraint on SessionToken
- `IX_Sec_Sessions_SessionToken`: Non-clustered index on SessionToken for fast validation lookups (filtered for active sessions only)
- `IX_Sec_Sessions_UserId_Active`: Composite index on UserId and IsActive with included columns for session refresh queries

**Business Rules**:
- One active session per user (enforced by stored procedure logic: new login marks previous session inactive)
- Session expiration calculated as `CreatedDate + 30 minutes` (1800 seconds)
- Expired sessions remain in table for audit purposes (IsActive = 0)

**Future Considerations**:
- Support multiple concurrent sessions per user (remove single-session constraint)
- Add columns: `LastActivityDate` for sliding expiration, `RefreshToken` for token refresh flow

---

### 3. Audit_AuthEvents

**Purpose**: Logs all authentication-related events for security auditing and troubleshooting.

**Schema**:
```sql
CREATE TABLE Audit_AuthEvents (
    EventId         BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NULL, -- Nullable for failed login attempts (user not found)
    Username        NVARCHAR(100) NOT NULL,
    EventType       NVARCHAR(50) NOT NULL,
    Success         BIT NOT NULL,
    ErrorCode       NVARCHAR(20) NULL,
    EventTimestamp  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IpAddress       NVARCHAR(45) NULL,
    UserAgent       NVARCHAR(500) NULL,
    AdditionalInfo  NVARCHAR(MAX) NULL,
    
    CONSTRAINT CK_Audit_AuthEvents_EventType CHECK (EventType IN ('LOGIN', 'LOGOUT', 'SESSION_EXPIRED', 'SESSION_VALIDATION', 'PASSWORD_CHANGE')),
    CONSTRAINT FK_Audit_AuthEvents_UserId FOREIGN KEY (UserId) REFERENCES Sec_Users(UserId)
);

CREATE NONCLUSTERED INDEX IX_Audit_AuthEvents_Username_Timestamp 
ON Audit_AuthEvents(Username, EventTimestamp DESC);

CREATE NONCLUSTERED INDEX IX_Audit_AuthEvents_EventType_Timestamp 
ON Audit_AuthEvents(EventType, EventTimestamp DESC);
```

**Fields**:
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| EventId | BIGINT IDENTITY | No | Primary key, auto-increment |
| UserId | INT | Yes | Foreign key to Sec_Users.UserId (NULL for failed login attempts where user doesn't exist) |
| Username | NVARCHAR(100) | No | Username attempted (captured even if user doesn't exist) |
| EventType | NVARCHAR(50) | No | Event type: LOGIN, LOGOUT, SESSION_EXPIRED, SESSION_VALIDATION, PASSWORD_CHANGE |
| Success | BIT | No | Event outcome (1 = success, 0 = failure) |
| ErrorCode | NVARCHAR(20) | Yes | Application error code (e.g., SEC-01-001) or NULL for successful events |
| EventTimestamp | DATETIME2 | No | UTC timestamp of event |
| IpAddress | NVARCHAR(45) | Yes | Client IP address |
| UserAgent | NVARCHAR(500) | Yes | Client browser user agent string |
| AdditionalInfo | NVARCHAR(MAX) | Yes | JSON-formatted additional context (e.g., {"correlationId": "abc-123"}) |

**Constraints**:
- `PK_Audit_AuthEvents_EventId`: Primary key on EventId
- `FK_Audit_AuthEvents_UserId`: Foreign key to Sec_Users.UserId (nullable)
- `CK_Audit_AuthEvents_EventType`: Check constraint limiting EventType to predefined values
- `IX_Audit_AuthEvents_Username_Timestamp`: Composite index on Username and EventTimestamp (descending) for user activity history queries
- `IX_Audit_AuthEvents_EventType_Timestamp`: Composite index on EventType and EventTimestamp (descending) for event type filtering

**Retention Policy**:
- No automatic deletion (audit records retained indefinitely for compliance)
- Manual archival to cold storage after 7 years (compliance requirement)

**Future Considerations**:
- Add column: `CorrelationId` for distributed tracing
- Partition table by EventTimestamp for performance (e.g., monthly partitions)

---

## Stored Procedures

### 1. Sec_Users_Authenticate_User

**Purpose**: Validates user credentials and returns UserId for session creation.

**Parameters**:
```sql
CREATE PROCEDURE Sec_Users_Authenticate_User
    @Username NVARCHAR(100),
    @PasswordHash NVARCHAR(255), -- BCrypt hash passed from application layer
    @IpAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId INT;
    DECLARE @StoredHash NVARCHAR(255);
    DECLARE @IsActive BIT;
    
    BEGIN TRY
        -- Lookup user by username
        SELECT @UserId = UserId, @StoredHash = PasswordHash, @IsActive = IsActive
        FROM Sec_Users
        WHERE Username = @Username;
        
        -- User not found
        IF @UserId IS NULL
        BEGIN
            -- Log failed attempt (user not found)
            EXEC Audit_AuthEvents_Insert 
                @UserId = NULL,
                @Username = @Username,
                @EventType = 'LOGIN',
                @Success = 0,
                @ErrorCode = 'SEC-01-002',
                @IpAddress = @IpAddress,
                @UserAgent = @UserAgent,
                @tState = @tState OUTPUT;
            
            SET @tState = 'ERR~SEC-01-002~Sec_Users_Authenticate_User~USERNAME=' + @Username + '~User does not exist';
            RETURN;
        END
        
        -- User inactive
        IF @IsActive = 0
        BEGIN
            -- Log failed attempt (user inactive)
            EXEC Audit_AuthEvents_Insert 
                @UserId = @UserId,
                @Username = @Username,
                @EventType = 'LOGIN',
                @Success = 0,
                @ErrorCode = 'SEC-01-004',
                @IpAddress = @IpAddress,
                @UserAgent = @UserAgent,
                @tState = @tState OUTPUT;
            
            SET @tState = 'ERR~SEC-01-004~Sec_Users_Authenticate_User~USERID=' + CAST(@UserId AS VARCHAR) + '~User account is inactive';
            RETURN;
        END
        
        -- IMPORTANT: Password verification MUST happen in application layer BEFORE calling this procedure
        -- Application layer: 1) Calls this procedure to retrieve stored hash, 2) Uses BCrypt.Verify to compare
        -- This procedure only validates user existence, active status, and updates LastLoginDate
        -- If we reach here, password was already verified by application layer via BCrypt.Verify
        
        -- Update LastLoginDate
        UPDATE Sec_Users
        SET LastLoginDate = GETUTCDATE()
        WHERE UserId = @UserId;
        
        -- Log successful authentication
        EXEC Audit_AuthEvents_Insert 
            @UserId = @UserId,
            @Username = @Username,
            @EventType = 'LOGIN',
            @Success = 1,
            @ErrorCode = NULL,
            @IpAddress = @IpAddress,
            @UserAgent = @UserAgent,
            @tState = @tState OUTPUT;
        
        SET @tState = 'OK~00000~Sec_Users_Authenticate_User~USERID=' + CAST(@UserId AS VARCHAR) + '~Login successful';
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR) + '~Sec_Users_Authenticate_User~N/A~' + @ErrorMessage;
    END CATCH
END;
```

**tState Contracts**:
| Status | ErrorCode | Data | Message | Scenario |
|--------|-----------|------|---------|----------|
| OK | 00000 | USERID=1 | Login successful | Credentials valid, user active |
| ERR | SEC-01-002 | USERNAME=Admin | User does not exist | Username not found in database |
| ERR | SEC-01-004 | USERID=1 | User account is inactive | User exists but IsActive = 0 |
| ERR | {SQL Error} | N/A | {SQL Error Message} | Database error (e.g., deadlock, timeout) |

**Notes**:
- Password verification (BCrypt.Verify) happens in **Application layer** before calling this procedure
- If password mismatch occurs, Application layer does NOT call this procedure (logs failed attempt directly)
- This design keeps BCrypt library in C# (not available in T-SQL), aligns with layered architecture

---

### 2. Sec_Users_Create_Session

**Purpose**: Creates a new session record for authenticated user.

**Parameters**:
```sql
CREATE PROCEDURE Sec_Users_Create_Session
    @UserId INT,
    @SessionToken NVARCHAR(500),
    @IpAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ExpiresDate DATETIME2 = DATEADD(MINUTE, 30, GETUTCDATE());
    DECLARE @SessionId INT;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Mark all existing sessions for this user as inactive (single session per user)
        UPDATE Sec_Sessions
        SET IsActive = 0
        WHERE UserId = @UserId AND IsActive = 1;
        
        -- Insert new session
        INSERT INTO Sec_Sessions (UserId, SessionToken, CreatedDate, ExpiresDate, IsActive, IpAddress, UserAgent)
        VALUES (@UserId, @SessionToken, GETUTCDATE(), @ExpiresDate, 1, @IpAddress, @UserAgent);
        
        SET @SessionId = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        
        SET @tState = 'OK~00000~Sec_Users_Create_Session~SESSIONID=' + CAST(@SessionId AS VARCHAR) + '|EXPIRY=' + CONVERT(VARCHAR, @ExpiresDate, 127) + '~Session created';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR) + '~Sec_Users_Create_Session~N/A~' + @ErrorMessage;
    END CATCH
END;
```

**tState Contracts**:
| Status | ErrorCode | Data | Message | Scenario |
|--------|-----------|------|---------|----------|
| OK | 00000 | SESSIONID=1\|EXPIRY=2026-02-09T15:30:00.0000000 | Session created | Session created successfully |
| ERR | 2627 | N/A | Violation of UNIQUE KEY constraint 'UQ_Sec_Sessions_SessionToken' | SessionToken already exists (collision, should never happen with crypto random) |
| ERR | 547 | N/A | The INSERT statement conflicted with the FOREIGN KEY constraint "FK_Sec_Sessions_UserId" | Invalid UserId (user doesn't exist) |
| ERR | {SQL Error} | N/A | {SQL Error Message} | Database error |

**Business Logic**:
- Marks all previous sessions inactive (enforces single session per user)
- Session expires 30 minutes from creation (CreatedDate + 30 minutes)
- Transaction ensures atomicity (either both UPDATE and INSERT succeed, or both roll back)

---

### 3. Sec_Users_End_Session

**Purpose**: Marks a session as inactive (logout).

**Parameters**:
```sql
CREATE PROCEDURE Sec_Users_End_Session
    @SessionToken NVARCHAR(500),
    @IpAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId INT;
    DECLARE @Username NVARCHAR(100);
    DECLARE @SessionId INT;
    
    BEGIN TRY
        -- Find session and user
        SELECT @SessionId = s.SessionId, @UserId = s.UserId, @Username = u.Username
        FROM Sec_Sessions s
        INNER JOIN Sec_Users u ON s.UserId = u.UserId
        WHERE s.SessionToken = @SessionToken AND s.IsActive = 1;
        
        -- Session not found
        IF @SessionId IS NULL
        BEGIN
            SET @tState = 'ERR~SEC-02-001~Sec_Users_End_Session~TOKEN=' + LEFT(@SessionToken, 20) + '...~Session does not exist or already inactive';
            RETURN;
        END
        
        BEGIN TRANSACTION;
        
        -- Mark session inactive
        UPDATE Sec_Sessions
        SET IsActive = 0
        WHERE SessionId = @SessionId;
        
        -- Log logout event
        EXEC Audit_AuthEvents_Insert 
            @UserId = @UserId,
            @Username = @Username,
            @EventType = 'LOGOUT',
            @Success = 1,
            @ErrorCode = NULL,
            @IpAddress = @IpAddress,
            @UserAgent = @UserAgent,
            @tState = @tState OUTPUT;
        
        COMMIT TRANSACTION;
        
        SET @tState = 'OK~00000~Sec_Users_End_Session~SESSIONID=' + CAST(@SessionId AS VARCHAR) + '~Logout successful';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR) + '~Sec_Users_End_Session~N/A~' + @ErrorMessage;
    END CATCH
END;
```

**tState Contracts**:
| Status | ErrorCode | Data | Message | Scenario |
|--------|-----------|------|---------|----------|
| OK | 00000 | SESSIONID=1 | Logout successful | Session marked inactive |
| ERR | SEC-02-001 | TOKEN=abc123... | Session does not exist or already inactive | SessionToken not found or IsActive = 0 |
| ERR | {SQL Error} | N/A | {SQL Error Message} | Database error |

---

### 4. Sec_Users_Validate_Session

**Purpose**: Validates session token and checks expiration.

**Parameters**:
```sql
CREATE PROCEDURE Sec_Users_Validate_Session
    @SessionToken NVARCHAR(500),
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SessionId INT;
    DECLARE @UserId INT;
    DECLARE @ExpiresDate DATETIME2;
    DECLARE @IsActive BIT;
    
    BEGIN TRY
        -- Find session
        SELECT @SessionId = SessionId, @UserId = UserId, @ExpiresDate = ExpiresDate, @IsActive = IsActive
        FROM Sec_Sessions
        WHERE SessionToken = @SessionToken;
        
        -- Session not found
        IF @SessionId IS NULL
        BEGIN
            SET @tState = 'ERR~SEC-02-001~Sec_Users_Validate_Session~TOKEN=' + LEFT(@SessionToken, 20) + '...~Session does not exist';
            RETURN;
        END
        
        -- Session inactive
        IF @IsActive = 0
        BEGIN
            SET @tState = 'ERR~SEC-02-003~Sec_Users_Validate_Session~SESSIONID=' + CAST(@SessionId AS VARCHAR) + '~Session has been terminated';
            RETURN;
        END
        
        -- Session expired
        IF @ExpiresDate < GETUTCDATE()
        BEGIN
            -- Mark session inactive
            UPDATE Sec_Sessions
            SET IsActive = 0
            WHERE SessionId = @SessionId;
            
            -- Log expiration event (optional: may be too noisy in audit log)
            -- EXEC Audit_AuthEvents_Insert ...
            
            SET @tState = 'ERR~SEC-02-002~Sec_Users_Validate_Session~EXPIRY=' + CONVERT(VARCHAR, @ExpiresDate, 127) + '~Session has expired';
            RETURN;
        END
        
        -- Session valid
        SET @tState = 'OK~00000~Sec_Users_Validate_Session~USERID=' + CAST(@UserId AS VARCHAR) + '|EXPIRY=' + CONVERT(VARCHAR, @ExpiresDate, 127) + '~Session valid';
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR) + '~Sec_Users_Validate_Session~N/A~' + @ErrorMessage;
    END CATCH
END;
```

**tState Contracts**:
| Status | ErrorCode | Data | Message | Scenario |
|--------|-----------|------|---------|----------|
| OK | 00000 | USERID=1\|EXPIRY=2026-02-09T15:30:00.0000000 | Session valid | Session active and not expired |
| ERR | SEC-02-001 | TOKEN=abc123... | Session does not exist | SessionToken not found |
| ERR | SEC-02-002 | EXPIRY=2026-02-09T15:00:00.0000000 | Session has expired | ExpiresDate < current time |
| ERR | SEC-02-003 | SESSIONID=1 | Session has been terminated | IsActive = 0 (user logged out) |
| ERR | {SQL Error} | N/A | {SQL Error Message} | Database error |

**Business Logic**:
- If session expired, automatically marks IsActive = 0 (cleanup)
- Does NOT log expiration to audit table (too noisy; can be added if needed)
- Returns expiration timestamp in success case for client-side timeout tracking

---

### 5. Audit_AuthEvents_Insert

**Purpose**: Logs authentication event to audit table.

**Parameters**:
```sql
CREATE PROCEDURE Audit_AuthEvents_Insert
    @UserId INT = NULL,
    @Username NVARCHAR(100),
    @EventType NVARCHAR(50),
    @Success BIT,
    @ErrorCode NVARCHAR(20) = NULL,
    @IpAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @AdditionalInfo NVARCHAR(MAX) = NULL,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO Audit_AuthEvents (UserId, Username, EventType, Success, ErrorCode, EventTimestamp, IpAddress, UserAgent, AdditionalInfo)
        VALUES (@UserId, @Username, @EventType, @Success, @ErrorCode, GETUTCDATE(), @IpAddress, @UserAgent, @AdditionalInfo);
        
        SET @tState = 'OK~00000~Audit_AuthEvents_Insert~EVENTID=' + CAST(SCOPE_IDENTITY() AS VARCHAR) + '~Audit event logged';
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        -- Audit failure should not block primary operation, but log error
        SET @tState = 'ERR~SEC-03-001~Audit_AuthEvents_Insert~N/A~Failed to log audit event: ' + @ErrorMessage;
        -- Note: Application layer should log this error but continue execution
    END CATCH
END;
```

**tState Contracts**:
| Status | ErrorCode | Data | Message | Scenario |
|--------|-----------|------|---------|----------|
| OK | 00000 | EVENTID=123 | Audit event logged | Event inserted successfully |
| ERR | SEC-03-001 | N/A | Failed to log audit event: {details} | Audit insert failed (application should log but continue) |

**Usage Examples**:
```sql
-- Log successful login
EXEC Audit_AuthEvents_Insert 
    @UserId = 1, 
    @Username = 'Admin', 
    @EventType = 'LOGIN', 
    @Success = 1, 
    @ErrorCode = NULL, 
    @IpAddress = '192.168.1.100', 
    @UserAgent = 'Mozilla/5.0...', 
    @tState = @tState OUTPUT;

-- Log failed login (invalid credentials)
EXEC Audit_AuthEvents_Insert 
    @UserId = NULL, 
    @Username = 'Admin', 
    @EventType = 'LOGIN', 
    @Success = 0, 
    @ErrorCode = 'SEC-01-001', 
    @IpAddress = '192.168.1.100', 
    @UserAgent = 'Mozilla/5.0...', 
    @tState = @tState OUTPUT;
```

---

## Application Layer Entities

### 1. AuthenticationResult

**Purpose**: Service layer result model for authentication operations.

**C# Model**:
```csharp
namespace Application.Models;

public class AuthenticationResult
{
    public bool IsAuthenticated { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    
    public static AuthenticationResult Success(int userId, string username)
    {
        return new AuthenticationResult
        {
            IsAuthenticated = true,
            UserId = userId,
            Username = username
        };
    }
    
    public static AuthenticationResult Failure(string errorCode, string errorMessage)
    {
        return new AuthenticationResult
        {
            IsAuthenticated = false,
            ErrorCode = errorCode,
            ErrorMessage = errorMessage
        };
    }
}
```

---

### 2. SessionInfo

**Purpose**: Service layer model for session data.

**C# Model**:
```csharp
namespace Application.Models;

public class SessionInfo
{
    public int SessionId { get; set; }
    public int UserId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public DateTime ExpiresDate { get; set; }
    public bool IsValid { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    
    public static SessionInfo Valid(int sessionId, int userId, string sessionToken, DateTime expiresDate)
    {
        return new SessionInfo
        {
            SessionId = sessionId,
            UserId = userId,
            SessionToken = sessionToken,
            ExpiresDate = expiresDate,
            IsValid = true
        };
    }
    
    public static SessionInfo Invalid(string errorCode, string errorMessage)
    {
        return new SessionInfo
        {
            IsValid = false,
            ErrorCode = errorCode,
            ErrorMessage = errorMessage
        };
    }
}
```

---

## Frontend TypeScript Types

### 1. User

**Purpose**: Represents authenticated user data.

**TypeScript Type**:
```typescript
// src/types/auth.types.ts
export interface User {
  userId: number;
  username: string;
}
```

---

### 2. LoginCredentials

**Purpose**: Request payload for login.

**TypeScript Type**:
```typescript
// src/types/auth.types.ts
export interface LoginCredentials {
  username: string;
  password: string;
}
```

---

### 3. Session

**Purpose**: Client-side session data.

**TypeScript Type**:
```typescript
// src/types/auth.types.ts
export interface Session {
  token: string;
  expiresAt: string; // ISO 8601 datetime
  user: User;
}
```

---

### 4. LoginResponse

**Purpose**: API response for login endpoint.

**TypeScript Type**:
```typescript
// src/types/api.types.ts
export interface LoginResponse {
  success: boolean;
  session?: Session;
  errorCode?: string;
  errorMessage?: string;
}
```

---

## Entity Relationships

```
Sec_Users (1) ──────< (N) Sec_Sessions
    │
    │ (1)
    │
    └──────< (N) Audit_AuthEvents
```

**Relationships**:
1. **Sec_Users → Sec_Sessions**: One-to-Many
   - One user can have multiple sessions (historical records)
   - Only one session is active at a time (IsActive = 1, enforced by stored procedure)
   - Foreign key: `Sec_Sessions.UserId` → `Sec_Users.UserId`

2. **Sec_Users → Audit_AuthEvents**: One-to-Many
   - One user can have multiple audit events
   - UserId nullable in audit table (for failed login attempts where user doesn't exist)
   - Foreign key: `Audit_AuthEvents.UserId` → `Sec_Users.UserId`

---

## State Transitions

### Session State Machine

```
[User Logs In]
      ↓
[Create Session] → IsActive = 1, ExpiresDate = Now + 30 min
      ↓
   {Active Session}
      ↓
      ├─→ [User Logs Out] → IsActive = 0 (Manual termination)
      ├─→ [Session Expires] → IsActive = 0 (Timeout expiration)
      └─→ [New Login] → Previous session: IsActive = 0, New session: IsActive = 1
```

**Valid Transitions**:
- Active (IsActive=1, ExpiresDate > Now) → Inactive via logout (IsActive=0)
- Active (IsActive=1, ExpiresDate > Now) → Inactive via expiration (IsActive=0)
- Active (IsActive=1, ExpiresDate > Now) → Inactive via new login (IsActive=0)

**Invalid Transitions**:
- Inactive (IsActive=0) → Active (IsActive=1) — Cannot reactivate expired/logged out session

---

## Validation Rules

### Username Validation
- **Client-side**: Required, 3-100 characters, alphanumeric + underscore
- **Database**: CHECK constraint `CK_Sec_Users_Username_Length` (LEN >= 3)
- **Frontend regex**: `^[a-zA-Z0-9_]{3,100}$`

### Password Validation
- **Client-side**: Required, minimum 8 characters (recommended), no client-side strength validation for MVP
- **Database**: PasswordHash stored as BCrypt hash (60 characters), CHECK constraint `CK_Sec_Users_PasswordHash_Length` (LEN >= 60)
- **Application**: BCrypt.Verify for password matching

### SessionToken Validation
- **Application**: JWT token format, signed with HS256, validated on each request
- **Database**: UNIQUE constraint on `Sec_Sessions.SessionToken`, NVARCHAR(500) to accommodate JWT length

---

## Constitutional Alignment

✅ **Database-as-Authority (Section V)**:
- All CRUD operations via stored procedures (`Sec_Users_Authenticate_User`, `Sec_Users_Create_Session`, etc.)
- No direct table access from application code
- Business logic (authentication validation, session expiration) enforced in stored procedures

✅ **tState Output Pattern (Section VI)**:
- All stored procedures return `@tState VARCHAR(500) OUTPUT`
- Format: `<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>`
- Native SQL Server error numbers preserved (e.g., `ERR~2627~...` for unique constraint violation)
- Application-level error codes follow taxonomy (e.g., `SEC-01-001`, `SEC-02-002`)

✅ **Layered Architecture (Section IV)**:
- **Database Layer**: Stored procedures enforce data integrity, authentication logic, auditing
- **Infrastructure Layer**: Dapper executes stored procedures, parses tState, maps to application models
- **Application Layer**: AuthenticationService orchestrates use cases, interprets tState, controls flow
- **Controllers Layer**: HTTP transport, request validation, invokes Application services

✅ **Auditing (Section VI)**:
- All authentication events logged to `Audit_AuthEvents` table
- Includes: UserId, Username, EventType, Success, ErrorCode, Timestamp, IpAddress, UserAgent
- Audit procedure (`Audit_AuthEvents_Insert`) called from within other procedures (transactional integrity)

---

## Next Steps: Phase 1 Continuation

1. **contracts/**: Generate OpenAPI specification for `/api/auth` endpoints
2. **quickstart.md**: Document developer setup instructions (database creation, migration execution, running tests)
3. **Update agent context**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` to add data model decisions

Data model design complete and ready for implementation.
