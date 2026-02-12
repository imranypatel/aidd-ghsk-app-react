-- Migration: 007_Create_Stored_Procedure_Sec_Users_End_Session
-- Purpose: Create stored procedure for session termination (logout)
-- Date: 2026-02-09

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
GO
