# Tasks: Actions Management (Security Module)

**Feature Branch**: `003-actions-management`  
**Input**: Design documents from `/specs/003-actions-management/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: TDD workflow required per Constitution Section III - all test tasks must be written and verified to FAIL before implementation tasks begin.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **Checkbox**: ALWAYS starts with `- [ ]`
- **[ID]**: Sequential task number (T001, T002, T003...)
- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, US3...) - ONLY for user story phase tasks
- **Description**: Clear action with exact file path

## Path Conventions

**Web Application Structure**:
- Backend: `backend/src/WebApi/`, `backend/database/`, `backend/tests/`
- Frontend: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create branch 003-actions-management from main branch
- [ ] T002 [P] Create feature directory structure specs/003-actions-management/ with subdirectories contracts/, tests/
- [ ] T003 [P] Create frontend directory structure frontend/src/pages/Security/Actions/ with subdirectory components/
- [ ] T004 [P] Create backend directory structure backend/src/WebApi/Controllers/, backend/src/WebApi/Application/Services/, backend/src/WebApi/Infrastructure/Data/
- [ ] T005 [P] Install frontend dependencies: @mui/x-data-grid@8.x, notistack@3.x, date-fns@3.x
- [ ] T006 [P] Install backend dependencies: CsvHelper NuGet package
- [ ] T007 Update frontend/src/App.tsx to add Security/Actions routes: /Sec/Actions, /Sec/Actions/New, /Sec/Actions/:id

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Migrations

- [ ] T008 Execute database migration backend/database/migrations/001-create-sec-actions-table.sql on TRANTS_EMS_DEV database (creates Sec_Actions table with 7 columns, 4 indexes, 2 check constraints)
- [ ] T009 Execute database migration backend/database/migrations/002-create-sec-actions-procedures.sql on TRANTS_EMS_DEV database (creates 5 stored procedures: Sec_Actions_Get, Sec_Actions_List, Sec_Actions_Insert, Sec_Actions_Update, Sec_Actions_CheckCode)
- [ ] T010 Verify database schema with metadata queries from data-model.md (check table exists, verify column definitions, confirm indexes, validate stored procedure uses_quoted_identifier = 1)
- [ ] T011 [P] Create seed data script backend/database/scripts/seed-sample-actions.sql with 15-20 sample actions for development testing

### Backend Core Infrastructure

- [ ] T012 [P] Create backend/src/WebApi/Infrastructure/Models/Action.cs domain entity with properties: ActionId, ActionCode, ActionTitle, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate
- [ ] T013 [P] Create backend/src/WebApi/Application/DTOs/ActionDto.cs with same properties as Action entity for API responses
- [ ] T014 [P] Create backend/src/WebApi/Application/DTOs/CreateActionRequest.cs with properties: ActionCode, ActionTitle, CreatedBy
- [ ] T015 [P] Create backend/src/WebApi/Application/DTOs/UpdateActionRequest.cs with properties: ActionCode, ActionTitle, ModifiedBy, OriginalModifiedDate
- [ ] T016 [P] Create backend/src/WebApi/Application/DTOs/ActionListRequest.cs with properties: Page, PageSize, SortColumn, SortDirection, FilterText
- [ ] T017 [P] Create backend/src/WebApi/Application/DTOs/ActionListResponse.cs with properties: Data (Action[] array), TotalCount, Page, PageSize
- [ ] T018 Create backend/src/WebApi/Infrastructure/Data/IActionsRepository.cs interface with methods: GetActionAsync, ListActionsAsync, CreateActionAsync, UpdateActionAsync, CheckActionCodeAsync
- [ ] T019 Create backend/src/WebApi/Infrastructure/Data/ActionsRepository.cs implementing IActionsRepository using Dapper to call stored procedures with tState OUTPUT parameter parsing
- [ ] T020 Create backend/src/WebApi/Application/Interfaces/IActionsService.cs interface with methods: GetActionAsync, ListActionsAsync, CreateActionAsync, UpdateActionAsync, CheckActionCodeAsync
- [ ] T021 Create backend/src/WebApi/Application/Services/ActionsService.cs implementing IActionsService with tState interpretation and exception mapping (ConflictException for 50001/50002/50004, NotFoundException for 50003, ValidationException for 50010-50015)
- [ ] T022 [P] Create backend/src/WebApi/Application/Validators/CreateActionRequestValidator.cs using FluentValidation with rules: ActionCode required, format regex ^[a-zA-Z0-9_.-]+$, maxLength 50; ActionTitle required, maxLength 200; CreatedBy greater than 0
- [ ] T023 [P] Create backend/src/WebApi/Application/Validators/UpdateActionRequestValidator.cs using FluentValidation with same rules as CreateActionRequestValidator plus ModifiedBy greater than 0
- [ ] T024 Update backend/src/WebApi/Program.cs to register DI: builder.Services.AddScoped<IActionsService, ActionsService>(), builder.Services.AddScoped<IActionsRepository, ActionsRepository>()
- [ ] T025 Update backend/src/WebApi/Program.cs to register FluentValidation validators for CreateActionRequest and UpdateActionRequest

### Frontend Core Infrastructure

- [ ] T026 [P] Create frontend/src/types/action.ts TypeScript interfaces: Action, CreateActionRequest, UpdateActionRequest, ActionListRequest, ActionListResponse
- [ ] T027 [P] Create frontend/src/utils/errorHandler.ts with functions: getErrorMessage(errorCode: string), handleApiError(error: any) mapping error codes 50001-50015 to user-friendly messages
- [ ] T028 Create frontend/src/services/actionsService.ts Axios API client with methods: listActions, getAction, createAction, updateAction, checkActionCode, exportActions (all returning Promise with proper typing)
- [ ] T029 [P] Create frontend/src/hooks/useActions.ts custom hook managing list state (loading, data, error, pagination model, sort model) with methods: fetchActions, refreshActions
- [ ] T030 [P] Create frontend/src/hooks/useActionForm.ts custom hook managing form state (formData, dirty state, validation errors, loading) with methods: handleChange, handleSubmit, resetForm
- [ ] T031 [P] Create frontend/src/hooks/useActionCodeValidation.ts custom hook for async validation with 500ms debounce and AbortController cancellation returning: isChecking, isAvailable, errorMessage
- [ ] T032 Update frontend/src/App.tsx to wrap application with SnackbarProvider from notistack (maxSnack=3, anchorOrigin bottom-center, autoHideDuration 3000ms)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Actions List (Priority: P1 [REQUIRED]) 🎯 MVP

**Goal**: Display all actions from Sec_Actions table in Material-UI DataGrid with server-side pagination, sorting, and basic navigation to create/update forms

**Independent Test**: Navigate to `/Sec/Actions`, verify DataGrid displays all actions with columns (ActionID, ActionCode, ActionTitle, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, Actions), verify Edit button in Actions column, verify Create New Action button navigates to `/Sec/Actions/New`

### Backend Tests for User Story 1 (TDD - Write First, Verify FAIL)

- [ ] T033 [P] [US1] Create backend/tests/WebApi.Tests/Controllers/ActionsControllerTests.cs with unit test: GetActions_ReturnsOkWithActionsList (mocks IActionsService.ListActionsAsync, expects 200 OK with ActionListResponse)
- [ ] T034 [P] [US1] Create backend/tests/WebApi.Tests/Application/ActionsServiceTests.cs with unit test: ListActionsAsync_CallsRepository_ReturnsMappedDtos (mocks IActionsRepository, verifies DTO mapping)
- [ ] T035 [P] [US1] Create backend/tests/WebApi.Tests/Infrastructure/ActionsRepositoryTests.cs with integration test: ListActionsAsync_CallsStoredProcedure_ParsesTState (uses test database, calls Sec_Actions_List, verifies result set and tState parsing)

### Backend Implementation for User Story 1

- [ ] T036 [US1] Implement ActionsRepository.ListActionsAsync method in backend/src/WebApi/Infrastructure/Data/ActionsRepository.cs calling Sec_Actions_List with parameters @PageNumber, @PageSize, @SortColumn, @SortDirection, @FilterText, @tState OUTPUT, mapping result set to Action entities
- [ ] T037 [US1] Implement ActionsService.ListActionsAsync method in backend/src/WebApi/Application/Services/ActionsService.cs calling repository, parsing tState (extract TotalCount from DATA field), mapping entities to ActionDto[], throwing appropriate exceptions for ERR status
- [ ] T038 [US1] Create backend/src/WebApi/Controllers/ActionsController.cs with [HttpGet] endpoint GET /api/actions accepting query params (page, pageSize, sortColumn, sortDirection, filterText), calling IActionsService.ListActionsAsync, returning ActionListResponse with 200 OK or error responses (400/500)
- [ ] T039 [US1] Add structured logging to ActionsController.GetActions with Serilog capturing correlation ID, request parameters (page, pageSize, sortColumn), response metadata (totalCount, rowCount), and timing

### Frontend Tests for User Story 1 (TDD - Write First, Verify FAIL)

- [ ] T040 [P] [US1] Create frontend/tests/unit/services/actionsService.test.ts with Vitest test: listActions_CallsApiEndpoint_ReturnsParsedResponse (mocks Axios GET /api/actions, expects ActionListResponse)
- [ ] T041 [P] [US1] Create frontend/tests/unit/hooks/useActions.test.ts with React Testing Library test: useActions_FetchesActions_UpdatesStateCorrectly (mocks actionsService.listActions, verifies loading/data/error states)
- [ ] T042 [P] [US1] Create frontend/tests/components/Security/Actions/ActionsListPage.test.tsx with React Testing Library test: ActionsListPage_RendersDataGrid_WithCreateButton (mocks useActions hook, expects DataGrid and Create New Action button rendered)
- [ ] T043 [P] [US1] Create frontend/tests/e2e/actions/view-actions-list.spec.ts with Playwright test: ViewActionsList_LoadsPage_DisplaysAllColumns (navigates to /Sec/Actions, expects table with 7 columns + Actions column visible, expects Create New Action button)

### Frontend Implementation for User Story 1

- [ ] T044 [P] [US1] Implement actionsService.listActions method in frontend/src/services/actionsService.ts calling GET /api/actions with query params, returning ActionListResponse
- [ ] T045 [US1] Implement useActions hook in frontend/src/hooks/useActions.ts managing paginationModel (page, pageSize), sortModel (field, sort), loading state, calling actionsService.listActions on mount and state changes
- [ ] T046 [P] [US1] Create frontend/src/components/Security/Actions/components/ActionsDataGrid.tsx Material-UI DataGrid component with columns definition (actionId 80px, actionCode 180px, actionTitle flex 1 minWidth 200px, createdBy 100px, createdDate 180px formatted, modifiedBy 100px, modifiedDate 180px formatted or "Never", actions 80px with Edit IconButton), paginationMode="server", sortingMode="server", autoHeight, row hover effect
- [ ] T047 [US1] Create frontend/src/pages/Security/Actions/ActionsListPage.tsx page component rendering page layout with header "Actions Management", Create New Action button (top-right, Add icon, navigates to /Sec/Actions/New), ActionsDataGrid component, loading skeleton during fetch, error Alert with Retry button on fetch failure, "No actions found" empty state with "Create your first action" prompt
- [ ] T048 [US1] Implement ActionsDataGrid onEditClick handler in frontend/src/pages/Security/Actions/ActionsListPage.tsx navigating to /Sec/Actions/:id using React Router useNavigate
- [ ] T049 [US1] Add responsive behavior to ActionsDataGrid in frontend/src/components/Security/Actions/components/ActionsDataGrid.tsx using Material-UI useMediaQuery hooks: Desktop ≥1200px (all columns visible), Tablet 992-1199px (hide createdBy, createdDate, modifiedBy, modifiedDate), Mobile <992px (hide actionId + audit columns, enable horizontal scroll, pin actionCode left and actions right with sticky positioning)

**Checkpoint**: User Story 1 complete - Actions list page fully functional, testable independently via E2E test, delivers value as read-only view

---

## Phase 4: User Story 2 - Create New Action (Priority: P1 [REQUIRED]) 🎯 MVP

**Goal**: Allow administrators to create new actions via form at `/Sec/Actions/New` with ActionCode and ActionTitle validation, calling Sec_Actions_Insert stored procedure

**Independent Test**: Navigate to `/Sec/Actions/New`, fill ActionCode and ActionTitle, submit form, verify new action appears in Sec_Actions table and list page, verify success Snackbar notification and redirect

### Backend Tests for User Story 2 (TDD - Write First, Verify FAIL)

- [ ] T050 [P] [US2] Create backend/tests/WebApi.Tests/Controllers/ActionsControllerTests.cs with unit test: CreateAction_ValidRequest_Returns201Created (mocks IActionsService.CreateActionAsync, expects 201 Created with ActionDto)
- [ ] T051 [P] [US2] Create backend/tests/WebApi.Tests/Controllers/ActionsControllerTests.cs with unit test: CreateAction_DuplicateCode_Returns409Conflict (mocks service throwing ConflictException, expects 409 with error code 50001)
- [ ] T052 [P] [US2] Create backend/tests/WebApi.Tests/Application/ActionsServiceTests.cs with unit test: CreateActionAsync_DuplicateCode_ThrowsConflictException (mocks repository returning tState ERR~50001, expects ConflictException)
- [ ] T053 [P] [US2] Create backend/tests/WebApi.Tests/Infrastructure/ActionsRepositoryTests.cs with integration test: CreateActionAsync_ValidData_ReturnsNewActionWithId (uses test database, calls Sec_Actions_Insert, verifies new action created with ActionID, verifies tState OK~00000)

### Backend Implementation for User Story 2

- [ ] T054 [US2] Implement ActionsRepository.CreateActionAsync method in backend/src/WebApi/Infrastructure/Data/ActionsRepository.cs calling Sec_Actions_Insert with parameters @ActionCode, @ActionTitle, @CreatedBy, @tState OUTPUT, extracting new ActionID from tState DATA field, retrieving created action with Sec_Actions_Get
- [ ] T055 [US2] Implement ActionsService.CreateActionAsync method in backend/src/WebApi/Application/Services/ActionsService.cs calling repository, parsing tState, throwing ConflictException for error code 50001 (duplicate), ValidationException for 50011/50012/50013/50014 (validation errors), logging creation with action ID and user ID
- [ ] T056 [US2] Add [HttpPost] endpoint POST /api/actions to backend/src/WebApi/Controllers/ActionsController.cs accepting CreateActionRequest body, validating with FluentValidation, calling IActionsService.CreateActionAsync, returning 201 Created with Location header /api/actions/{id} or error responses (400 validation, 409 conflict, 500 server error)
- [ ] T057 [US2] Implement ActionsController exception handling for POST /api/actions mapping ValidationException to 400 BadRequest with { error, errorCode }, ConflictException to 409 Conflict with { error, errorCode: "50001" }, DatabaseException to 500 InternalServerError with generic message
- [ ] T058 [US2] Add structured logging to ActionsController.CreateAction capturing action code, action title, created by user ID, success/error outcome, tState details for debugging

### Frontend Tests for User Story 2 (TDD - Write First, Verify FAIL)

- [ ] T059 [P] [US2] Create frontend/tests/unit/services/actionsService.test.ts with Vitest test: createAction_ValidRequest_ReturnsCreatedAction (mocks Axios POST /api/actions, expects 201 with ActionDto)
- [ ] T060 [P] [US2] Create frontend/tests/unit/hooks/useActionForm.test.ts with React Testing Library test: useActionForm_HandlesChange_UpdatesFormData (renders form, types in fields, expects formData updated and dirty state true)
- [ ] T061 [P] [US2] Create frontend/tests/components/Security/Actions/ActionFormPage.test.tsx with React Testing Library test: ActionFormPage_CreateMode_SubmitsForm_ShowsSuccessSnackbar (renders form in create mode, fills fields, clicks Submit, expects actionsService.createAction called, Snackbar visible, navigation to /Sec/Actions)
- [ ] T062 [P] [US2] Create frontend/tests/e2e/actions/create-action.spec.ts with Playwright test: CreateAction_ValidData_CreatesSuccessfully (navigates to /Sec/Actions/New, fills ActionCode and ActionTitle, clicks Create Action button, expects success Snackbar "Action created successfully", redirect to /Sec/Actions, new action visible in table)

### Frontend Implementation for User Story 2

- [ ] T063 [P] [US2] Implement actionsService.createAction method in frontend/src/services/actionsService.ts calling POST /api/actions with CreateActionRequest body, returning Promise<ActionDto>
- [ ] T064 [US2] Implement useActionForm hook for create mode in frontend/src/hooks/useActionForm.ts initializing empty formData { actionCode: "", actionTitle: "" }, tracking dirty state (any field changed), providing handleChange(field, value), handleSubmit(onSuccess callback), resetForm(), client-side validation (required, maxLength, format regex)
- [ ] T065 [P] [US2] Create frontend/src/components/Security/Actions/components/ActionForm.tsx reusable form component with Material-UI TextFields for ActionCode (max 50 chars, pattern validation) and ActionTitle (max 200 chars, multiline rows=2), character counters ("X/50", "X/200"), inline validation errors on blur, Submit and Cancel buttons (disabled/loading states)
- [ ] T066 [P] [US2] Create frontend/src/components/Security/Actions/components/ActionCodeField.tsx specialized TextField for ActionCode with async validation using useActionCodeValidation hook, displaying loading spinner, success checkmark (green CheckCircle icon), or error icon (red Error icon) in InputAdornment, optional async check enabled via prop
- [ ] T067 [US2] Create frontend/src/pages/Security/Actions/ActionFormPage.tsx page component detecting create vs update mode via useParams (id present = update, absent = create), rendering page layout with header "Create New Action", ActionForm component, handling form submission calling actionsService.createAction, displaying success Snackbar "Action created successfully" (green, 3s auto-dismiss), navigating to /Sec/Actions on success, displaying error Snackbar on failure (red, persistent until dismissed)
- [ ] T068 [US2] Implement Cancel button handler in ActionFormPage.tsx checking dirty state, showing Material-UI Dialog "Discard unsaved changes?" with Discard button (navigates to /Sec/Actions) and Cancel button (closes dialog, stays on form)
- [ ] T069 [US2] Implement form submission loading state in ActionFormPage.tsx disabling Submit button with loading spinner, changing text to "Creating...", disabling all form fields during submission to prevent duplicate submissions

**Checkpoint**: User Story 2 complete - Create action form fully functional, testable independently via E2E test, delivers value by enabling system expansion

---

## Phase 5: User Story 3 - Update Existing Action (Priority: P1 [REQUIRED]) 🎯 MVP

**Goal**: Allow administrators to update existing actions via form at `/Sec/Actions/:id` with ActionCode and ActionTitle editing, calling Sec_Actions_Update stored procedure with optimistic concurrency control

**Independent Test**: Navigate to `/Sec/Actions`, click Edit button on any action, verify navigation to `/Sec/Actions/:id` with pre-populated form, modify ActionCode or ActionTitle, submit, verify action updated in Sec_Actions table with ModifiedBy and ModifiedDate populated, verify success Snackbar and redirect

### Backend Tests for User Story 3 (TDD - Write First, Verify FAIL)

- [ ] T070 [P] [US3] Create backend/tests/WebApi.Tests/Controllers/ActionsControllerTests.cs with unit test: GetAction_ValidId_ReturnsOkWithAction (mocks IActionsService.GetActionAsync, expects 200 OK with ActionDto)
- [ ] T071 [P] [US3] Create backend/tests/WebApi.Tests/Controllers/ActionsControllerTests.cs with unit test: GetAction_InvalidId_Returns404NotFound (mocks service throwing NotFoundException, expects 404 with error code 50003)
- [ ] T072 [P] [US3] Create backend/tests/WebApi.Tests/Controllers/ActionsControllerTests.cs with unit test: UpdateAction_ValidRequest_Returns200Ok (mocks IActionsService.UpdateActionAsync, expects 200 OK with updated ActionDto)
- [ ] T073 [P] [US3] Create backend/tests/WebApi.Tests/Controllers/ActionsControllerTests.cs with unit test: UpdateAction_ConcurrencyConflict_Returns409Conflict (mocks service throwing ConflictException with code 50004, expects 409 with error message about concurrent modification)
- [ ] T074 [P] [US3] Create backend/tests/WebApi.Tests/Application/ActionsServiceTests.cs with unit test: UpdateActionAsync_ConcurrencyConflict_ThrowsConflictException (mocks repository returning tState ERR~50004, expects ConflictException with message about modified by another user)
- [ ] T075 [P] [US3] Create backend/tests/WebApi.Tests/Infrastructure/ActionsRepositoryTests.cs with integration test: UpdateActionAsync_ValidData_UpdatesAction (uses test database, creates action, calls Sec_Actions_Update, verifies action updated, verifies ModifiedBy and ModifiedDate set, verifies tState OK~00000)
- [ ] T076 [P] [US3] Create backend/tests/WebApi.Tests/Infrastructure/ActionsRepositoryTests.cs with integration test: UpdateActionAsync_ModifiedDateMismatch_ReturnsConcurrencyError (creates action, updates it, attempts second update with stale ModifiedDate, expects tState ERR~50004)

### Backend Implementation for User Story 3

- [ ] T077 [US3] Implement ActionsRepository.GetActionAsync method in backend/src/WebApi/Infrastructure/Data/ActionsRepository.cs calling Sec_Actions_Get with parameter @ActionID, @tState OUTPUT, mapping result to Action entity or returning null if not found
- [ ] T078 [US3] Implement ActionsService.GetActionAsync method in backend/src/WebApi/Application/Services/ActionsService.cs calling repository, parsing tState, throwing NotFoundException for error code 50003 (not found), mapping entity to ActionDto, logging retrieval with action ID
- [ ] T079 [US3] Add [HttpGet("{id}")] endpoint GET /api/actions/{id} to backend/src/WebApi/Controllers/ActionsController.cs accepting id path parameter, calling IActionsService.GetActionAsync, returning 200 OK with ActionDto or error responses (400 invalid ID, 404 not found, 500 server error)
- [ ] T080 [US3] Implement ActionsRepository.UpdateActionAsync method in backend/src/WebApi/Infrastructure/Data/ActionsRepository.cs calling Sec_Actions_Update with parameters @ActionID, @ActionCode, @ActionTitle, @ModifiedBy, @OriginalModifiedDate (for optimistic concurrency), @tState OUTPUT, retrieving updated action with Sec_Actions_Get
- [ ] T081 [US3] Implement ActionsService.UpdateActionAsync method in backend/src/WebApi/Application/Services/ActionsService.cs calling repository, parsing tState, throwing ConflictException for error codes 50002 (duplicate ActionCode) and 50004 (concurrency conflict), NotFoundException for 50003, ValidationException for 50010-50015, logging update with action ID, modified by user ID, and original vs new values
- [ ] T082 [US3] Add [HttpPut("{id}")] endpoint PUT /api/actions/{id} to backend/src/WebApi/Controllers/ActionsController.cs accepting id path parameter and UpdateActionRequest body, validating with FluentValidation, calling IActionsService.UpdateActionAsync, returning 200 OK with updated ActionDto or error responses (400 validation, 404 not found, 409 conflict for duplicate code or concurrency, 500 server error)
- [ ] T083 [US3] Implement ActionsController exception handling for PUT /api/actions/{id} mapping NotFoundException to 404 NotFound with { error: "Action not found.", errorCode: "50003" }, ConflictException to 409 Conflict extracting error code (50002 or 50004) and appropriate message, ValidationException to 400 BadRequest
- [ ] T084 [US3] Add structured logging to ActionsController.GetAction and ActionsController.UpdateAction capturing action ID, user ID, original vs new values (for update), concurrency conflict details if applicable

### Frontend Tests for User Story 3 (TDD - Write First, Verify FAIL)

- [ ] T085 [P] [US3] Create frontend/tests/unit/services/actionsService.test.ts with Vitest tests: getAction_ValidId_ReturnsAction (mocks Axios GET /api/actions/{id}, expects ActionDto), updateAction_ValidRequest_ReturnsUpdatedAction (mocks Axios PUT /api/actions/{id}, expects ActionDto)
- [ ] T086 [P] [US3] Create frontend/tests/unit/hooks/useActionForm.test.ts with React Testing Library test: useActionForm_UpdateMode_LoadsInitialData (mocks actionsService.getAction, expects formData populated with action details, dirty state false)
- [ ] T087 [P] [US3] Create frontend/tests/components/Security/Actions/ActionFormPage.test.tsx with React Testing Library test: ActionFormPage_UpdateMode_RendersPrePopulatedForm (renders form in update mode with id param, expects fields populated, audit info displayed read-only, Submit button labeled "Update Action")
- [ ] T088 [P] [US3] Create frontend/tests/components/Security/Actions/ActionFormPage.test.tsx with React Testing Library test: ActionFormPage_UpdateMode_SubmitsForm_ShowsSuccessSnackbar (renders form in update mode, modifies fields, clicks Update Action button, expects actionsService.updateAction called with originalModifiedDate, Snackbar visible, navigation to /Sec/Actions)
- [ ] T089 [P] [US3] Create frontend/tests/e2e/actions/update-action.spec.ts with Playwright test: UpdateAction_ModifiesData_UpdatesSuccessfully (navigates to /Sec/Actions, clicks Edit button, modifies ActionTitle, clicks Update Action button, expects success Snackbar "Action updated successfully", redirect to /Sec/Actions, updated action visible in table)
- [ ] T090 [P] [US3] Create frontend/tests/e2e/actions/concurrency-conflict.spec.ts with Playwright test: UpdateAction_ConcurrentModification_ShowsConflictDialog (simulates concurrent update via API, attempts form submit, expects error with code 50004, Dialog with message "This action was modified by another user", Refresh button reloads form with latest data)

### Frontend Implementation for User Story 3

- [ ] T091 [P] [US3] Implement actionsService.getAction method in frontend/src/services/actionsService.ts calling GET /api/actions/{id}, returning Promise<ActionDto>
- [ ] T092 [P] [US3] Implement actionsService.updateAction method in frontend/src/services/actionsService.ts calling PUT /api/actions/{id} with UpdateActionRequest body (including originalModifiedDate for optimistic concurrency), returning Promise<ActionDto>
- [ ] T093 [US3] Enhance useActionForm hook in frontend/src/hooks/useActionForm.ts to support update mode: accept actionId param, call actionsService.getAction on mount to load initial data, set formData and originalModifiedDate state, track dirty state (formData different from loaded data), provide handleSubmit passing originalModifiedDate
- [ ] T094 [US3] Update ActionFormPage.tsx in frontend/src/pages/Security/Actions/ActionFormPage.tsx to detect update mode via useParams (id present), pass actionId to useActionForm hook, change page header to "Update Action", change Submit button text to "Update Action", display read-only audit information below form fields using Typography: "Created by User {createdBy} on {createdDate formatted}" and "Last modified by User {modifiedBy} on {modifiedDate formatted}" or "Never modified" if null
- [ ] T095 [US3] Implement concurrency conflict handling in ActionFormPage.tsx detecting error code 50004 from handleApiError, setting concurrencyConflict state true, rendering Material-UI Dialog with title "Action Was Modified", content "This action was modified by another user. Would you like to refresh and see the latest version?", actions: Cancel button (closes dialog, stays on stale form) and Refresh button (calls window.location.reload() to reload form with latest data)
- [ ] T096 [US3] Implement not found handling in ActionFormPage.tsx for invalid actionId detecting error code 50003 from actionsService.getAction, rendering full-page error Card with heading "Action Not Found", message "The action you're looking for doesn't exist or has been deleted.", and "Return to Actions List" button navigating to /Sec/Actions
- [ ] T097 [US3] Enhance form submission loading state in ActionFormPage.tsx for update mode changing Submit button text to "Updating..." during submission

**Checkpoint**: User Story 3 complete - Update action form fully functional including optimistic concurrency control, testable independently via E2E test, completes core CRUD functionality

---

## Phase 6: User Story 4 - Actions Table Interaction & Navigation (Priority: P2 [RECOMMENDED])

**Goal**: Enhance Actions table with advanced features: client-side pagination controls, column filtering, CSV export, improved mobile responsive behavior

**Independent Test**: Load Actions list with 20+ rows, test pagination controls (next/previous page, page size selection), type in column filter, click Export button to download CSV, view on mobile viewport to verify responsive behavior

### Backend Tests for User Story 4 (TDD - Write First, Verify FAIL)

- [ ] T098 [P] [US4] Create backend/tests/WebApi.Tests/Controllers/ActionsControllerTests.cs with unit test: ExportActions_ValidRequest_ReturnsCsvFile (mocks IActionsService.ListActionsAsync with large dataset, expects 200 OK with text/csv Content-Type and Content-Disposition header)

### Backend Implementation for User Story 4

- [ ] T099 [US4] Add [HttpGet("export")] endpoint GET /api/actions/export to backend/src/WebApi/Controllers/ActionsController.cs accepting query params (sortColumn, sortDirection, filterText), setting Response.ContentType to "text/csv", Response.Headers Content-Disposition to "attachment; filename=\"actions_export_{timestamp}.csv\"", streaming CSV generation using CsvHelper with batched data fetch (100 rows per batch, max 5000 rows total), writing header row and data rows to Response.Body, implementing async streaming with await csv.FlushAsync()
- [ ] T100 [US4] Add error handling to ActionsController.ExportActions for timeout (60s limit), memory exhaustion (row limit exceeded), logging export operation with row count, filters applied, user ID, and duration

### Frontend Tests for User Story 4 (TDD - Write First, Verify FAIL)

- [ ] T101 [P] [US4] Create frontend/tests/unit/services/actionsService.test.ts with Vitest test: exportActions_ValidRequest_ReturnsBlob (mocks Axios GET /api/actions/export with responseType blob, expects Blob returned)
- [ ] T102 [P] [US4] Create frontend/tests/components/Security/Actions/ActionsListPage.test.tsx with React Testing Library test: ActionsListPage_PaginationControls_ChangePageSize (renders page, clicks page size dropdown, selects 25, expects useActions hook called with pageSize 25)
- [ ] T103 [P] [US4] Create frontend/tests/e2e/actions/table-interactions.spec.ts with Playwright test: ActionsTable_Export_DownloadsCsv (navigates to /Sec/Actions, clicks Export button, expects CSV file download with filename pattern actions_export_*.csv)

### Frontend Implementation for User Story 4

- [ ] T104 [P] [US4] Implement actionsService.exportActions method in frontend/src/services/actionsService.ts calling GET /api/actions/export with query params (sortColumn, sortDirection, filterText), using Axios responseType: 'blob', timeout: 60000, returning Blob, creating blob URL with window.URL.createObjectURL, triggering download via temporary <a> element with click(), cleaning up with URL.revokeObjectURL
- [ ] T105 [P] [US4] Create frontend/src/components/Security/Actions/components/ExportButton.tsx Material-UI Button component with Download icon, onClick handler calling actionsService.exportActions passing current sort/filter state from useActions hook, showing loading spinner during export, displaying error Snackbar if export fails (timeout or network error)
- [ ] T106 [US4] Add ExportButton to ActionsListPage.tsx in frontend/src/pages/Security/Actions/ActionsListPage.tsx positioning in toolbar next to Create New Action button (both top-right), passing current pagination/sort/filter state as props
- [ ] T107 [US4] Enhance ActionsDataGrid pagination in frontend/src/components/Security/Actions/components/ActionsDataGrid.tsx adding pageSizeOptions prop [10, 25, 50, 100], onPaginationModelChange handler updating useActions hook state, rendering page info "Showing X-Y of Z actions" using DataGrid footer customization
- [ ] T108 [US4] Add column filtering to ActionsDataGrid in frontend/src/components/Security/Actions/components/ActionsDataGrid.tsx implementing TextField above each filterable column (ActionCode, ActionTitle) with 300ms debounce using useEffect + setTimeout, onChange handler updating filterText state in useActions hook, X icon to clear filter, visual indicator showing "X actions found" when filter active
- [ ] T109 [US4] Enhance responsive behavior in ActionsDataGrid in frontend/src/components/Security/Actions/components/ActionsDataGrid.tsx for Mobile <992px: hide actionId column, enable horizontal scroll via Box wrapper with overflowX: 'auto', implement sticky positioning for actionCode column (left: 0, zIndex: 1, backgroundColor: theme.palette.background.paper) and actions column (right: 0, zIndex: 1), ensure touch scrolling smooth on mobile devices

**Checkpoint**: User Story 4 complete - Advanced table features enhance usability for production systems with large action sets, delivers value through improved efficiency

---

## Phase 7: User Story 5 - Actions Search & Quick Access (Priority: P3 [OPTIONAL])

**Goal**: Add global search field filtering Actions table by ActionCode or ActionTitle for quick access to specific actions

**Independent Test**: Load Actions list, type in global search field (3+ characters), verify table filters to show only matching actions, verify "X actions found matching '[query]'" message, clear search to return full dataset

### Frontend Tests for User Story 5 (TDD - Write First, Verify FAIL)

- [ ] T110 [P] [US5] Create frontend/tests/components/Security/Actions/ActionsListPage.test.tsx with React Testing Library test: ActionsListPage_GlobalSearch_FiltersResults (renders page, types "USER" in search field, expects useActions hook called with filterText "USER" after 300ms debounce)
- [ ] T111 [P] [US5] Create frontend/tests/e2e/actions/search-actions.spec.ts with Playwright test: SearchActions_TypesQuery_ShowsFilteredResults (navigates to /Sec/Actions, types "USER" in search field, waits 300ms, expects table shows only actions with "USER" in ActionCode or ActionTitle, expects result count message visible)

### Frontend Implementation for User Story 5

- [ ] T112 [US5] Add global search field to ActionsListPage.tsx in frontend/src/pages/Security/Actions/ActionsListPage.tsx rendering Material-UI TextField with Search icon in InputAdornment (start position), placeholder "Search actions by code or title...", minLength 3 characters validation, onChange handler with 300ms debounce updating filterText state in useActions hook, Clear icon (X) in InputAdornment (end position) clearing search and filter
- [ ] T113 [US5] Add search result indicator to ActionsListPage.tsx below search field rendering Typography when filterText active displaying "X actions found matching '[filterText]'" or "No actions found matching '[filterText]'" when totalCount is 0, with "Clear Search" button resetting filterText
- [ ] T114 [US5] Position global search field in ActionsListPage.tsx toolbar prominently centered or left-aligned before Create New Action and Export buttons ensuring accessible tab order

**Checkpoint**: User Story 5 complete - Global search enhances convenience for administrators managing large action sets, delivers incremental value over column filtering

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final quality assurance

### Error Handling & Resilience

- [ ] T115 [P] Implement network failure handling in frontend/src/services/actionsService.ts wrapping all Axios calls in try-catch, detecting network errors (error.code === 'ECONNABORTED' or !error.response), displaying error Snackbar "Network connection lost. Your changes were not saved." with Retry button implementing exponential backoff (1s, 2s, 4s, then fail), Cancel button closing Snackbar
- [ ] T116 [P] Implement session expiration handling in frontend/src/services/actionsService.ts detecting 401 response via Axios response interceptor, displaying Material-UI Dialog "Your session has expired. Please log in again.", Login button redirecting to login page with return URL preserving current route and form state (if applicable) in query string encoded with encodeURIComponent
- [ ] T117 [P] Add error boundary component frontend/src/components/ErrorBoundary.tsx wrapping ActionsListPage and ActionFormPage catching React errors, displaying fallback UI "Something went wrong" with "Reload Page" button, logging error to console (development) or error tracking service (production)

### Logging & Observability

- [ ] T118 [P] Enhance Serilog structured logging in backend/src/WebApi/Controllers/ActionsController.cs adding correlation ID middleware, capturing all request/response metadata (method, path, status code, duration), user ID from authentication context, error details with stack traces for 500 errors, masking sensitive data (no ActionCode/ActionTitle in error logs, only IDs)
- [ ] T119 [P] Add frontend error tracking integration in frontend/src/utils/errorHandler.ts conditionally importing Sentry (or similar) in production, capturing exceptions with context (errorCode, user action, route), tagging errors by category (network, validation, server), avoiding PII in error messages

### Performance Optimization

- [ ] T120 [P] Add React.memo to ActionsDataGrid component in frontend/src/components/Security/Actions/components/ActionsDataGrid.tsx preventing unnecessary re-renders when parent state changes but props remain same
- [ ] T121 [P] Implement debounce for DataGrid sort/filter changes in frontend/src/hooks/useActions.ts preventing rapid API calls during user interactions, 300ms delay before fetching new data
- [ ] T122 [P] Add database indexes verification for Sec_Actions table confirming IX_Sec_Actions_CreatedBy, IX_Sec_Actions_CreatedDate exist and are being used by Sec_Actions_List stored procedure (check execution plan in SSMS)

### Documentation & Code Quality

- [ ] T123 [P] Update specs/003-actions-management/quickstart.md with actual implementation details: exact routes, component file paths, API endpoint formats, error code reference table, screenshot placeholders
- [ ] T124 [P] Add JSDoc comments to all frontend services and hooks in frontend/src/services/actionsService.ts and frontend/src/hooks/ with parameter types, return types, usage examples
- [ ] T125 [P] Add XML documentation comments to all backend public methods in Controllers, Services, Repositories with <summary>, <param>, <returns>, <exception> tags
- [ ] T126 [P] Run Prettier on all frontend code ensuring consistent formatting (2 spaces indent, single quotes, trailing commas ES5, semicolons)
- [ ] T127 [P] Run backend code formatting with dotnet format ensuring consistent C# style (no TODO comments, no commented code blocks, consistent using statements)

### Final Validation

- [ ] T128 Run all backend unit tests: dotnet test backend/tests/WebApi.Tests/ ensuring 100% pass rate
- [ ] T129 Run all frontend unit tests: npm test --run ensuring 100% pass rate
- [ ] T130 Run all E2E tests: npx playwright test tests/e2e/actions/ ensuring 100% pass rate across all browsers (Chromium primary, Firefox/Safari optional)
- [ ] T131 Manual smoke test following specs/003-actions-management/quickstart.md user journeys: View All Actions, Create New Action, Update Existing Action, Search for Specific Action, verifying all success criteria met
- [ ] T132 Performance benchmark: Measure Actions list load time with 100 rows (<2s TTI target), Create action response time (<500ms target), Update action response time (<500ms target), CSV export with 1000 rows (<30s target)
- [ ] T133 Accessibility audit: Run axe DevTools on /Sec/Actions and /Sec/Actions/New pages ensuring WCAG AA compliance (contrast ratios 4.5:1 minimum, keyboard navigation functional, ARIA labels present, screen reader compatible)
- [ ] T134 Security audit: Verify no SQL injection vulnerability (parameterized stored procedures only), verify authentication required for all routes, verify CreatedBy/ModifiedBy populated from authenticated session (no client-supplied values), verify tState error messages don't leak sensitive data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - **Database Schema & Migrations** section MUST complete first (T008-T011)
  - **Backend Core Infrastructure** section can proceed in parallel after database ready (T012-T025)
  - **Frontend Core Infrastructure** section can proceed in parallel after database ready (T026-T032)
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3) can start immediately after Phase 2 complete
  - User Story 2 (Phase 4) can start immediately after Phase 2 complete (independent of US1)
  - User Story 3 (Phase 5) depends on US1 complete (needs Edit button in table)
  - User Story 4 (Phase 6) depends on US1 complete (enhances existing table)
  - User Story 5 (Phase 7) depends on US1 complete (adds search to existing table)
- **Polish (Phase 8)**: Depends on all required user stories complete (US1, US2, US3)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Depends on User Story 1 complete (requires Edit button in Actions column)
- **User Story 4 (P2)**: Depends on User Story 1 complete (enhances existing ActionsDataGrid)
- **User Story 5 (P3)**: Depends on User Story 1 complete (adds global search to existing page)

### Within Each User Story

- **Tests MUST be written first** and verified to FAIL before implementation (TDD workflow per Constitution Section III)
- Backend tests → Backend implementation (repository → service → controller)
- Frontend tests → Frontend implementation (service → hook → component → page)
- Backend complete before frontend integration (API must be functional for frontend to call)
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: T002, T003, T004 (directory creation), T005, T006 (dependency installation) can run in parallel
- **Phase 2 Foundational**: 
  - T011 seed data can run in parallel with T012-T023 backend infrastructure
  - T012-T017 DTOs/entities can all run in parallel (different files)
  - T022-T023 validators can run in parallel
  - T026-T031 frontend infrastructure can all run in parallel (different files)
  - Backend (T012-T025) and Frontend (T026-T032) sections can run in parallel
- **Within Each User Story**:
  - All test tasks marked [P] can run in parallel (different test files)
  - Backend DTO/entity tasks marked [P] can run in parallel
  - Frontend component tasks marked [P] can run in parallel if they don't share state
- **User Stories**: After Phase 2, US1 and US2 can be implemented in parallel by different developers (no shared files)
- **Phase 8 Polish**: Most tasks marked [P] can run in parallel (different concerns)

---

## Parallel Example: User Story 1 Backend

```bash
# Launch all backend tests for User Story 1 together (write tests first):
T033: Create ActionsControllerTests.cs with GetActions_ReturnsOkWithActionsList
T034: Create ActionsServiceTests.cs with ListActionsAsync_CallsRepository_ReturnsMappedDtos
T035: Create ActionsRepositoryTests.cs integration test with Sec_Actions_List call

