# tState Contracts Reference

**Feature**: 003-actions-management  
**Version**: 1.0.0  
**Purpose**: Document tState format, error codes, parsing strategy, and HTTP status mapping for Actions Management stored procedures

---

## tState Format Specification

**Format**: `STATUS~ERRORCODE~PROCEDURE_NAME~DATA~MESSAGE`

**Components**:
1. **STATUS**: `OK` (success) or `ERR` (error)
2. **ERRORCODE**: 5-digit code (`00000` for success, `50001-50015` for application errors, SQL error codes for database errors)
3. **PROCEDURE_NAME**: Name of the stored procedure that generated the tState
4. **DATA**: Key-value pairs separated by commas (e.g., `ActionID=123,TotalCount=150`)
5. **MESSAGE**: Human-readable message describing the outcome

**Delimiter**: Tilde (`~`) separates components

**Examples**:

```text
// Success - Action created
OK~00000~Sec_Actions_Insert~ActionID=123~Action created successfully

// Success - Action updated
OK~00000~Sec_Actions_Update~ActionID=456~Action updated successfully

// Success - Action list with pagination metadata
OK~00000~Sec_Actions_List~TotalCount=150,Page=1,PageSize=10~Actions retrieved successfully

// Success - Single action retrieved
OK~00000~Sec_Actions_Get~ActionID=789~Action retrieved successfully

// Success - ActionCode available
OK~00000~Sec_Actions_CheckCode~Available=1~ActionCode is available

// Error - Duplicate ActionCode on create
ERR~50001~Sec_Actions_Insert~N/A~ActionCode already exists

// Error - Duplicate ActionCode on update (different action)
ERR~50002~Sec_Actions_Update~N/A~ActionCode already exists for another action

// Error - Action not found
ERR~50003~Sec_Actions_Get~N/A~Action not found

// Error - Optimistic concurrency conflict
ERR~50004~Sec_Actions_Update~N/A~This action was modified by another user. Please refresh and try again.

// Error - Validation failure
ERR~50011~Sec_Actions_Insert~N/A~ActionCode is required

// Error - SQL Server error (e.g., constraint violation)
ERR~2627~Sec_Actions_Insert~N/A~Violation of UNIQUE KEY constraint 'UQ_Sec_Actions_ActionCode'. Cannot insert duplicate key in object 'dbo.Sec_Actions'.
```

---

## Error Code Taxonomy

### Success Codes

| Error Code | Status | Description |
|------------|--------|-------------|
| 00000 | OK | Operation completed successfully |

### Application Error Codes (50001-50015)

| Error Code | Category | Description | Triggered By | User-Friendly Message |
|------------|----------|-------------|--------------|----------------------|
| 50001 | Validation | ActionCode already exists (create) | Sec_Actions_Insert | Action code already exists. Please use a unique code. |
| 50002 | Validation | ActionCode already exists for another action (update) | Sec_Actions_Update | Action code already exists for another action. Please use a unique code. |
| 50003 | Not Found | Action not found (invalid ActionID) | Sec_Actions_Get, Sec_Actions_Update | Action not found. |
| 50004 | Concurrency | Action was modified by another user | Sec_Actions_Update | This action was modified by another user. Please refresh and try again. |
| 50010 | Validation | ActionID must be a positive integer | Sec_Actions_Get, Sec_Actions_Update | Invalid action ID. |
| 50011 | Validation | ActionCode is required | Sec_Actions_Insert, Sec_Actions_Update | ActionCode is required. |
| 50012 | Validation | ActionTitle is required | Sec_Actions_Insert, Sec_Actions_Update | ActionTitle is required. |
| 50013 | Validation | CreatedBy must be a valid UserID | Sec_Actions_Insert | Invalid user ID for CreatedBy. |
| 50014 | Validation | ActionCode format invalid | Sec_Actions_Insert, Sec_Actions_Update, Sec_Actions_CheckCode | ActionCode can only contain letters, numbers, underscores, hyphens, and periods. |
| 50015 | Validation | ModifiedBy must be a valid UserID | Sec_Actions_Update | Invalid user ID for ModifiedBy. |

### SQL Server Error Codes (Native)

