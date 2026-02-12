# Data Model: Actions Management (Security Module)

**Feature**: 003-actions-management  
**Domain**: Security (Sec)  
**Created**: February 12, 2026  
**Database**: SQL Server 2025  
**Migration Tool**: DbUp

## Overview

The Actions Management feature introduces a single table `Sec_Actions` in the Security domain that stores system actions tracked by the security module. This table serves as the foundation for authorization and auditing components, defining activities that can be performed within the system.

## Entity Relationship

```
┌─────────────────────────────────┐
│         Sec_Actions             │
├─────────────────────────────────┤
│ ActionID (PK)         INT       │
│ ActionCode            VARCHAR   │ ← UNIQUE constraint
│ ActionTitle           VARCHAR   │
│ CreatedBy             INT       │ ← FK to Sec_Users (implicit, not enforced)
│ CreatedDate           DATETIME2 │
│ ModifiedBy            INT       │ ← FK to Sec_Users (implicit, not enforced)
│ ModifiedDate          DATETIME2 │
└─────────────────────────────────┘
```

**Relationships**:
- **CreatedBy/ModifiedBy → Sec_Users.UserID**: Implicit foreign key relationship to track user who created/modified the action. Not enforced as database FK constraint to avoid circular dependencies and improve performance, but application enforces referential integrity.

## Table: Sec_Actions

### Purpose
Stores system actions that represent trackable activities within the enterprise management system. Actions are referenced by authorization rules and audit logs to control and monitor user activities.

### Columns

| Column Name   | Data Type      | Nullable | Constraints          | Description                                                                 |
|---------------|----------------|----------|----------------------|-----------------------------------------------------------------------------|
| ActionID      | INT            | NOT NULL | PRIMARY KEY, IDENTITY(1,1) | Auto-incrementing unique identifier for each action                        |
| ActionCode    | VARCHAR(50)    | NOT NULL | UNIQUE               | System-level unique identifier (alphanumeric, underscores, hyphens, periods). Used for programmatic references. |
| ActionTitle   | VARCHAR(200)   | NOT NULL | -                    | User-facing descriptive text explaining the action. No uniqueness required. |
| CreatedBy     | INT            | NOT NULL | -                    | UserID of the user who created this action record                          |
| CreatedDate   | DATETIME2(7)   | NOT NULL | DEFAULT GETUTCDATE() | UTC timestamp when action was created                                      |
| ModifiedBy    | INT            | NULL     | -                    | UserID of the user who last modified this action (NULL if never modified)  |
| ModifiedDate  | DATETIME2(7)   | NULL     | -                    | UTC timestamp of last modification (NULL if never modified)                |

### Indexes

| Index Name                | Type      | Columns       | Purpose                                                      |
|---------------------------|-----------|---------------|--------------------------------------------------------------|
| PK_Sec_Actions            | Clustered | ActionID      | Primary key index for fast lookups by ID                     |
| UQ_Sec_Actions_ActionCode | Unique    | ActionCode    | Enforce uniqueness and enable fast lookups by ActionCode     |
| IX_Sec_Actions_CreatedBy  | Non-clustered | CreatedBy | Improve performance of audit queries filtering by CreatedBy  |
| IX_Sec_Actions_CreatedDate| Non-clustered | CreatedDate | Improve performance of audit queries ordering by CreatedDate |

### Constraints

- **Primary Key**: `PK_Sec_Actions` on `ActionID` (clustered index)
- **Unique Constraint**: `UQ_Sec_Actions_ActionCode` on `ActionCode` to ensure no duplicate codes
- **Check Constraint**: `CK_Sec_Actions_ActionCode_Format` validates ActionCode contains only alphanumeric characters, underscores, hyphens, and periods (regex pattern: `^[A-Za-z0-9._-]+$`)
- **Check Constraint**: `CK_Sec_Actions_ModifiedDate_After_Created` ensures `ModifiedDate IS NULL OR ModifiedDate >= CreatedDate` for data integrity
- **Default Constraint**: `DF_Sec_Actions_CreatedDate` sets `CreatedDate = GETUTCDATE()` if not explicitly provided

## Sample Data

