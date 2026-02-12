-- Migration: 008_Create_Stored_Procedure_Sec_Users_Validate_Session
-- Purpose: Create stored procedure for session validation
-- Date: 2026-02-09

CREATE PROCEDURE Sec_Users_Validate_Session
    @SessionToken NVARCHAR(500),
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SessionId INT;
    DECLARE @UserId INT;
    DECLARE @Username NVARCHAR(100);
    DECLARE @ExpiresDate DATETIME2;
    DECLARE @IsActive BIT;
    
    BEGIN TRY
        -- Find session with user details
        SELECT @SessionId = s.SessionId, @UserId = s.UserId, @Username = u.Username, 
               @ExpiresDate = s.ExpiresDate, @IsActive = s.IsActive
        FROM Sec_Sessions s
        INNER JOIN Sec_Users u ON s.UserId = u.UserId
        WHERE s.SessionToken = @SessionToken;
        
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
            
            SET @tState = 'ERR~SEC-02-002~Sec_Users_Validate_Session~EXPIRY=' + CONVERT(VARCHAR, @ExpiresDate, 127) + '~Session has expired';
            RETURN;
        END
        
        -- Session valid - include username in data
        SET @tState = 'OK~00000~Sec_Users_Validate_Session~USERID=' + CAST(@UserId AS VARCHAR) + '|USERNAME=' + @Username + '|EXPIRY=' + CONVERT(VARCHAR, @ExpiresDate, 127) + '~Session valid';
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR) + '~Sec_Users_Validate_Session~N/A~' + @ErrorMessage;
    END CATCH
END;
GO
