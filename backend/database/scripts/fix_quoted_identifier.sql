-- =============================================
-- Fix QUOTED_IDENTIFIER Issue for Stored Procedures
-- =============================================
-- This script recreates all authentication stored procedures with
-- SET QUOTED_IDENTIFIER ON to fix the runtime error:
-- "UPDATE failed because the following SET options have incorrect settings: 'QUOTED_IDENTIFIER'"
--
-- Run this script against the TRANTS_EMS_DEV database to fix the issue.
-- =============================================

USE TRANTS_EMS_DEV;
GO

-- Set session options for creating stored procedures
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =============================================
-- Stored Procedure: Sec_Users_Authenticate_User
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sec_Users_Authenticate_User]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[Sec_Users_Authenticate_User]
GO

CREATE PROCEDURE [dbo].[Sec_Users_Authenticate_User]
    @Username NVARCHAR(50),
    @IpAddress NVARCHAR(45),
    @UserAgent NVARCHAR(500),
    @tState NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserId INT;
    DECLARE @PasswordHash NVARCHAR(255);
    DECLARE @IsActive BIT;
    DECLARE @ErrorCode NVARCHAR(20);
    DECLARE @Message NVARCHAR(200);
    DECLARE @Data NVARCHAR(500);

    BEGIN TRY
        -- Retrieve user information
        SELECT 
            @UserId = UserId,
            @PasswordHash = PasswordHash,
            @IsActive = IsActive
        FROM Sec_Users
        WHERE Username = @Username;

        IF @UserId IS NULL
        BEGIN
            SET @ErrorCode = 'SEC-01-001';
            SET @Message = 'User not found';
            SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_Authenticate_User~N/A~' + @Message;
            RETURN;
        END

        IF @IsActive = 0
        BEGIN
            SET @ErrorCode = 'SEC-01-002';
            SET @Message = 'User account is inactive';
            SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_Authenticate_User~N/A~' + @Message;
            RETURN;
        END

        -- Update last login timestamp
        UPDATE Sec_Users
        SET LastLoginDate = GETDATE()
        WHERE UserId = @UserId;

        -- Return success with user data
        SET @Data = 'USERID=' + CAST(@UserId AS NVARCHAR(10)) + '|PASSWORDHASH=' + @PasswordHash;
        SET @tState = 'OK~00000~Sec_Users_Authenticate_User~' + @Data + '~User authenticated successfully';

    END TRY
    BEGIN CATCH
        SET @ErrorCode = 'SYS-00-999';
        SET @Message = ERROR_MESSAGE();
        SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_Authenticate_User~N/A~' + @Message;
    END CATCH
END
GO

-- =============================================
-- Stored Procedure: Sec_Users_Create_Session
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sec_Users_Create_Session]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[Sec_Users_Create_Session]
GO

CREATE PROCEDURE [dbo].[Sec_Users_Create_Session]
    @UserId INT,
    @SessionToken NVARCHAR(500),
    @IpAddress NVARCHAR(45),
    @UserAgent NVARCHAR(500),
    @tState NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SessionId INT;
    DECLARE @ExpiresDate DATETIME;
    DECLARE @ErrorCode NVARCHAR(20);
    DECLARE @Message NVARCHAR(200);
    DECLARE @Data NVARCHAR(500);

    BEGIN TRY
        -- Verify user exists
        IF NOT EXISTS (SELECT 1 FROM Sec_Users WHERE UserId = @UserId)
        BEGIN
            SET @ErrorCode = 'SEC-02-001';
            SET @Message = 'User not found';
            SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_Create_Session~N/A~' + @Message;
            RETURN;
        END

        -- Set expiry to 24 hours from now
        SET @ExpiresDate = DATEADD(HOUR, 24, GETDATE());

        -- Insert new session
        INSERT INTO Sec_Sessions (UserId, SessionToken, ExpiresDate, IpAddress, UserAgent, CreatedDate)
        VALUES (@UserId, @SessionToken, @ExpiresDate, @IpAddress, @UserAgent, GETDATE());

        SET @SessionId = SCOPE_IDENTITY();

        -- Return success with session data
        SET @Data = 'SESSIONID=' + CAST(@SessionId AS NVARCHAR(10)) + '|EXPIRY=' + CONVERT(NVARCHAR(30), @ExpiresDate, 127);
        SET @tState = 'OK~00000~Sec_Users_Create_Session~' + @Data + '~Session created successfully';

    END TRY
    BEGIN CATCH
        SET @ErrorCode = 'SYS-00-999';
        SET @Message = ERROR_MESSAGE();
        SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_Create_Session~N/A~' + @Message;
    END CATCH
END
GO

-- =============================================
-- Stored Procedure: Sec_Users_Validate_Session
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sec_Users_Validate_Session]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[Sec_Users_Validate_Session]
GO