# After tests written and verified to FAIL, implement in sequence:
T036: Implement ActionsRepository.ListActionsAsync (repository layer)
T037: Implement ActionsService.ListActionsAsync (service layer, depends on T036)
T038: Implement ActionsController GET /api/actions (controller layer, depends on T037)
T039: Add structured logging (can run in parallel with T038 or after)
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only - All P1 [REQUIRED])

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T032) - CRITICAL foundation
3. Complete Phase 3: User Story 1 - View Actions List (T033-T049)
4. **VALIDATE**: Test US1 independently via E2E test, verify table displays correctly
5. Complete Phase 4: User Story 2 - Create New Action (T050-T069)
6. **VALIDATE**: Test US2 independently via E2E test, create action and verify in table
7. Complete Phase 5: User Story 3 - Update Existing Action (T070-T097)
8. **VALIDATE**: Test US3 independently via E2E test, update action and verify changes
9. Complete Phase 8: Polish - Error handling, logging, final validation (T115-T134)
10. **STOP and DEPLOY MVP**: Core CRUD functionality complete

**MVP Scope**: Administrators can view all actions, create new actions, and update existing actions with full audit trail. This delivers immediate value for Security module configuration.

### Incremental Delivery (Add P2 and P3 Features After MVP)

After MVP deployed:

11. Complete Phase 6: User Story 4 - Advanced Table Features (T098-T109) - P2 [RECOMMENDED]
12. **VALIDATE**: Test advanced features (pagination, filtering, export)
13. **DEPLOY**: Enhanced usability for large action sets
14. Complete Phase 7: User Story 5 - Global Search (T110-T114) - P3 [OPTIONAL]
15. **VALIDATE**: Test global search functionality
16. **DEPLOY**: Convenience enhancement for quick access

### Parallel Team Strategy

With 3 developers available:

1. **All team members**: Complete Phase 1 + Phase 2 together (foundation must be solid)
2. Once Phase 2 complete:
   - **Developer A**: Phase 3 (User Story 1 - View List) T033-T049
   - **Developer B**: Phase 4 (User Story 2 - Create Action) T050-T069
   - **Developer C**: Setup test infrastructure, seed data, monitoring
3. After US1 and US2 complete:
   - **Developer A**: Phase 5 (User Story 3 - Update Action) T070-T097 (depends on US1 Edit button)
   - **Developer B**: Start Phase 6 (User Story 4 - Advanced Features) T098-T109 (depends on US1 DataGrid)
   - **Developer C**: Phase 8 Polish - Error handling, logging T115-T122
4. Final validation (Phase 8 T128-T134) done by all team members together

