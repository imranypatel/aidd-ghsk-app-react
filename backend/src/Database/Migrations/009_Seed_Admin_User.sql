-- Migration: 009_Seed_Admin_User
-- Purpose: Insert seed data for Admin user
-- Date: 2026-02-09
-- Password: Admin123@ (BCrypt hash with 12 rounds)

INSERT INTO Sec_Users (Username, PasswordHash, FirstName, LastName, Email, Phone, Address, LastLoginDate, IsActive, CreatedDate, ModifiedDate)
VALUES ('Admin', '$2a$12$yWXuJUSrm5HaiqLCkS5Qh.6.yXl5PeQNJbsWY.W//AMYEcn9OVtDS', 'System', 'Administrator', 'admin@example.com', NULL, NULL, NULL, 1, GETUTCDATE(), GETUTCDATE());
GO
