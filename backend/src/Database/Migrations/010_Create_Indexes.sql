-- Migration: 010_Create_Indexes
-- Purpose: Create indexes for performance optimization
-- Date: 2026-02-09

SET QUOTED_IDENTIFIER ON;
GO

-- Index for fast username lookup during authentication
CREATE UNIQUE NONCLUSTERED INDEX IX_Sec_Users_Username 
ON Sec_Users(Username) 
WHERE IsActive = 1;
GO

-- Index for unique email constraint
CREATE UNIQUE NONCLUSTERED INDEX IX_Sec_Users_Email 
ON Sec_Users(Email) 
WHERE IsActive = 1;
GO

-- Index for fast session token validation
CREATE UNIQUE NONCLUSTERED INDEX IX_Sec_Sessions_SessionToken 
ON Sec_Sessions(SessionToken) 
WHERE IsActive = 1;
GO

-- Composite index for user session queries
CREATE NONCLUSTERED INDEX IX_Sec_Sessions_UserId_Active 
ON Sec_Sessions(UserId, IsActive) 
INCLUDE (SessionToken, ExpiresDate);
GO

-- Index for audit log queries by username
CREATE NONCLUSTERED INDEX IX_Audit_AuthEvents_Username_Timestamp 
ON Audit_AuthEvents(Username, EventTimestamp DESC);
GO

-- Index for audit log queries by event type
CREATE NONCLUSTERED INDEX IX_Audit_AuthEvents_EventType_Timestamp 
ON Audit_AuthEvents(EventType, EventTimestamp DESC);
GO