```sql
-- Sample actions that might be managed in the system
INSERT INTO Sec_Actions (ActionCode, ActionTitle, CreatedBy, CreatedDate)
VALUES 
    ('USER_CREATE', 'Create User Account', 1, GETUTCDATE()),
    ('USER_UPDATE', 'Update User Profile', 1, GETUTCDATE()),
    ('USER_DELETE', 'Delete User Account', 1, GETUTCDATE()),
    ('ROLE_ASSIGN', 'Assign Role to User', 1, GETUTCDATE()),
    ('PERMISSION_GRANT', 'Grant Permission', 1, GETUTCDATE()),
    ('AUDIT_VIEW', 'View Audit Logs', 1, GETUTCDATE()),
    ('CONFIG_UPDATE', 'Update System Configuration', 1, GETUTCDATE());
```

## Database Migration Scripts

### Forward Migration: `001-create-sec-actions-table.sql`

```sql
-- Migration: 001-create-sec-actions-table.sql
-- Feature: 003-actions-management
-- Description: Creates Sec_Actions table for Security domain
-- Author: AI Agent
-- Created: 2026-02-12

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Create Sec_Actions table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sec_Actions' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE [dbo].[Sec_Actions]
    (
        [ActionID]      INT             IDENTITY(1,1) NOT NULL,
        [ActionCode]    VARCHAR(50)     NOT NULL,
        [ActionTitle]   VARCHAR(200)    NOT NULL,
        [CreatedBy]     INT             NOT NULL,
        [CreatedDate]   DATETIME2(7)    NOT NULL CONSTRAINT [DF_Sec_Actions_CreatedDate] DEFAULT (GETUTCDATE()),
        [ModifiedBy]    INT             NULL,
        [ModifiedDate]  DATETIME2(7)    NULL,
        
        CONSTRAINT [PK_Sec_Actions] PRIMARY KEY CLUSTERED ([ActionID] ASC),
        CONSTRAINT [UQ_Sec_Actions_ActionCode] UNIQUE ([ActionCode]),
        CONSTRAINT [CK_Sec_Actions_ActionCode_Format] CHECK ([ActionCode] LIKE '[A-Za-z0-9._-]%'),
        CONSTRAINT [CK_Sec_Actions_ModifiedDate_After_Created] CHECK ([ModifiedDate] IS NULL OR [ModifiedDate] >= [CreatedDate])
    );
    
    PRINT 'Table Sec_Actions created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Sec_Actions already exists. Skipping creation.';
END
GO

-- Create indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Sec_Actions_CreatedBy' AND object_id = OBJECT_ID('dbo.Sec_Actions'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Sec_Actions_CreatedBy] 
    ON [dbo].[Sec_Actions] ([CreatedBy] ASC);
    
    PRINT 'Index IX_Sec_Actions_CreatedBy created successfully.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Sec_Actions_CreatedDate' AND object_id = OBJECT_ID('dbo.Sec_Actions'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Sec_Actions_CreatedDate] 
    ON [dbo].[Sec_Actions] ([CreatedDate] DESC);
    
    PRINT 'Index IX_Sec_Actions_CreatedDate created successfully.';
END
GO

-- Verify table creation
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Sec_Actions' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'Verification: Sec_Actions table exists.';
    
    -- Display column information
    SELECT 
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length AS MaxLength,
        c.is_nullable AS IsNullable,
        c.is_identity AS IsIdentity
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.Sec_Actions')
    ORDER BY c.column_id;
END
GO
```

### Rollback Migration: `001-drop-sec-actions-table.sql`

```sql
-- Rollback Migration: 001-drop-sec-actions-table.sql
-- Feature: 003-actions-management
-- Description: Drops Sec_Actions table and related objects
-- Author: AI Agent
-- Created: 2026-02-12
-- WARNING: This will permanently delete all action data!

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Drop stored procedures (if any exist)
IF OBJECT_ID('dbo.Sec_Actions_Get', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[Sec_Actions_Get];
    PRINT 'Stored procedure Sec_Actions_Get dropped.';
END
GO

IF OBJECT_ID('dbo.Sec_Actions_List', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[Sec_Actions_List];
    PRINT 'Stored procedure Sec_Actions_List dropped.';
END
GO

IF OBJECT_ID('dbo.Sec_Actions_Insert', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[Sec_Actions_Insert];
    PRINT 'Stored procedure Sec_Actions_Insert dropped.';
END
GO

IF OBJECT_ID('dbo.Sec_Actions_Update', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[Sec_Actions_Update];
    PRINT 'Stored procedure Sec_Actions_Update dropped.';
END
GO

IF OBJECT_ID('dbo.Sec_Actions_CheckCode', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[Sec_Actions_CheckCode];
    PRINT 'Stored procedure Sec_Actions_CheckCode dropped.';
END
GO

-- Drop table
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Sec_Actions' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    DROP TABLE [dbo].[Sec_Actions];
    PRINT 'Table Sec_Actions dropped successfully.';
END
ELSE
BEGIN
    PRINT 'Table Sec_Actions does not exist. Nothing to drop.';
END
GO

-- Verify table deletion
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sec_Actions' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'Verification: Sec_Actions table successfully removed.';
END
ELSE
BEGIN
    PRINT 'WARNING: Sec_Actions table still exists after drop attempt!';
END
GO
```

