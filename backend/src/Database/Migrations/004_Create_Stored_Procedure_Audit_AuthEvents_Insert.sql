-- Migration: 004_Create_Stored_Procedure_Audit_AuthEvents_Insert
-- Purpose: Create stored procedure for logging authentication events
-- Date: 2026-02-09

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
        
        SET @tState = 'ERR~SEC-03-001~Audit_AuthEvents_Insert~N/A~Failed to log audit event: ' + @ErrorMessage;
    END CATCH
END;
GO
