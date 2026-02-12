-- Migration: 003_Create_Audit_AuthEvents_Table
-- Purpose: Create Audit_AuthEvents table for authentication event logging
-- Date: 2026-02-09

CREATE TABLE Audit_AuthEvents (
    EventId         BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NULL,
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
GO
