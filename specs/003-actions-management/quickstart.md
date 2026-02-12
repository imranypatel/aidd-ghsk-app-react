# Actions Management - Quick Start Guide

**Feature**: 003-actions-management  
**Domain**: Security Module  
**Status**: Draft  
**Created**: February 12, 2026

## Overview

The Actions Management feature enables system administrators to create, view, and update system actions that are tracked by the security module. Actions represent trackable activities within the enterprise management system and serve as the foundation for authorization rules and audit logs.

### What Are Actions?

Actions are discrete, trackable activities that users can perform within the system. Examples include:
- `USER_CREATE` - Create User Account
- `ROLE_ASSIGN` - Assign Role to User
- `AUDIT_VIEW` - View Audit Logs
- `CONFIG_UPDATE` - Update System Configuration

Each action consists of:
- **ActionCode**: Unique system-level identifier (alphanumeric with underscores, hyphens, periods)
- **ActionTitle**: User-facing descriptive text
- **Audit Trail**: CreatedBy, CreatedDate, ModifiedBy, ModifiedDate

## Key Features

- ✅ **View Actions List**: Browse all system actions in a paginated, sortable, filterable data grid
- ✅ **Create New Actions**: Add new actions with unique ActionCode and descriptive ActionTitle
- ✅ **Update Existing Actions**: Edit ActionCode and ActionTitle with optimistic concurrency control
- ✅ **Search & Filter**: Quickly find actions by code or title
- ✅ **Export to CSV**: Download actions list for reporting or backup
- ✅ **Full Audit Trail**: Track who created/modified each action and when

## User Journeys

### 1. View All Actions
**Goal**: See what actions are currently configured in the system

1. Navigate to `/Sec/Actions`
2. View actions table displaying all actions with columns:
   - ActionID, ActionCode, ActionTitle
   - CreatedBy, CreatedDate, ModifiedBy, ModifiedDate
   - Actions (Update button)
3. Use pagination controls to navigate through pages (10/25/50/100 rows per page)
4. Click column headers to sort ascending/descending
5. Use column filters to narrow results
6. Click "Export" to download CSV file

**Time to Complete**: < 2 seconds to load and view

---

### 2. Create New Action
**Goal**: Add a new system action to track specific user activity

1. From Actions list page, click **"Create New Action"** button (top-right)
2. Fill in required fields:
   - **ActionCode**: Unique identifier (e.g., `REPORT_GENERATE`)
   - **ActionTitle**: Descriptive text (e.g., "Generate Sales Report")
3. System validates:
   - ActionCode is unique (no duplicates)
   - ActionCode contains only letters, numbers, underscores, hyphens, periods
   - Both fields are not empty
4. Click **"Create Action"** button
5. System creates action and redirects to list view
6. Success message displays: "Action created successfully"

**Time to Complete**: < 30 seconds end-to-end

**Example**:
```
ActionCode: INVOICE_APPROVE
ActionTitle: Approve Customer Invoice
```

---

### 3. Update Existing Action
**Goal**: Modify an action's code or title to correct mistakes or clarify description

1. From Actions list page, find the action to update
2. Click **Edit icon** button in Actions column
3. System navigates to `/Sec/Actions/<ActionID>`
4. View pre-populated form with current values:
   - ActionCode (editable)
   - ActionTitle (editable)
   - Audit information (read-only): Created by User X on YYYY-MM-DD, Last modified by User Y on YYYY-MM-DD
5. Modify ActionCode or ActionTitle as needed
6. System validates changes (same rules as create)
7. Click **"Update Action"** button
8. System updates action and redirects to list view
9. Success message displays: "Action updated successfully"

**Time to Complete**: < 45 seconds end-to-end

**Concurrency Protection**: If another user modified the action while you were editing, system displays error "This action was modified by another user. Please refresh and try again." with Refresh button.

---

### 4. Search for Specific Action
**Goal**: Quickly find an action without scrolling through pages

1. From Actions list page, locate global search field (toolbar)
2. Type search text (min 3 characters) in "Search actions by code or title..." field
3. System filters results in real-time (300ms debounce)
4. View filtered results matching ActionCode OR ActionTitle
5. Message displays: "X actions found matching '[search text]'"
6. Click "Clear Search" (X icon) to return to full list

**Time to Complete**: < 5 seconds to find action

---

## Routes

