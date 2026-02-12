# Research: Actions Management Implementation

**Feature**: 003-actions-management  
**Date**: February 12, 2026  
**Status**: Complete  
**Purpose**: Resolve implementation details and document technology decisions for Actions Management feature

## Overview

This document consolidates research findings for implementing CRUD operations for system actions in the Security domain. Research focuses on Material-UI X DataGrid server-side patterns, CSV export streaming, optimistic concurrency control, async validation debouncing, error code mapping, and UI component patterns.

---

## 1. Material-UI X DataGrid Server-Side Pagination

**Decision**: Use Material-UI X DataGrid (`@mui/x-data-grid`) with `paginationMode="server"` and `sortingMode="server"` for efficient handling of large datasets.

**Rationale**: 
- Constitution Section VIII requires sortable, filterable, paginated tables for data interaction
- Server-side mode prevents loading entire dataset into browser memory
- DataGrid Pro features (advanced filtering, column ordering) not required for MVP
- Community edition sufficient for pagination, sorting, basic filtering

**Implementation Pattern**:

```typescript
// Frontend: ActionsDataGrid.tsx
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

interface ActionsDataGridProps {
  loading: boolean;
  rows: Action[];
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onEditClick: (actionId: number) => void;
}

const ActionsDataGrid: React.FC<ActionsDataGridProps> = ({
  loading,
  rows,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  onEditClick,
}) => {
  const columns: GridColDef[] = [
    { field: 'actionId', headerName: 'Action ID', width: 80, sortable: true },
    { field: 'actionCode', headerName: 'Action Code', width: 180, sortable: true },
    { field: 'actionTitle', headerName: 'Action Title', flex: 1, minWidth: 200, sortable: true },
    { field: 'createdBy', headerName: 'Created By', width: 100, sortable: false },
    { 
      field: 'createdDate', 
      headerName: 'Created Date', 
      width: 180, 
      sortable: true,
      valueFormatter: (params) => format(new Date(params.value), 'yyyy-MM-dd HH:mm:ss')
    },
    { field: 'modifiedBy', headerName: 'Modified By', width: 100, sortable: false },
    { 
      field: 'modifiedDate', 
      headerName: 'Modified Date', 
      width: 180, 
      sortable: true,
      valueFormatter: (params) => params.value ? format(new Date(params.value), 'yyyy-MM-dd HH:mm:ss') : 'Never'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton 
          aria-label={`Edit action ${params.row.actionCode}`}
          onClick={() => onEditClick(params.row.actionId)}
          size="small"
        >
          <EditIcon />
        </IconButton>
      )
    }
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      rowCount={rowCount}
      loading={loading}
      pageSizeOptions={[10, 25, 50, 100]}
      paginationModel={paginationModel}
      paginationMode="server"
      onPaginationModelChange={onPaginationModelChange}
      sortModel={sortModel}
      sortingMode="server"
      onSortModelChange={onSortModelChange}
      getRowId={(row) => row.actionId}
      disableRowSelectionOnClick
      autoHeight
      sx={{
        '& .MuiDataGrid-row:hover': {
          backgroundColor: '#F5F5F5',
          cursor: 'pointer'
        }
      }}
    />
  );
};
```

**API Contract**:

```typescript
// GET /api/actions?page=1&pageSize=10&sortColumn=actionCode&sortDirection=asc&filterText=USER

interface ActionListRequest {
  page: number;           // 1-based page number
  pageSize: number;       // Rows per page (10, 25, 50, 100)
  sortColumn?: string;    // Column name (actionId, actionCode, actionTitle, createdDate, modifiedDate)
  sortDirection?: 'asc' | 'desc';
  filterText?: string;    // Global search text (searches ActionCode OR ActionTitle)
}

interface ActionListResponse {
  data: Action[];         // Current page rows
  totalCount: number;     // Total rows matching filter
  page: number;           // Current page number
  pageSize: number;       // Rows per page
}
```

