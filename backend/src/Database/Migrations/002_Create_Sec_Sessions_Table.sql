-- Migration: 002_Create_Sec_Sessions_Table
-- Purpose: Create Sec_Sessions table for session management and tracking
-- Date: 2026-02-09

CREATE TABLE Sec_Sessions (
    SessionId       INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NOT NULL,
    SessionToken    NVARCHAR(500) NOT NULL,
    CreatedDate     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ExpiresDate     DATETIME2 NOT NULL,
    IsActive        BIT NOT NULL DEFAULT 1,
    IpAddress       NVARCHAR(45) NULL,
    UserAgent       NVARCHAR(500) NULL,
    
    CONSTRAINT UQ_Sec_Sessions_SessionToken UNIQUE (SessionToken),
    CONSTRAINT FK_Sec_Sessions_UserId FOREIGN KEY (UserId) REFERENCES Sec_Users(UserId)
);
GO