| Error Code | Category | Description | User-Friendly Message |
|------------|----------|-------------|----------------------|
| 2627 | Constraint Violation | Unique key constraint violation | An unexpected database error occurred. Please try again. |
| 547 | Constraint Violation | Foreign key constraint violation | An unexpected database error occurred. Please try again. |
| 8134 | Arithmetic | Divide by zero error | An unexpected database error occurred. Please try again. |
| (Other) | Database Error | Unhandled SQL Server error | An unexpected error occurred. Please try again. |

**Note**: SQL Server native errors should be logged with full details but presented to users with generic messages per Constitution Section VI (security best practice).

---

## HTTP Status Code Mapping

| Error Code | HTTP Status | Response Body Example |
|------------|-------------|----------------------|
| 00000 | 200 OK | `{ "data": {...}, "message": "Action created successfully" }` |
| 00000 (Create) | 201 Created | `{ "data": {...}, "message": "Action created successfully" }` |
| 50001, 50002 | 409 Conflict | `{ "error": "Action code already exists. Please use a unique code.", "errorCode": "50001" }` |
| 50003 | 404 Not Found | `{ "error": "Action not found.", "errorCode": "50003" }` |
| 50004 | 409 Conflict | `{ "error": "This action was modified by another user. Please refresh and try again.", "errorCode": "50004" }` |
| 50010-50015 | 400 Bad Request | `{ "error": "ActionCode is required.", "errorCode": "50011" }` |
| SQL Errors | 500 Internal Server Error | `{ "error": "An unexpected error occurred. Please try again." }` |

**Mapping Rules**:
1. **Success (00000)**: 
   - GET/PUT/DELETE → 200 OK
   - POST → 201 Created
2. **Validation Errors (50010-50015)**: 400 Bad Request
3. **Not Found (50003)**: 404 Not Found
4. **Conflict (50001, 50002, 50004)**: 409 Conflict
5. **Database Errors (SQL codes)**: 500 Internal Server Error (with generic message)

---

## Backend Parsing Strategy

### C# tState Parser

```csharp
// Application/Services/ActionsService.cs
private (string Status, string ErrorCode, string Procedure, string Data, string Message) ParseTState(string tState)
{
    if (string.IsNullOrWhiteSpace(tState))
    {
        _logger.LogError("tState is null or empty");
        return ("ERR", "99999", "ActionsService", "N/A", "tState was null or empty");
    }

    var parts = tState.Split('~');
    
    if (parts.Length != 5)
    {
        _logger.LogError("tState format invalid: {TState}", tState);
        return ("ERR", "99998", "ActionsService", "N/A", "tState format invalid");
    }

    return (parts[0], parts[1], parts[2], parts[3], parts[4]);
}
```

### Exception Mapping

```csharp
// Application/Services/ActionsService.cs
public async Task<ActionDto> CreateActionAsync(CreateActionRequest request)
{
    var tState = new SqlParameter("@tState", SqlDbType.VarChar, 500) { Direction = ParameterDirection.Output };

    var action = await _repository.CreateActionAsync(
        request.ActionCode, 
        request.ActionTitle, 
        request.CreatedBy, 
        tState
    );

    var tStateValue = tState.Value?.ToString() ?? "ERR~99999~ActionsService~N/A~tState was null";
    var (status, errorCode, procedure, data, message) = ParseTState(tStateValue);

    if (status == "ERR")
    {
        _logger.LogWarning("Action creation failed: {ErrorCode} - {Message}", errorCode, message);

        throw errorCode switch
        {
            "50001" => new ConflictException(message),
            "50011" or "50012" or "50013" or "50014" => new ValidationException(message),
            _ when int.TryParse(errorCode, out var sqlErrorCode) && sqlErrorCode >= 50000 =>
                new ApplicationException($"Application error {errorCode}: {message}"),
            _ => new DatabaseException($"Database error {errorCode}: {message}")
        };
    }

    _logger.LogInformation("Action {ActionId} created successfully by user {UserId}", action.ActionId, request.CreatedBy);
    return action;
}
```

### Controller Exception Handling