**Backend Stored Procedure Mapping**:
- `@PageNumber` = request.page
- `@PageSize` = request.pageSize
- `@SortColumn` = request.sortColumn ?? 'ActionID'
- `@SortDirection` = request.sortDirection?.toUpperCase() ?? 'ASC'
- `@FilterText` = request.filterText ?? NULL
- tState DATA field contains: `TotalCount=150,Page=1,PageSize=10`

**Alternatives Considered**:
- ❌ **Client-side pagination**: Rejected - Requires loading all rows, poor performance for 100+ actions
- ❌ **DataGrid Pro**: Rejected - Overkill for MVP, adds cost, community edition sufficient
- ❌ **react-table (TanStack Table)**: Rejected - More complex setup, Material-UI DataGrid better integrated with MUI ecosystem

**References**:
- [Material-UI DataGrid Server-Side Pagination](https://mui.com/x/react-data-grid/pagination/#server-side-pagination)
- [Material-UI DataGrid Sorting](https://mui.com/x/react-data-grid/sorting/#server-side-sorting)

---

## 2. CSV Export Streaming Implementation

**Decision**: Use backend streaming with `text/csv` Content-Type and `Transfer-Encoding: chunked` for large exports, frontend downloads via blob URL.

**Rationale**:
- Constitution Section VIII requires one-click export for data views
- Spec FR-007 requires export up to 5000 rows within 30 seconds
- Streaming prevents backend memory exhaustion for large datasets
- Frontend blob download provides better UX than direct file save

**Implementation Pattern**:

```csharp
// Backend: ActionsController.cs
[HttpGet("export")]
public async Task<IActionResult> ExportActionsAsync(
    [FromQuery] string? sortColumn = "ActionID",
    [FromQuery] string? sortDirection = "ASC",
    [FromQuery] string? filterText = null)
{
    try
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var fileName = $"actions_export_{timestamp}.csv";

        Response.ContentType = "text/csv";
        Response.Headers.Add("Content-Disposition", $"attachment; filename=\"{fileName}\"");

        await using var writer = new StreamWriter(Response.Body, Encoding.UTF8);
        await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        // Write header
        csv.WriteField("ActionID");
        csv.WriteField("ActionCode");
        csv.WriteField("ActionTitle");
        csv.WriteField("CreatedBy");
        csv.WriteField("CreatedDate");
        csv.WriteField("ModifiedBy");
        csv.WriteField("ModifiedDate");
        await csv.NextRecordAsync();

        // Stream rows in batches
        int page = 1;
        const int batchSize = 100;
        bool hasMore = true;

        while (hasMore)
        {
            var actions = await _actionsService.ListActionsAsync(
                page, batchSize, sortColumn, sortDirection, filterText);

            foreach (var action in actions.Data)
            {
                csv.WriteField(action.ActionId);
                csv.WriteField(action.ActionCode);
                csv.WriteField(action.ActionTitle);
                csv.WriteField(action.CreatedBy);
                csv.WriteField(action.CreatedDate.ToString("yyyy-MM-dd HH:mm:ss"));
                csv.WriteField(action.ModifiedBy);
                csv.WriteField(action.ModifiedDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "Never");
                await csv.NextRecordAsync();
            }

            hasMore = actions.Data.Count == batchSize;
            page++;

            // Safety limit: max 5000 rows
            if (page * batchSize > 5000)
            {
                _logger.LogWarning("CSV export exceeded 5000 row limit");
                break;
            }
        }

        await csv.FlushAsync();
        return new EmptyResult();
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error exporting actions to CSV");
        return StatusCode(500, new { error = "Export failed. Please try again." });
    }
}
```

```typescript
// Frontend: csvExport.ts
export const exportActionsToCSV = async (
  sortColumn?: string,
  sortDirection?: 'asc' | 'desc',
  filterText?: string
): Promise<void> => {
  try {
    const params = new URLSearchParams();
    if (sortColumn) params.append('sortColumn', sortColumn);
    if (sortDirection) params.append('sortDirection', sortDirection);
    if (filterText) params.append('filterText', filterText);

    const response = await axios.get(`/api/actions/export?${params.toString()}`, {
      responseType: 'blob',
      timeout: 60000, // 60 second timeout
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `actions_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error('Export timed out. Please refine filters and try again.');
    }
    throw new Error('Export failed. Please try again later.');
  }
};
```

**Dependencies**:
- Backend: `CsvHelper` NuGet package (CSV generation)
- Frontend: Axios `responseType: 'blob'` for binary download

**Alternatives Considered**:
- ❌ **Generate entire CSV in memory**: Rejected - Memory exhaustion for 5000 rows, slower response
- ❌ **Background job with download link**: Rejected - Overengineered for MVP, adds complexity (job queue, file storage, cleanup)
- ❌ **Frontend CSV generation**: Rejected - Requires loading all data into browser, poor performance

**References**:
- [CsvHelper Documentation](https://joshclose.github.io/CsvHelper/)
- [ASP.NET Core Streaming](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write)

---

## 3. Optimistic Concurrency Control Implementation

**Decision**: Use `ModifiedDate` timestamp comparison in `Sec_Actions_Update` stored procedure with frontend conflict detection and refresh option.

**Rationale**:
- Constitution Section V requires database-as-authority for data integrity
- Spec Edge Case requires concurrent update detection with user-friendly recovery
- ModifiedDate already exists in schema for audit trail, no additional column needed
- Simpler than row versioning (SQL Server ROWVERSION) for this use case

**Implementation Pattern**:

```sql
-- Backend: Sec_Actions_Update stored procedure
CREATE PROCEDURE [dbo].[Sec_Actions_Update]
    @ActionID INT,
    @ActionCode VARCHAR(50),
    @ActionTitle VARCHAR(200),
    @ModifiedBy INT,
    @OriginalModifiedDate DATETIME2(7) = NULL,  -- Captured on form load
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Optimistic concurrency check
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
        
        -- Compare timestamps (handle NULL for never-modified records)
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
        
        -- Perform update
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
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        -- ... error handling
    END CATCH
