-- Migration: 005_Create_Stored_Procedure_Sec_Users_Authenticate_User
-- Purpose: Create stored procedure for user authentication
-- Date: 2026-02-09

CREATE PROCEDURE Sec_Users_Authenticate_User
    @Username NVARCHAR(100),
    @IpAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId INT;
    DECLARE @PasswordHash NVARCHAR(255);
    DECLARE @IsActive BIT;
    
    BEGIN TRY
        -- Lookup user by username
        SELECT @UserId = UserId, @PasswordHash = PasswordHash, @IsActive = IsActive
        FROM Sec_Users
        WHERE Username = @Username;
        
        -- User not found
        IF @UserId IS NULL
        BEGIN
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
        
        SET @tState = 'OK~00000~Sec_Users_Authenticate_User~USERID=' + CAST(@UserId AS VARCHAR) + '|PASSWORDHASH=' + @PasswordHash + '~Login successful';
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR) + '~Sec_Users_Authenticate_User~N/A~' + @ErrorMessage;
    END CATCH
END;
GO