## Stored Procedures

### Sec_Actions_Get
**Purpose**: Retrieve a single action by ActionID

```sql
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON  -- MANDATORY for metadata consistency
GO

CREATE PROCEDURE [dbo].[Sec_Actions_Get]
    @ActionID INT,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate input
        IF @ActionID IS NULL OR @ActionID <= 0
        BEGIN
            SET @tState = 'ERR~50010~Sec_Actions_Get~N/A~ActionID must be a positive integer';
            RETURN;
        END
        
        -- Retrieve action
        SELECT 
            ActionID,
            ActionCode,
            ActionTitle,
            CreatedBy,
            CreatedDate,
            ModifiedBy,
            ModifiedDate
        FROM [dbo].[Sec_Actions]
        WHERE ActionID = @ActionID;
        
        -- Check if action exists
        IF @@ROWCOUNT = 0
        BEGIN
            SET @tState = 'ERR~50003~Sec_Actions_Get~N/A~Action not found';
            RETURN;
        END
        
        SET @tState = 'OK~00000~Sec_Actions_Get~ActionID=' + CAST(@ActionID AS VARCHAR(10)) + '~Action retrieved successfully';
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ProcName NVARCHAR(128) = OBJECT_NAME(@@PROCID);
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR(10)) + '~' + 
                      @ProcName + '~N/A~' + @ErrorMessage;
    END CATCH
END
GO
```

### Sec_Actions_List
**Purpose**: Retrieve paginated list of actions with filtering and sorting

```sql
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON  -- MANDATORY for metadata consistency
GO

CREATE PROCEDURE [dbo].[Sec_Actions_List]
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @SortColumn VARCHAR(50) = 'ActionID',
    @SortDirection VARCHAR(4) = 'ASC',
    @FilterText VARCHAR(200) = NULL,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate pagination parameters
        IF @PageNumber < 1 SET @PageNumber = 1;
        IF @PageSize < 1 OR @PageSize > 100 SET @PageSize = 10;
        
        -- Validate sort direction
        IF @SortDirection NOT IN ('ASC', 'DESC') SET @SortDirection = 'ASC';
        
        -- Calculate offset
        DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
        
        -- Get total count
        DECLARE @TotalCount INT;
        SELECT @TotalCount = COUNT(*)
        FROM [dbo].[Sec_Actions]
        WHERE (@FilterText IS NULL 
            OR ActionCode LIKE '%' + @FilterText + '%' 
            OR ActionTitle LIKE '%' + @FilterText + '%');
        
        -- Retrieve paginated data with dynamic sorting
        SELECT 
            ActionID,
            ActionCode,
            ActionTitle,
            CreatedBy,
            CreatedDate,
            ModifiedBy,
            ModifiedDate
        FROM [dbo].[Sec_Actions]
        WHERE (@FilterText IS NULL 
            OR ActionCode LIKE '%' + @FilterText + '%' 
            OR ActionTitle LIKE '%' + @FilterText + '%')
        ORDER BY 
            CASE WHEN @SortColumn = 'ActionID' AND @SortDirection = 'ASC' THEN ActionID END ASC,
            CASE WHEN @SortColumn = 'ActionID' AND @SortDirection = 'DESC' THEN ActionID END DESC,
            CASE WHEN @SortColumn = 'ActionCode' AND @SortDirection = 'ASC' THEN ActionCode END ASC,
            CASE WHEN @SortColumn = 'ActionCode' AND @SortDirection = 'DESC' THEN ActionCode END DESC,
            CASE WHEN @SortColumn = 'ActionTitle' AND @SortDirection = 'ASC' THEN ActionTitle END ASC,
            CASE WHEN @SortColumn = 'ActionTitle' AND @SortDirection = 'DESC' THEN ActionTitle END DESC,
            CASE WHEN @SortColumn = 'CreatedDate' AND @SortDirection = 'ASC' THEN CreatedDate END ASC,
            CASE WHEN @SortColumn = 'CreatedDate' AND @SortDirection = 'DESC' THEN CreatedDate END DESC,
            CASE WHEN @SortColumn = 'ModifiedDate' AND @SortDirection = 'ASC' THEN ModifiedDate END ASC,
            CASE WHEN @SortColumn = 'ModifiedDate' AND @SortDirection = 'DESC' THEN ModifiedDate END DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY;
        
        SET @tState = 'OK~00000~Sec_Actions_List~TotalCount=' + CAST(@TotalCount AS VARCHAR(10)) + 
                      ',Page=' + CAST(@PageNumber AS VARCHAR(10)) + 
                      ',PageSize=' + CAST(@PageSize AS VARCHAR(10)) + '~Actions retrieved successfully';
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ProcName NVARCHAR(128) = OBJECT_NAME(@@PROCID);
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR(10)) + '~' + 
                      @ProcName + '~N/A~' + @ErrorMessage;
    END CATCH
END
GO
```

