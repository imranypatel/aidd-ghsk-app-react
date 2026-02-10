-- Migration: 001_Create_Sec_Users_Table
-- Purpose: Create Sec_Users table for user credentials and account information
-- Date: 2026-02-09

CREATE TABLE Sec_Users (
    UserId          INT IDENTITY(1,1) PRIMARY KEY,
    Username        NVARCHAR(100) NOT NULL,
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
    
    CONSTRAINT UQ_Sec_Users_Username UNIQUE (Username),
    CONSTRAINT CK_Sec_Users_Username_Length CHECK (LEN(Username) >= 3),
    CONSTRAINT CK_Sec_Users_PasswordHash_Length CHECK (LEN(PasswordHash) >= 60),
    CONSTRAINT CK_Sec_Users_Email_Format CHECK (Email LIKE '%@%.%')
);
GO