END
```

```typescript
// Frontend: ActionFormPage.tsx (Update mode)
const ActionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [originalModifiedDate, setOriginalModifiedDate] = useState<string | null>(null);
  const [concurrencyConflict, setConcurrencyConflict] = useState(false);

  useEffect(() => {
    if (id) {
      // Load action on mount, capture ModifiedDate
      actionsService.getAction(parseInt(id))
        .then((action) => {
          setFormData({
            actionCode: action.actionCode,
            actionTitle: action.actionTitle,
          });
          setOriginalModifiedDate(action.modifiedDate); // Capture for concurrency check
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await actionsService.updateAction(parseInt(id!), {
        actionCode: formData.actionCode,
        actionTitle: formData.actionTitle,
        originalModifiedDate, // Send captured timestamp
      });
      navigate('/Sec/Actions');
    } catch (error) {
      if (error.response?.data?.errorCode === '50004') {
        setConcurrencyConflict(true); // Show conflict dialog
      } else {
        // Handle other errors
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>

      {/* Concurrency Conflict Dialog */}
      <Dialog open={concurrencyConflict} onClose={() => setConcurrencyConflict(false)}>
        <DialogTitle>Action Was Modified</DialogTitle>
        <DialogContent>
          <Typography>
            This action was modified by another user. Would you like to refresh and see the latest version?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConcurrencyConflict(false)}>Cancel</Button>
          <Button 
            onClick={() => window.location.reload()} // Refresh to load latest
            color="primary" 
            variant="contained"
          >
            Refresh
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
```

**Alternatives Considered**:
- ❌ **ROWVERSION column**: Rejected - Adds unnecessary complexity, ModifiedDate sufficient for human-speed updates
- ❌ **Last-write-wins**: Rejected - Violates data integrity, user work can be lost without warning
- ❌ **Pessimistic locking (SELECT FOR UPDATE)**: Rejected - Not supported in stored procedures via Dapper easily, overengineered

**References**:
- [Optimistic Concurrency in SQL Server](https://learn.microsoft.com/en-us/ef/core/saving/concurrency)
- [ROWVERSION vs Timestamp Comparison](https://stackoverflow.com/questions/8197637/sql-server-rowversion-vs-timestamp)

---

## 4. Async ActionCode Validation with Debouncing

**Decision**: Use React custom hook with `useEffect` debouncing (500ms) and AbortController for cancellation to check ActionCode uniqueness while user types.

**Rationale**:
- Spec FR-013 requires optional async ActionCode availability check with 500ms debounce
- Improves UX by catching duplicate codes early before form submission
- Debouncing reduces API load (prevents check on every keystroke)
- AbortController prevents race conditions from fast typing

**Implementation Pattern**:

```typescript
// Frontend: hooks/useActionCodeValidation.ts
import { useState, useEffect } from 'react';
import { actionsService } from '../services/actionsService';

interface UseActionCodeValidationResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  errorMessage: string | null;
}

export const useActionCodeValidation = (
  actionCode: string,
  excludeActionId?: number,
  enabled: boolean = true
): UseActionCodeValidationResult => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Reset state if validation disabled or code too short
    if (!enabled || actionCode.length < 3) {
      setIsChecking(false);
      setIsAvailable(null);
      setErrorMessage(null);
      return;
    }

    // Debounce timer
    const timeoutId = setTimeout(() => {
      const abortController = new AbortController();

      const checkAvailability = async () => {
        setIsChecking(true);
        setErrorMessage(null);

        try {
          const result = await actionsService.checkActionCode(
            actionCode, 
            excludeActionId,
            { signal: abortController.signal }
          );

          if (result.available) {
            setIsAvailable(true);
            setErrorMessage(null);
          } else {
            setIsAvailable(false);
            setErrorMessage('Action code already exists');
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            setIsAvailable(null);
            setErrorMessage('Unable to check availability');
          }
        } finally {
          setIsChecking(false);
        }
      };

      checkAvailability();

      // Cleanup: abort request if component unmounts or actionCode changes
      return () => {
        abortController.abort();
      };
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timeoutId);
    };
  }, [actionCode, excludeActionId, enabled]);

  return { isChecking, isAvailable, errorMessage };
};
```

```typescript
// Frontend: components/ActionCodeField.tsx
import { TextField, CircularProgress, InputAdornment } from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useActionCodeValidation } from '../hooks/useActionCodeValidation';