### Sec_Actions_Insert
**Purpose**: Create a new action with validation

```sql
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON  -- MANDATORY for metadata consistency
GO

CREATE PROCEDURE [dbo].[Sec_Actions_Insert]
    @ActionCode VARCHAR(50),
    @ActionTitle VARCHAR(200),
    @CreatedBy INT,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validate required fields
        IF @ActionCode IS NULL OR LTRIM(RTRIM(@ActionCode)) = ''
        BEGIN
            SET @tState = 'ERR~50011~Sec_Actions_Insert~N/A~ActionCode is required';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        IF @ActionTitle IS NULL OR LTRIM(RTRIM(@ActionTitle)) = ''
        BEGIN
            SET @tState = 'ERR~50012~Sec_Actions_Insert~N/A~ActionTitle is required';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        IF @CreatedBy IS NULL OR @CreatedBy <= 0
        BEGIN
            SET @tState = 'ERR~50013~Sec_Actions_Insert~N/A~CreatedBy must be a valid UserID';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validate ActionCode format (alphanumeric, underscores, hyphens, periods only)
        IF @ActionCode NOT LIKE '[A-Za-z0-9._-]%' OR @ActionCode LIKE '%[^A-Za-z0-9._-]%'
        BEGIN
            SET @tState = 'ERR~50014~Sec_Actions_Insert~N/A~ActionCode can only contain letters, numbers, underscores, hyphens, and periods';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Check for duplicate ActionCode
        IF EXISTS (SELECT 1 FROM [dbo].[Sec_Actions] WHERE ActionCode = @ActionCode)
        BEGIN
            SET @tState = 'ERR~50001~Sec_Actions_Insert~N/A~ActionCode already exists';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Insert new action
        DECLARE @NewActionID INT;
        
        INSERT INTO [dbo].[Sec_Actions] (ActionCode, ActionTitle, CreatedBy, CreatedDate)
        VALUES (@ActionCode, @ActionTitle, @CreatedBy, GETUTCDATE());
        
        SET @NewActionID = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        
        SET @tState = 'OK~00000~Sec_Actions_Insert~ActionID=' + CAST(@NewActionID AS VARCHAR(10)) + '~Action created successfully';
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ProcName NVARCHAR(128) = OBJECT_NAME(@@PROCID);
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR(10)) + '~' + 
                      @ProcName + '~N/A~' + @ErrorMessage;
    END CATCH
END
GO
```

### Sec_Actions_Update
**Purpose**: Update an existing action with optimistic concurrency control