```csharp
// Controllers/ActionsController.cs
[HttpPost]
public async Task<IActionResult> CreateAction([FromBody] CreateActionRequest request)
{
    try
    {
        var action = await _actionsService.CreateActionAsync(request);
        return CreatedAtAction(nameof(GetAction), new { id = action.ActionId }, new 
        { 
            data = action, 
            message = "Action created successfully" 
        });
    }
    catch (ValidationException ex)
    {
        return BadRequest(new 
        { 
            error = ex.Message, 
            errorCode = ExtractErrorCode(ex) // Extract from exception or tState
        });
    }
    catch (ConflictException ex)
    {
        return Conflict(new 
        { 
            error = ex.Message, 
            errorCode = ExtractErrorCode(ex) 
        });
    }
    catch (DatabaseException ex)
    {
        _logger.LogError(ex, "Database error creating action");
        return StatusCode(500, new 
        { 
            error = "An unexpected error occurred. Please try again." 
        });
    }
}

private string ExtractErrorCode(Exception ex)
{
    // Extract error code from exception Data dictionary or parse from message
    if (ex.Data.Contains("ErrorCode"))
    {
        return ex.Data["ErrorCode"]?.ToString() ?? "99999";
    }

    // Fallback: parse from message if embedded
    var match = System.Text.RegularExpressions.Regex.Match(ex.Message, @"error (\d{5}):");
    return match.Success ? match.Groups[1].Value : "99999";
}
```

---

## Frontend Parsing Strategy

### TypeScript Error Handler

```typescript
// frontend/src/utils/errorHandler.ts
export interface ErrorResponse {
  error: string;
  errorCode?: string;
}

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

export const handleApiError = (error: any): { message: string; code?: string } => {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as ErrorResponse;
    
    if (errorData?.errorCode) {
      return {
        message: getErrorMessage(errorData.errorCode),
        code: errorData.errorCode
      };
    }

    if (errorData?.error) {
      return { message: errorData.error };
    }

    // Fallback to HTTP status text
    return { message: error.message || 'An unexpected error occurred. Please try again.' };
  }

  return { message: 'An unexpected error occurred. Please try again.' };
};
```

### React Component Error Handling

```typescript
// frontend/src/pages/Security/Actions/ActionFormPage.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (isEditMode) {
      await actionsService.updateAction(actionId, formData);
      enqueueSnackbar('Action updated successfully', { variant: 'success' });
    } else {
      await actionsService.createAction(formData);
      enqueueSnackbar('Action created successfully', { variant: 'success' });
    }
    navigate('/Sec/Actions');
  } catch (error) {
    const { message, code } = handleApiError(error);
    
    // Special handling for concurrency conflict
    if (code === '50004') {
      setConcurrencyConflict(true); // Show dialog with refresh option
    } else {
      enqueueSnackbar(message, { 
        variant: 'error',
        persist: true 
      });
    }
  }
};
```

---

## Stored Procedure tState Examples

### Sec_Actions_Insert

**Success**:
```sql
SET @tState = 'OK~00000~Sec_Actions_Insert~ActionID=' + CAST(@NewActionID AS VARCHAR(10)) + '~Action created successfully';
```

**Error - Duplicate ActionCode**:
```sql
SET @tState = 'ERR~50001~Sec_Actions_Insert~N/A~ActionCode already exists';
```

**Error - Validation failure**:
```sql
SET @tState = 'ERR~50011~Sec_Actions_Insert~N/A~ActionCode is required';
```

### Sec_Actions_Update

**Success**:
```sql
SET @tState = 'OK~00000~Sec_Actions_Update~ActionID=' + CAST(@ActionID AS VARCHAR(10)) + '~Action updated successfully';
```

**Error - Optimistic concurrency conflict**:
```sql
SET @tState = 'ERR~50004~Sec_Actions_Update~N/A~This action was modified by another user. Please refresh and try again.';
```

**Error - Action not found**:
```sql
SET @tState = 'ERR~50003~Sec_Actions_Update~N/A~Action not found';
```

### Sec_Actions_List

**Success with pagination metadata**:
```sql
SET @tState = 'OK~00000~Sec_Actions_List~TotalCount=' + CAST(@TotalCount AS VARCHAR(10)) + ',Page=' + CAST(@PageNumber AS VARCHAR(10)) + ',PageSize=' + CAST(@PageSize AS VARCHAR(10)) + '~Actions retrieved successfully';
```

### Sec_Actions_Get