| Route                      | Purpose                          | Authentication Required |
|----------------------------|----------------------------------|-------------------------|
| `/Sec/Actions`             | List all actions (main view)     | ✅ Yes                   |
| `/Sec/Actions/New`         | Create new action form           | ✅ Yes                   |
| `/Sec/Actions/<ActionID>`  | Update existing action form      | ✅ Yes                   |

## Validation Rules

### ActionCode
- ✅ **Required**: Cannot be empty
- ✅ **Unique**: Must not match any existing ActionCode
- ✅ **Format**: Alphanumeric, underscores (_), hyphens (-), periods (.) only
- ✅ **Max Length**: 50 characters
- ❌ **Invalid Examples**: 
  - `ACTION 1` (contains space)
  - `ACTION@CODE` (contains @ symbol)
  - `ação` (contains non-ASCII character)

### ActionTitle
- ✅ **Required**: Cannot be empty
- ✅ **Max Length**: 200 characters
- ✅ **No Uniqueness Required**: Multiple actions can share same title if codes differ

## Error Handling

### Common Errors

| Error Message                                          | Cause                                    | Solution                                      |
|--------------------------------------------------------|------------------------------------------|-----------------------------------------------|
| ActionCode already exists                              | Duplicate ActionCode during create       | Choose a different, unique ActionCode         |
| ActionCode already exists for another action           | Duplicate ActionCode during update       | Choose a different ActionCode                 |
| ActionCode can only contain letters, numbers, underscores, hyphens, and periods | Invalid characters in ActionCode | Remove special characters (spaces, @, %, etc.) |
| ActionCode is required                                 | Empty ActionCode field                   | Enter a valid ActionCode                      |
| ActionTitle is required                                | Empty ActionTitle field                  | Enter a descriptive title                     |
| Action not found                                       | Invalid ActionID in URL                  | Return to Actions List and select valid action|
| This action was modified by another user. Please refresh and try again. | Concurrent update conflict | Click Refresh to load latest data and re-apply changes |
| Network connection lost. Your changes were not saved.  | Network failure during submission        | Check connection and click Retry              |
| Your session has expired. Please log in again.        | Session timeout during form editing      | Click Login to re-authenticate                |

## Performance Expectations

- **Page Load**: Actions list displays within 2 seconds
- **Create Action**: Completes within 3 seconds (95th percentile)
- **Update Action**: Completes within 3 seconds (95th percentile)
- **Search/Filter**: Results display within 1 second
- **Export CSV**: Generates within 30 seconds (up to 5000 rows)

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate between form fields and buttons
- **Enter**: Submit form (on last field) or activate focused button
- **Escape**: Close confirmation dialogs or clear search
- **Arrow Keys**: Navigate DataGrid rows/columns, navigate dropdown options
- **Space**: Activate checkboxes, toggle switches

### Screen Reader Support
- All form fields have proper labels announced to screen readers
- Validation errors announced immediately when triggered
- Loading states announced: "Loading actions...", "Creating action..."
- Button labels describe action: "Edit action USER_CREATE"

## Best Practices

### ActionCode Naming Conventions

1. **Use Descriptive Names**: `INVOICE_APPROVE` instead of `INV_1`
2. **Follow Verb-Noun Pattern**: `USER_CREATE`, `REPORT_GENERATE`, `DATA_EXPORT`
3. **Use Underscores for Separation**: `ROLE_ASSIGN` not `RoleAssign`
4. **Use ALL_CAPS**: `CONFIG_UPDATE` not `config_update` (optional but recommended for consistency)
5. **Avoid Abbreviations**: `PERMISSION_GRANT` instead of `PERM_GRT`

### ActionTitle Guidelines

1. **Be Specific**: "Approve Customer Invoice" instead of "Approve"
2. **Use Sentence Case**: "Create User Account" instead of "CREATE USER ACCOUNT"
3. **Keep Concise**: Max 200 characters, aim for < 50 characters
4. **Avoid Technical Jargon**: "Generate Sales Report" instead of "Execute rpt_sales_01 SSRS"
5. **Match ActionCode Semantics**: If ActionCode is `USER_DELETE`, ActionTitle should be "Delete User Account"

### Audit Trail

- **CreatedBy/ModifiedBy**: Automatically populated from authenticated user's session
- **CreatedDate/ModifiedDate**: Automatically set by database (UTC timestamp)
- **Cannot Be Edited**: Audit fields are read-only, system-managed
- **Concurrency Control**: ModifiedDate used for optimistic locking to prevent conflicts

## Development Notes