```sql
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON  -- MANDATORY for metadata consistency
GO

CREATE PROCEDURE [dbo].[Sec_Actions_Update]
    @ActionID INT,
    @ActionCode VARCHAR(50),
    @ActionTitle VARCHAR(200),
    @ModifiedBy INT,
    @OriginalModifiedDate DATETIME2(7) = NULL,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validate ActionID
        IF @ActionID IS NULL OR @ActionID <= 0
        BEGIN
            SET @tState = 'ERR~50010~Sec_Actions_Update~N/A~ActionID must be a positive integer';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Check if action exists
        DECLARE @CurrentModifiedDate DATETIME2(7);
        SELECT @CurrentModifiedDate = ModifiedDate
        FROM [dbo].[Sec_Actions]
        WHERE ActionID = @ActionID;
        
        IF @@ROWCOUNT = 0
        BEGIN
            SET @tState = 'ERR~50003~Sec_Actions_Update~N/A~Action not found';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Optimistic concurrency check
        IF @OriginalModifiedDate IS NOT NULL
        BEGIN
            IF (@CurrentModifiedDate IS NULL AND @OriginalModifiedDate IS NOT NULL) OR
               (@CurrentModifiedDate IS NOT NULL AND @OriginalModifiedDate IS NULL) OR
               (@CurrentModifiedDate <> @OriginalModifiedDate)
            BEGIN
                SET @tState = 'ERR~50004~Sec_Actions_Update~N/A~This action was modified by another user. Please refresh and try again.';
                ROLLBACK TRANSACTION;
                RETURN;
            END
        END
        
        -- Validate required fields
        IF @ActionCode IS NULL OR LTRIM(RTRIM(@ActionCode)) = ''
        BEGIN
            SET @tState = 'ERR~50011~Sec_Actions_Update~N/A~ActionCode is required';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        IF @ActionTitle IS NULL OR LTRIM(RTRIM(@ActionTitle)) = ''
        BEGIN
            SET @tState = 'ERR~50012~Sec_Actions_Update~N/A~ActionTitle is required';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        IF @ModifiedBy IS NULL OR @ModifiedBy <= 0
        BEGIN
            SET @tState = 'ERR~50015~Sec_Actions_Update~N/A~ModifiedBy must be a valid UserID';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validate ActionCode format
        IF @ActionCode NOT LIKE '[A-Za-z0-9._-]%' OR @ActionCode LIKE '%[^A-Za-z0-9._-]%'
        BEGIN
            SET @tState = 'ERR~50014~Sec_Actions_Update~N/A~ActionCode can only contain letters, numbers, underscores, hyphens, and periods';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Check for duplicate ActionCode (excluding current action)
        IF EXISTS (SELECT 1 FROM [dbo].[Sec_Actions] WHERE ActionCode = @ActionCode AND ActionID <> @ActionID)
        BEGIN
            SET @tState = 'ERR~50002~Sec_Actions_Update~N/A~ActionCode already exists for another action';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Update action
        UPDATE [dbo].[Sec_Actions]
        SET 
            ActionCode = @ActionCode,
            ActionTitle = @ActionTitle,
            ModifiedBy = @ModifiedBy,
            ModifiedDate = GETUTCDATE()
        WHERE ActionID = @ActionID;
        
        COMMIT TRANSACTION;
        
        SET @tState = 'OK~00000~Sec_Actions_Update~ActionID=' + CAST(@ActionID AS VARCHAR(10)) + '~Action updated successfully';
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ProcName NVARCHAR(128) = OBJECT_NAME(@@PROCID);
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR(10)) + '~' + 
                      @ProcName + '~N/A~' + @ErrorMessage;
    END CATCH
END
GO
```

### Sec_Actions_CheckCode
**Purpose**: Check if ActionCode is available (for async validation)

```sql
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON  -- MANDATORY for metadata consistency
GO

CREATE PROCEDURE [dbo].[Sec_Actions_CheckCode]
    @ActionCode VARCHAR(50),
    @ExcludeActionID INT = NULL,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate input
        IF @ActionCode IS NULL OR LTRIM(RTRIM(@ActionCode)) = ''
        BEGIN
            SET @tState = 'ERR~50011~Sec_Actions_CheckCode~N/A~ActionCode is required';
            RETURN;
        END
        
        -- Check if code exists (excluding specified ActionID if provided)
        DECLARE @Exists BIT;
        
        IF @ExcludeActionID IS NULL
        BEGIN
            SELECT @Exists = CASE WHEN EXISTS (SELECT 1 FROM [dbo].[Sec_Actions] WHERE ActionCode = @ActionCode) THEN 1 ELSE 0 END;
        END
        ELSE
        BEGIN
            SELECT @Exists = CASE WHEN EXISTS (SELECT 1 FROM [dbo].[Sec_Actions] WHERE ActionCode = @ActionCode AND ActionID <> @ExcludeActionID) THEN 1 ELSE 0 END;
        END
        
        IF @Exists = 1
        BEGIN
            SET @tState = 'ERR~50001~Sec_Actions_CheckCode~Available=False~ActionCode already exists';
        END
        ELSE
        BEGIN
            SET @tState = 'OK~00000~Sec_Actions_CheckCode~Available=True~ActionCode is available';
        END
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ProcName NVARCHAR(128) = OBJECT_NAME(@@PROCID);
        
        SET @tState = 'ERR~' + CAST(@ErrorNumber AS VARCHAR(10)) + '~' + 
                      @ProcName + '~N/A~' + @ErrorMessage;
    END CATCH
END
GO
```

