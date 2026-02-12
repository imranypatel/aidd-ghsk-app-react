-- Rollback: 010_Create_Indexes
DROP INDEX IF EXISTS IX_Audit_AuthEvents_EventType_Timestamp ON Audit_AuthEvents;
DROP INDEX IF EXISTS IX_Audit_AuthEvents_Username_Timestamp ON Audit_AuthEvents;
DROP INDEX IF EXISTS IX_Sec_Sessions_UserId_Active ON Sec_Sessions;
DROP INDEX IF EXISTS IX_Sec_Sessions_SessionToken ON Sec_Sessions;
DROP INDEX IF EXISTS IX_Sec_Users_Email ON Sec_Users;
DROP INDEX IF EXISTS IX_Sec_Users_Username ON Sec_Users;
GO