interface ActionCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  excludeActionId?: number;
  required?: boolean;
  error?: string;
}

const ActionCodeField: React.FC<ActionCodeFieldProps> = ({
  value,
  onChange,
  excludeActionId,
  required = true,
  error: externalError,
}) => {
  const { isChecking, isAvailable, errorMessage } = useActionCodeValidation(
    value,
    excludeActionId,
    value.length >= 3
  );

  const hasError = externalError || errorMessage;

  return (
    <TextField
      label="Action Code"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      fullWidth
      error={!!hasError}
      helperText={hasError || `${value.length}/50`}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isChecking && <CircularProgress size={20} />}
            {!isChecking && isAvailable && <CheckCircle color="success" />}
            {!isChecking && isAvailable === false && <ErrorIcon color="error" />}
          </InputAdornment>
        ),
      }}
      inputProps={{ maxLength: 50 }}
    />
  );
};
```

**API Contract**:
```typescript
// GET /api/actions/check-code?code=USER_CREATE&excludeActionId=123

interface CheckActionCodeRequest {
  code: string;
  excludeActionId?: number; // For update scenario (exclude current action)
}

interface CheckActionCodeResponse {
  available: boolean;
}
```

**Alternatives Considered**:
- ❌ **Lodash debounce**: Rejected - Adds dependency, native setTimeout + useEffect sufficient
- ❌ **Validation on blur only**: Rejected - Poorer UX, user doesn't get feedback while typing
- ❌ **No cancellation (AbortController)**: Rejected - Race conditions with fast typing, stale results

**References**:
- [React Debouncing with useEffect](https://www.freecodecamp.org/news/debouncing-in-react-hooks/)
- [AbortController for Request Cancellation](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

---

## 5. Error Code Taxonomy & HTTP Status Mapping

**Decision**: Use application-specific error codes (50001-50015) in tState, map to HTTP status codes in backend, display user-friendly messages in frontend.

**Rationale**:
- Constitution Section VI requires application-level error code taxonomy
- tState pattern provides consistent error signaling from database → application → client
- HTTP status codes provide semantic meaning for client-side error handling
- User-friendly messages improve UX per Constitution Section VIII

**Error Code Taxonomy**:

| Error Code | Category | Description | HTTP Status | User-Friendly Message |
|------------|----------|-------------|-------------|----------------------|
| 00000 | Success | Operation completed successfully | 200 OK | (Success message varies) |
| 50001 | Validation | ActionCode already exists (create) | 409 Conflict | Action code already exists. Please use a unique code. |
| 50002 | Validation | ActionCode already exists for another action (update) | 409 Conflict | Action code already exists for another action. Please use a unique code. |
| 50003 | Not Found | Action not found (invalid ActionID) | 404 Not Found | Action not found. |
| 50004 | Concurrency | Action was modified by another user | 409 Conflict | This action was modified by another user. Please refresh and try again. |
| 50010 | Validation | ActionID must be a positive integer | 400 Bad Request | Invalid action ID. |
| 50011 | Validation | ActionCode is required | 400 Bad Request | ActionCode is required. |
| 50012 | Validation | ActionTitle is required | 400 Bad Request | ActionTitle is required. |
| 50013 | Validation | CreatedBy must be a valid UserID | 400 Bad Request | Invalid user ID for CreatedBy. |
| 50014 | Validation | ActionCode format invalid | 400 Bad Request | ActionCode can only contain letters, numbers, underscores, hyphens, and periods. |
| 50015 | Validation | ModifiedBy must be a valid UserID | 400 Bad Request | Invalid user ID for ModifiedBy. |
| SQL Error | Database | Native SQL Server error (e.g., 8134, 2627) | 500 Internal Server Error | An unexpected error occurred. Please try again. |

**Implementation Pattern**:

```csharp
// Backend: Application/Services/ActionsService.cs
public async Task<ActionDto> UpdateActionAsync(int actionId, UpdateActionRequest request)
{
    var tState = new SqlParameter("@tState", SqlDbType.VarChar, 500) { Direction = ParameterDirection.Output };

    var action = await _repository.UpdateActionAsync(
        actionId, 
        request.ActionCode, 
        request.ActionTitle, 
        request.ModifiedBy, 
        request.OriginalModifiedDate, 
        tState
    );

    var tStateValue = tState.Value?.ToString() ?? "ERR~99999~ActionsService~N/A~tState was null";
    var (status, errorCode, procedure, data, message) = ParseTState(tStateValue);

    if (status == "ERR")
    {
        _logger.LogWarning("Action update failed: {ErrorCode} - {Message}", errorCode, message);

        throw errorCode switch
        {
            "50003" => new NotFoundException(message),
            "50002" => new ConflictException(message),
            "50004" => new ConflictException(message),
            "50010" or "50011" or "50012" or "50014" or "50015" => new ValidationException(message),
            _ => new DatabaseException($"Database error {errorCode}: {message}")
        };
    }

    _logger.LogInformation("Action {ActionId} updated successfully by user {UserId}", actionId, request.ModifiedBy);
    return action;
}
```

```csharp
// Backend: Controllers/ActionsController.cs
[HttpPut("{id}")]
public async Task<IActionResult> UpdateAction(int id, [FromBody] UpdateActionRequest request)
{
    try
    {
        var action = await _actionsService.UpdateActionAsync(id, request);
        return Ok(new { data = action, message = "Action updated successfully" });
    }
    catch (NotFoundException ex)
    {
        return NotFound(new { error = ex.Message, errorCode = "50003" });
    }
    catch (ConflictException ex)
    {
        // Could be duplicate ActionCode (50002) or concurrency conflict (50004)
        return Conflict(new { error = ex.Message, errorCode = ExtractErrorCode(ex) });
    }
    catch (ValidationException ex)
    {
        return BadRequest(new { error = ex.Message, errorCode = ExtractErrorCode(ex) });
    }
    catch (DatabaseException ex)
    {
        _logger.LogError(ex, "Database error updating action {ActionId}", id);
        return StatusCode(500, new { error = "An unexpected error occurred. Please try again." });
    }
}
```

```typescript
// Frontend: utils/errorHandler.ts
export const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    '50001': 'Action code already exists. Please use a unique code.',
    '50002': 'Action code already exists for another action. Please use a unique code.',
    '50003': 'Action not found.',
    '50004': 'This action was modified by another user. Please refresh and try again.',
    '50010': 'Invalid action ID.',
    '50011': 'ActionCode is required.',
    '50012': 'ActionTitle is required.',
    '50013': 'Invalid user ID for CreatedBy.',
    '50014': 'ActionCode can only contain letters, numbers, underscores, hyphens, and periods.',
    '50015': 'Invalid user ID for ModifiedBy.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};