**Success**:
```sql
SET @tState = 'OK~00000~Sec_Actions_Get~ActionID=' + CAST(@ActionID AS VARCHAR(10)) + '~Action retrieved successfully';
```

**Error - Not found**:
```sql
SET @tState = 'ERR~50003~Sec_Actions_Get~N/A~Action not found';
```

### Sec_Actions_CheckCode

**Success - Available**:
```sql
SET @tState = 'OK~00000~Sec_Actions_CheckCode~Available=1~ActionCode is available';
```

**Success - Not available**:
```sql
SET @tState = 'OK~00000~Sec_Actions_CheckCode~Available=0~ActionCode already exists';
```

---

## Testing Strategies

### Backend Unit Tests

```csharp
// Backend/tests/WebApi.Tests/Services/ActionsServiceTests.cs
[Fact]
public async Task CreateAction_DuplicateActionCode_ThrowsConflictException()
{
    // Arrange
    var request = new CreateActionRequest 
    { 
        ActionCode = "USER_CREATE", 
        ActionTitle = "Create User", 
        CreatedBy = 123 
    };
    
    var tState = "ERR~50001~Sec_Actions_Insert~N/A~ActionCode already exists";
    _mockRepository
        .Setup(r => r.CreateActionAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<SqlParameter>()))
        .Callback<string, string, int, SqlParameter>((code, title, userId, tStateParam) => 
        {
            tStateParam.Value = tState;
        })
        .ReturnsAsync((ActionDto)null);

    // Act & Assert
    var exception = await Assert.ThrowsAsync<ConflictException>(() => 
        _actionsService.CreateActionAsync(request)
    );
    
    Assert.Equal("ActionCode already exists", exception.Message);
}
```

### Frontend Unit Tests

```typescript
// frontend/src/utils/errorHandler.test.ts
describe('getErrorMessage', () => {
  it('should return correct message for duplicate ActionCode error', () => {
    expect(getErrorMessage('50001')).toBe('Action code already exists. Please use a unique code.');
  });

  it('should return generic message for unknown error code', () => {
    expect(getErrorMessage('99999')).toBe('An unexpected error occurred. Please try again.');
  });
});
```

---

## Logging & Observability

### Backend Logging

```csharp
// Application/Services/ActionsService.cs
private (string Status, string ErrorCode, string Procedure, string Data, string Message) ParseTState(string tState)
{
    var parts = tState.Split('~');
    var status = parts[0];
    var errorCode = parts[1];
    var procedure = parts[2];
    var data = parts[3];
    var message = parts[4];

    // Structured logging with tState components
    if (status == "ERR")
    {
        _logger.LogWarning(
            "Stored procedure {Procedure} returned error: {ErrorCode} - {Message}. Data: {Data}",
            procedure,
            errorCode,
            message,
            data
        );
    }
    else
    {
        _logger.LogInformation(
            "Stored procedure {Procedure} succeeded. Data: {Data}",
            procedure,
            data
        );
    }

    return (status, errorCode, procedure, data, message);
}
```

### Frontend Error Tracking

```typescript
// frontend/src/services/actionsService.ts
import * as Sentry from '@sentry/react'; // Optional: for production error tracking

const handleError = (error: any, context: string) => {
  const { message, code } = handleApiError(error);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${context}] Error ${code || 'UNKNOWN'}:`, message);
  }

  // Send to error tracking service in production
  if (import.meta.env.PROD && Sentry) {
    Sentry.captureException(error, {
      tags: { errorCode: code, context },
      extra: { message }
    });
  }

  return { message, code };
};
```

---

## Constitution Compliance

This tState contract aligns with:
- **Section V (Database-as-Authority)**: Database stored procedures are the single source of truth for data integrity and business rules
- **Section VI (Error Handling)**: Application-specific error codes (50001-50015) provide granular error handling taxonomy
- **Section VIII (UI/UX Standards)**: User-friendly error messages improve UX, technical details logged for debugging
- **Section XIII (Logging & Observability)**: Structured logging of tState components enables traceability and debugging

---

**Document Version**: 1.0.0  
**Completed**: February 12, 2026  
**Reviewed By**: AI Agent (GitHub Copilot)  
**Next Step**: Update plan.md with Phase 0/1 completion, run Constitution re-check, proceed to Phase 2 (tasks.md generation)
