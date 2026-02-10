-- Migration: 006_Create_Stored_Procedure_Sec_Users_Create_Session
-- Purpose: Create stored procedure for session creation
-- Date: 2026-02-09

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
GO