```

**Alternatives Considered**:
- ❌ **HTTP status codes only**: Rejected - Insufficient granularity, can't distinguish 50001 vs 50002 (both 409 Conflict)
- ❌ **String error codes**: Rejected - Numeric codes more efficient for parsing, easier to categorize
- ❌ **Frontend hardcoded messages**: Rejected - Localization difficult, single source of truth better

**References**:
- [REST API Error Handling Best Practices](https://www.baeldung.com/rest-api-error-handling-best-practices)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

## 6. Character Counter Implementation

**Decision**: Use Material-UI TextField `helperText` prop with live character count updated on every `onChange` event.

**Rationale**:
- Spec FR-012 requires character counter showing "X/50" for ActionCode and "X/200" for ActionTitle
- Material-UI TextField built-in `helperText` provides consistent styling
- Live updates on every keystroke provide immediate feedback
- Visual warning (color change) when approaching limit enhances UX

**Implementation Pattern**:

```typescript
// Frontend: components/ActionForm.tsx
const ActionForm: React.FC<ActionFormProps> = ({ initialData, onSubmit }) => {
  const [actionCode, setActionCode] = useState(initialData?.actionCode || '');
  const [actionTitle, setActionTitle] = useState(initialData?.actionTitle || '');

  const actionCodeHelperText = `${actionCode.length}/50`;
  const actionTitleHelperText = `${actionTitle.length}/200`;

  const isActionCodeNearLimit = actionCode.length >= 45; // 95% of 50
  const isActionTitleNearLimit = actionTitle.length >= 190; // 95% of 200

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Action Code"
        value={actionCode}
        onChange={(e) => setActionCode(e.target.value)}
        required
        fullWidth
        helperText={actionCodeHelperText}
        inputProps={{ maxLength: 50 }}
        FormHelperTextProps={{
          sx: {
            textAlign: 'right',
            color: isActionCodeNearLimit ? 'error.main' : 'text.secondary'
          }
        }}
      />

      <TextField
        label="Action Title"
        value={actionTitle}
        onChange={(e) => setActionTitle(e.target.value)}
        required
        fullWidth
        multiline
        rows={2}
        helperText={actionTitleHelperText}
        inputProps={{ maxLength: 200 }}
        FormHelperTextProps={{
          sx: {
            textAlign: 'right',
            color: isActionTitleNearLimit ? 'error.main' : 'text.secondary'
          }
        }}
      />
    </form>
  );
};
```

**Alternatives Considered**:
- ❌ **Custom styled component**: Rejected - Material-UI helperText sufficient, no need for custom component
- ❌ **Counter above field**: Rejected - helperText below field is Material-UI convention
- ❌ **No visual warning**: Rejected - Red color at 95% limit improves UX

**References**:
- [Material-UI TextField API](https://mui.com/material-ui/api/text-field/)
- [Material-UI Form Helper Text](https://mui.com/material-ui/api/form-helper-text/)

---

## 7. Snackbar Notification Management

**Decision**: Use Material-UI Snackbar with `notistack` library for queue management, auto-dismiss for success (3s), persistent for errors (manual dismiss).

**Rationale**:
- Spec requires Snackbar notifications for success/error feedback
- Constitution Section VIII requires clear success/error feedback with semantic colors
- notistack provides queue management for multiple notifications (prevents overlap)
- Auto-dismiss for success messages prevents UI clutter, persistent errors ensure user awareness

**Implementation Pattern**:

```typescript
// Frontend: App.tsx (Setup notistack provider)
import { SnackbarProvider } from 'notistack';