### Technology Stack
- **Frontend**: React 19.2.4, Material-UI 8.x, React Router 7.13.0
- **Backend**: ASP.NET Core Web API, Dapper
- **Database**: SQL Server 2025, DbUp migrations

### Database Schema
- **Table**: `Sec_Actions`
- **Primary Key**: `ActionID` (INT IDENTITY)
- **Unique Constraint**: `ActionCode` (VARCHAR(50))
- **Audit Fields**: `CreatedBy`, `CreatedDate`, `ModifiedBy`, `ModifiedDate`

### Stored Procedures
- `Sec_Actions_Get`: Retrieve single action by ID
- `Sec_Actions_List`: Paginated list with filtering/sorting
- `Sec_Actions_Insert`: Create new action with validation
- `Sec_Actions_Update`: Update action with optimistic concurrency control
- `Sec_Actions_CheckCode`: Check ActionCode availability (async validation)

All procedures return `@tState VARCHAR(500) OUTPUT` in format:
```
OK~00000~Sec_Actions_Insert~ActionID=123~Action created successfully
ERR~50001~Sec_Actions_Insert~N/A~ActionCode already exists
```

### API Endpoints (Planned)
- `GET /api/actions` - List actions (paginated)
- `GET /api/actions/{id}` - Get single action
- `POST /api/actions` - Create new action
- `PUT /api/actions/{id}` - Update action
- `GET /api/actions/check-code?code={code}` - Check code availability

## Testing Strategy

### Unit Tests
- Form validation logic (ActionCode format, required fields)
- Component rendering (ActionsList, ActionForm)
- State management (form dirty state, validation errors)

### Integration Tests
- API endpoints + stored procedures
- Database constraints (UNIQUE ActionCode)
- tState parsing and error handling
- Audit trail population

### E2E Tests (Playwright)
- Complete create workflow: Navigate → Fill form → Submit → Verify in list
- Complete update workflow: Navigate → Click edit → Modify → Submit → Verify changes
- Validation: Submit invalid data → Verify error messages → Correct → Submit successfully
- Concurrency: Open two update forms → Submit both → Verify conflict detection

## FAQs

**Q: Can I delete actions?**  
A: Not in the initial release. Delete functionality may be added later with soft delete pattern (IsDeleted flag).

**Q: Why can't I edit CreatedBy or CreatedDate?**  
A: Audit fields are sacrosanct and system-managed to ensure data integrity. Only system can set these values.

**Q: What happens if I try to use special characters in ActionCode?**  
A: System validates ActionCode format in real-time. Only alphanumeric characters, underscores, hyphens, and periods are allowed. Other characters trigger inline error.

**Q: Can two actions have the same ActionTitle?**  
A: Yes. ActionTitle has no uniqueness constraint. Only ActionCode must be unique.

**Q: How do I know if my session expired while editing?**  
A: On form submission, if session expired, system displays modal "Your session has expired. Please log in again." and redirects to login with return URL preserving form state.

**Q: Can I export more than 5000 actions?**  
A: No. CSV export is limited to 5000 rows maximum. Apply filters to reduce dataset before exporting.

**Q: What browsers are supported?**  
A: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+. IE11 is not supported.

## Next Steps

1. **Review Specification**: Read `specs/003-actions-management/spec.md` for comprehensive requirements
2. **Review Data Model**: Read `specs/003-actions-management/data-model.md` for database schema and stored procedures
3. **Set Up Database**: Execute migration scripts to create `Sec_Actions` table and stored procedures
4. **Implement Backend**: Create API endpoints, services, repositories following layered architecture
5. **Implement Frontend**: Create components (ActionsList, ActionForm, ActionFormView) following Material-UI standards
6. **Write Tests**: Unit tests, integration tests, E2E tests per Constitution Section III
7. **Manual Testing**: Verify all user journeys, validation rules, error handling
8. **Deploy**: Follow deployment checklist ensuring all migrations applied, tests passing

## Support & Resources

- **Constitution**: `.specify/memory/constitution.md` (v1.1.0)
- **Specification**: `specs/003-actions-management/spec.md`
- **Data Model**: `specs/003-actions-management/data-model.md`
- **Feature Branch**: `003-actions-management`
- **Related Features**: 
  - 001-user-login-logout (authentication)
  - 002-modern-ui-redesign (UI components)

---

**Document Version**: 1.0.0  
**Last Updated**: February 12, 2026  
**Author**: AI Agent (GitHub Copilot)