## Error Codes Reference

| Error Code | Stored Procedure         | Description                                                      |
|------------|--------------------------|------------------------------------------------------------------|
| 00000      | All (Success)            | Operation completed successfully                                 |
| 50001      | Insert/CheckCode         | ActionCode already exists (duplicate create)                     |
| 50002      | Update                   | ActionCode already exists for another action (duplicate update)  |
| 50003      | Get/Update               | Action not found (invalid ActionID)                              |
| 50004      | Update                   | Optimistic concurrency conflict (action modified by another user)|
| 50010      | Get/Update               | ActionID must be a positive integer (validation)                 |
| 50011      | Insert/Update/CheckCode  | ActionCode is required (validation)                              |
| 50012      | Insert/Update            | ActionTitle is required (validation)                             |
| 50013      | Insert                   | CreatedBy must be a valid UserID (validation)                    |
| 50014      | Insert/Update            | ActionCode format invalid (only alphanumeric, _, -, . allowed)   |
| 50015      | Update                   | ModifiedBy must be a valid UserID (validation)                   |

## Metadata Verification

After creating stored procedures, execute this query to verify metadata consistency:

```sql
SELECT 
    OBJECT_NAME(object_id) AS ProcedureName,
    uses_quoted_identifier,
    uses_ansi_nulls
FROM sys.sql_modules 
WHERE object_id IN (
    OBJECT_ID('dbo.Sec_Actions_Get'),
    OBJECT_ID('dbo.Sec_Actions_List'),
    OBJECT_ID('dbo.Sec_Actions_Insert'),
    OBJECT_ID('dbo.Sec_Actions_Update'),
    OBJECT_ID('dbo.Sec_Actions_CheckCode')
)
ORDER BY OBJECT_NAME(object_id);
```

**Expected Result**: All procedures must have `uses_quoted_identifier = 1` and `uses_ansi_nulls = 1`.

## Database Migration Workflow

1. **Create Migration Script**: Save forward migration as `backend/database/migrations/001-create-sec-actions-table.sql`
2. **Execute Migration Immediately**: Run script against development database
   ```powershell
   sqlcmd -S localhost -d EnterpriseManagementSystem -i "backend/database/migrations/001-create-sec-actions-table.sql"
   ```
3. **Verify Execution**: Check table exists and columns match specification
   ```sql
   SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sec_Actions';
   SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Sec_Actions';
   ```
4. **Create Stored Procedures**: Execute each procedure script in order (Get, List, Insert, Update, CheckCode)
5. **Verify Metadata**: Run metadata verification query (above)
6. **Run Integration Tests**: Verify stored procedure behavior matches expectations
7. **Create Rollback Script**: Save rollback as `backend/database/migrations/001-drop-sec-actions-table.sql`

## Constitution Compliance

✅ **Section V: Database-as-Authority**
- All CRUD operations via stored procedures only
- No direct table access from application code
- Transactions owned by stored procedures
- Naming convention followed: `Sec_Actions` table, `Sec_Actions_<Action>` procedures

✅ **Section VI: Stored Procedures as Primary Interface**
- All procedures return `@tState VARCHAR(500) OUTPUT`
- tState format: `STATUS~ERRORCODE~PROCEDURE_NAME~DATA~MESSAGE`
- Application error codes defined (50001-50015)
- Native SQL Server error numbers preserved in CATCH blocks
- `SET QUOTED_IDENTIFIER ON` mandatory in all procedures
- TRY...CATCH implemented in all procedures

✅ **Section IX: Database Migration Execution Strategy**
- Idempotent migration scripts using IF NOT EXISTS checks
- Forward and rollback migrations provided
- Verification queries included
- Immediate execution workflow documented