function App() {
  return (
    <SnackbarProvider 
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={3000}
    >
      <Router>
        {/* App routes */}
      </Router>
    </SnackbarProvider>
  );
}
```

```typescript
// Frontend: pages/Security/Actions/ActionFormPage.tsx
import { useSnackbar } from 'notistack';

const ActionFormPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await actionsService.updateAction(actionId, formData);
        enqueueSnackbar('Action updated successfully', { 
          variant: 'success',
          anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
        });
      } else {
        await actionsService.createAction(formData);
        enqueueSnackbar('Action created successfully', { 
          variant: 'success',
          anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
        });
      }
      navigate('/Sec/Actions');
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.error || 'An error occurred. Please try again.',
        { 
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          persist: true  // Requires manual dismiss for errors
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

**Configuration**:
- **Success Messages**: Bottom-center position, green background (#388E3C), auto-dismiss 3 seconds
- **Error Messages**: Top-center position (higher visibility), red background (#D32F2F), persistent (manual dismiss required)
- **Warning Messages**: Top-center position, yellow background (#F57C00), auto-dismiss 5 seconds
- **Max Stacked**: 3 notifications maximum to prevent UI overflow

**Alternatives Considered**:
- ❌ **Custom Snackbar component**: Rejected - notistack provides queue management out-of-box, no need to reinvent
- ❌ **Toast library (react-toastify)**: Rejected - Material-UI Snackbar better integrated with MUI theme
- ❌ **All auto-dismiss**: Rejected - Errors require explicit user acknowledgment to ensure visibility

**References**:
- [notistack Documentation](https://notistack.com/)
- [Material-UI Snackbar](https://mui.com/material-ui/react-snackbar/)

---

## 8. DataGrid Column Configuration & Responsive Behavior

**Decision**: Use fixed widths for narrow columns (ActionID, CreatedBy, ModifiedBy, Actions), flexible width for ActionTitle, hide audit columns on tablet/mobile with optional "Show More" toggle.

**Rationale**:
- Spec requires responsive breakpoints: Mobile ≥768px, Tablet ≥992px, Desktop ≥1200px
- ActionTitle is most important user-facing content, should expand to fill available space
- Audit columns (CreatedBy/Date, ModifiedBy/Date) are secondary, can be hidden on small screens
- Mobile horizontal scroll with pinned ActionCode + Actions columns maintains usability

**Implementation Pattern**:

```typescript
// Frontend: components/ActionsDataGrid.tsx
import { useMediaQuery, useTheme } from '@mui/material';

const ActionsDataGrid: React.FC<ActionsDataGridProps> = (props) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // ≥1200px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 992px-1199px
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // <992px

  const columns: GridColDef[] = [
    { 
      field: 'actionId', 
      headerName: 'Action ID', 
      width: 80, 
      sortable: true,
      // Hide on mobile
      hide: isMobile
    },
    { 
      field: 'actionCode', 
      headerName: 'Action Code', 
      width: 180, 
      sortable: true,
      // Always visible (pinned left on mobile)
    },
    { 
      field: 'actionTitle', 
      headerName: 'Action Title', 
      flex: 1,  // Flexible width - expands to fill space
      minWidth: 200, 
      sortable: true 
    },
    { 
      field: 'createdBy', 
      headerName: 'Created By', 
      width: 100, 
      sortable: false,
      // Hide on tablet and mobile
      hide: !isDesktop
    },
    { 
      field: 'createdDate', 
      headerName: 'Created Date', 
      width: 180, 
      sortable: true,
      // Hide on tablet and mobile
      hide: !isDesktop,
      valueFormatter: (params) => format(new Date(params.value), 'yyyy-MM-dd HH:mm:ss')
    },
    { 
      field: 'modifiedBy', 
      headerName: 'Modified By', 
      width: 100, 
      sortable: false,
      // Hide on tablet and mobile
      hide: !isDesktop
    },
    { 
      field: 'modifiedDate', 
      headerName: 'Modified Date', 
      width: 180, 
      sortable: true,
      // Hide on tablet and mobile
      hide: !isDesktop,
      valueFormatter: (params) => params.value ? format(new Date(params.value), 'yyyy-MM-dd HH:mm:ss') : 'Never'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      // Always visible (pinned right on mobile)
      renderCell: (params) => (
        <IconButton 
          aria-label={`Edit action ${params.row.actionCode}`}
          onClick={() => props.onEditClick(params.row.actionId)}
          size="small"
        >
          <EditIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', overflowX: isMobile ? 'auto' : 'visible' }}>
      <DataGrid
        {...props}
        columns={columns}
        sx={{
          '& .MuiDataGrid-columnHeader:first-of-type': {
            // Pin ActionCode column left on mobile
            ...(isMobile && {
              position: 'sticky',
              left: 0,
              zIndex: 1,
              backgroundColor: theme.palette.background.paper
            })
          },
          '& .MuiDataGrid-columnHeader:last-of-type': {
            // Pin Actions column right on mobile
            ...(isMobile && {
              position: 'sticky',
              right: 0,
              zIndex: 1,
              backgroundColor: theme.palette.background.paper
            })
          }
        }}
      />
    </Box>
  );
};
```

**Column Width Allocation** (Desktop 1200px viewport):
- ActionID: 80px
- ActionCode: 180px
- ActionTitle: ~400px (flex expands)
- CreatedBy: 100px
- CreatedDate: 180px
- ModifiedBy: 100px
- ModifiedDate: 180px
- Actions: 80px
- **Total**: ~1300px with flex expansion

**Mobile Behavior** (≥768px):
- Horizontal scroll enabled
- ActionCode column pinned left (sticky)
- Actions column pinned right (sticky)
- All other columns accessible via scroll
- ActionID, audit columns hidden to reduce scroll width

**Alternatives Considered**:
- ❌ **All columns visible on mobile**: Rejected - Horizontal scroll too wide, poor UX
- ❌ **Responsive table rows (card layout)**: Rejected - DataGrid doesn't support card mode, custom implementation too complex
- ❌ **Fixed widths for all columns**: Rejected - ActionTitle truncated on large screens, wasted space

**References**:
- [Material-UI Responsive Design](https://mui.com/material-ui/customization/breakpoints/)
- [DataGrid Column Definition](https://mui.com/x/react-data-grid/column-definition/)

---

## Summary of Research Decisions

| Topic | Decision | Library/Pattern | Rationale |
|-------|----------|----------------|-----------|
| Server-Side Pagination | Material-UI X DataGrid `paginationMode="server"` | @mui/x-data-grid | Efficient for large datasets, built-in UI controls |
| CSV Export | Backend streaming with CsvHelper | CsvHelper NuGet package | Prevents memory exhaustion, handles 5000 rows |
| Optimistic Concurrency | ModifiedDate timestamp comparison | Stored procedure logic | Simpler than ROWVERSION, sufficient for human-speed updates |
| Async Validation | React hook with useEffect debouncing (500ms) | Native React + AbortController | Reduces API load, prevents race conditions |
| Error Code Mapping | Application codes 50001-50015 → HTTP status | Custom exception hierarchy | Granular error handling, user-friendly messages |
| Character Counter | TextField helperText with live updates | Material-UI TextField | Built-in component, consistent styling |
| Snackbar Notifications | notistack for queue management | notistack library | Queue management, success auto-dismiss, error persistent |
| Responsive DataGrid | Hide audit columns on tablet/mobile, pinned ActionCode/Actions | Material-UI useMediaQuery | Maintains usability on small screens, reduces scroll width |

**All research decisions align with Constitution v1.1.0 requirements and technical constraints documented in plan.md.**

---

**Research Version**: 1.0.0  
**Completed**: February 12, 2026  
**Reviewed By**: AI Agent (GitHub Copilot)  
**Next Step**: Proceed to Phase 1 - Generate contracts/actions-api.openapi.yaml and contracts/tstate-contracts.md