CREATE PROCEDURE [dbo].[Sec_Users_Validate_Session]
    @SessionToken NVARCHAR(500),
    @tState NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserId INT;
    DECLARE @ExpiresDate DATETIME;
    DECLARE @IsActive BIT;
    DECLARE @ErrorCode NVARCHAR(20);
    DECLARE @Message NVARCHAR(200);
    DECLARE @Data NVARCHAR(500);

    BEGIN TRY
        -- Retrieve session information
        SELECT 
            @UserId = s.UserId,
            @ExpiresDate = s.ExpiresDate,
            @IsActive = s.IsActive
        FROM Sec_Sessions s
        WHERE s.SessionToken = @SessionToken;

        IF @UserId IS NULL
        BEGIN
            SET @ErrorCode = 'SEC-03-001';
            SET @Message = 'Session not found';
            SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_Validate_Session~N/A~' + @Message;
            RETURN;
        END

        IF @ExpiresDate < GETDATE()
        BEGIN
            SET @ErrorCode = 'SEC-03-002';
            SET @Message = 'Session has expired';
            SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_Validate_Session~N/A~' + @Message;
            RETURN;
        END

        IF @IsActive = 0
        BEGIN
            SET @ErrorCode = 'SEC-03-003';
            SET @Message = 'Session has been terminated';
            SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_Validate_Session~N/A~' + @Message;
            RETURN;
        END

        -- Update last activity timestamp
        UPDATE Sec_Sessions
        SET CreatedDate = GETDATE()
        WHERE SessionToken = @SessionToken;

        -- Return success with session data
        SET @Data = 'USERID=' + CAST(@UserId AS NVARCHAR(10)) + '|EXPIRY=' + CONVERT(NVARCHAR(30), @ExpiresDate, 127);
        SET @tState = 'OK~00000~Sec_Users_Validate_Session~' + @Data + '~Session is valid';

    END TRY
    BEGIN CATCH
        SET @ErrorCode = 'SYS-00-999';
        SET @Message = ERROR_MESSAGE();
        SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_Validate_Session~N/A~' + @Message;
    END CATCH
END
GO

-- =============================================
-- Stored Procedure: Sec_Users_End_Session
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sec_Users_End_Session]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[Sec_Users_End_Session]
GO

CREATE PROCEDURE [dbo].[Sec_Users_End_Session]
    @SessionToken NVARCHAR(500),
    @IpAddress NVARCHAR(45),
    @UserAgent NVARCHAR(500),
    @tState NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SessionId INT;
    DECLARE @ErrorCode NVARCHAR(20);
    DECLARE @Message NVARCHAR(200);

    BEGIN TRY
        -- Check if session exists
        SELECT @SessionId = SessionId
        FROM Sec_Sessions
        WHERE SessionToken = @SessionToken AND IsActive = 1;

        IF @SessionId IS NULL
        BEGIN
            SET @ErrorCode = 'SEC-02-001';
            SET @Message = 'Active session not found';
            SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_End_Session~N/A~' + @Message;
            RETURN;
        END

        -- Mark session as inactive
        UPDATE Sec_Sessions
        SET IsActive = 0,
            CreatedDate = GETDATE()
        WHERE SessionId = @SessionId;

        SET @tState = 'OK~00000~Sec_Users_End_Session~N/A~Session ended successfully';

    END TRY
    BEGIN CATCH
        SET @ErrorCode = 'SYS-00-999';
        SET @Message = ERROR_MESSAGE();
        SET @tState = 'ERR~' + @ErrorCode + '~Sec_Users_End_Session~N/A~' + @Message;
    END CATCH
END
GO

-- =============================================
-- Stored Procedure: Audit_AuthEvents_Insert
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Audit_AuthEvents_Insert]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[Audit_AuthEvents_Insert]
GO

CREATE PROCEDURE [dbo].[Audit_AuthEvents_Insert]
    @UserId INT = NULL,
    @Username NVARCHAR(50) = NULL,
    @EventType NVARCHAR(50),
    @Success BIT,
    @ErrorCode NVARCHAR(20) = NULL,
    @IpAddress NVARCHAR(45),
    @UserAgent NVARCHAR(500),
    @AdditionalInfo NVARCHAR(MAX) = NULL,
    @tState NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EventId INT;
    DECLARE @ErrorCodeLocal NVARCHAR(20);
    DECLARE @Message NVARCHAR(200);

    BEGIN TRY
        INSERT INTO Audit_AuthEvents (
            UserId, Username, EventType, Success, ErrorCode,
            IpAddress, UserAgent, AdditionalInfo, EventTimestamp
        )
        VALUES (
            @UserId, @Username, @EventType, @Success, @ErrorCode,
            @IpAddress, @UserAgent, @AdditionalInfo, GETDATE()
        );

        SET @EventId = SCOPE_IDENTITY();
        SET @tState = 'OK~00000~Audit_AuthEvents_Insert~EVENTID=' + CAST(@EventId AS NVARCHAR(10)) + '~Audit event logged successfully';

    END TRY
    BEGIN CATCH
        SET @ErrorCodeLocal = 'SYS-00-999';
        SET @Message = ERROR_MESSAGE();
        SET @tState = 'ERR~' + @ErrorCodeLocal + '~Audit_AuthEvents_Insert~N/A~' + @Message;
    END CATCH
END
GO

PRINT 'All stored procedures have been successfully recreated with QUOTED_IDENTIFIER ON';
GO