---

## Notes

- **[P] tasks**: Different files, no dependencies on incomplete work, can execute in parallel
- **[Story] label**: Maps task to specific user story for traceability (US1, US2, US3, US4, US5)
- **TDD workflow**: All test tasks MUST be written first, verified to FAIL, then implementation begins (Red-Green-Refactor per Constitution Section III)
- **Each user story independently completable**: US1 can be deployed without US2/US3, US2 without US3, etc.
- **Optimistic concurrency**: US3 includes ModifiedDate comparison to prevent concurrent update conflicts
- **Error handling**: All tState error codes (50001-50015) mapped to user-friendly messages and HTTP status codes
- **Responsive design**: Mobile breakpoints ≥768px, Tablet ≥992px, Desktop ≥1200px per Constitution Section VIII
- **Commit strategy**: Commit after each logical task or group of [P] parallel tasks
- **Stop at checkpoints**: Each user story checkpoint enables independent validation and potential deployment
- **Database-first**: Phase 2 database migrations MUST execute immediately before any other work (Constitution Section IX)
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence, skipping tests

---

**Total Tasks**: 134  
**P1 [REQUIRED] Tasks**: 97 (Setup + Foundational + US1 + US2 + US3)  
**P2 [RECOMMENDED] Tasks**: 14 (US4)  
**P3 [OPTIONAL] Tasks**: 5 (US5)  
**Polish Tasks**: 18 (Phase 8)

**Estimated MVP Completion** (with 2 developers): 3-4 weeks  
**Full Feature Completion** (all P1, P2, P3): 4-5 weeks

---

**Tasks Version**: 1.0.0  
**Generated**: February 12, 2026  
**Based On**: spec.md (5 user stories), plan.md (technical context), research.md (8 decisions), data-model.md (5 stored procedures), contracts/ (OpenAPI + tState)  
**Constitution Compliance**: All tasks align with Constitution v1.1.0 requirements (TDD, layered architecture, database-as-authority, tState pattern, UI/UX standards)
