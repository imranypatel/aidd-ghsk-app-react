-- Rollback: 009_Seed_Admin_User
DELETE FROM Sec_Users WHERE Username = 'Admin';
GO
