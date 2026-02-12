# Implementation Plan: Actions Management (Security Module)

**Branch**: `003-actions-management` | **Date**: February 12, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-actions-management/spec.md`

**Note**: This plan follows the SpecKit workflow. Phase 0 (Research), Phase 1 (Design & Contracts), and Phase 2 (Task Breakdown) outputs will be generated sequentially.

## Summary

This feature implements CRUD operations for managing system actions in the Security domain through a modern Material-UI interface. Administrators can view all actions in a paginated DataGrid with server-side sorting/filtering, create new actions with unique ActionCode validation, and update existing actions with optimistic concurrency control. The landing page (`/Sec/Actions`) displays all actions from the `Sec_Actions` table including full audit trail (CreatedBy, CreatedDate, ModifiedBy, ModifiedDate), with dedicated routes for creation (`/Sec/Actions/New`) and editing (`/Sec/Actions/<ActionID>`). Implementation strictly follows layered architecture with exclusive database access via 5 stored procedures (`Sec_Actions_Get`, `Sec_Actions_List`, `Sec_Actions_Insert`, `Sec_Actions_Update`, `Sec_Actions_CheckCode`), tState output pattern for error handling with application-specific error codes (50001-50015), real-time async ActionCode uniqueness validation, Material-UI X DataGrid for advanced table features, and comprehensive error handling including network failures, session expiration, and concurrent update conflicts.

## Technical Context

**Language/Version**: 
- **Frontend**: TypeScript with React 19.2.4, Vite 7.3.1
- **Backend**: C# with ASP.NET Core Web API v10 (.NET 10.0)
- **Database**: SQL Server 2025 (T-SQL)

**Primary Dependencies**: 
- **Frontend**: 
  - Material-UI (@mui/material 8.x) for UI components and 24-column grid system
  - Material-UI X DataGrid (@mui/x-data-grid 8.x) for advanced table features (server-side pagination, sorting, filtering)
  - React Router v7.13.0 for navigation and route parameters
  - Axios for HTTP client with request/response interceptors
  - emotion/styled for component styling
  - Vitest for unit testing, React Testing Library for component testing, Playwright for E2E testing
  - date-fns or dayjs for timestamp formatting
- **Backend**: 
  - Dapper 2.x for stored procedure execution with parameter mapping
  - Serilog for structured logging with correlation IDs
  - ASP.NET Core built-in middleware for CORS, error handling, authentication
  - FluentValidation for request DTO validation
- **Database**: 
  - DbUp for versioned schema migrations with idempotency checks
  - SQL Server built-in functions (GETUTCDATE, OBJECT_ID, SCOPE_IDENTITY)

**Storage**: 
- **Database**: TRANTS_EMS_DEV on SQL Server instance PRECISION7520\SQLEXPRESSADV25
- **Database Tables**:
  - `Sec_Actions` (ActionID PK IDENTITY, ActionCode VARCHAR(50) UNIQUE, ActionTitle VARCHAR(200), CreatedBy INT, CreatedDate DATETIME2, ModifiedBy INT NULL, ModifiedDate DATETIME2 NULL)
  - Indexes: PK_Sec_Actions (clustered on ActionID), UQ_Sec_Actions_ActionCode (unique on ActionCode), IX_Sec_Actions_CreatedBy, IX_Sec_Actions_CreatedDate
  - Constraints: CK_Sec_Actions_ActionCode_Format (regex validation), CK_Sec_Actions_ModifiedDate_After_Created
- **Stored Procedures**: 
  - `Sec_Actions_Get` (retrieve single action by @ActionID, outputs @tState)
  - `Sec_Actions_List` (paginated list with @PageNumber, @PageSize, @SortColumn, @SortDirection, @FilterText, outputs @tState with TotalCount in DATA field)
  - `Sec_Actions_Insert` (create new action with @ActionCode, @ActionTitle, @CreatedBy, outputs @tState with ActionID in DATA field)
  - `Sec_Actions_Update` (update action with @ActionID, @ActionCode, @ActionTitle, @ModifiedBy, @OriginalModifiedDate for optimistic concurrency, outputs @tState)
  - `Sec_Actions_CheckCode` (async uniqueness check with @ActionCode, @ExcludeActionID optional, outputs @tState with Available=True/False in DATA field)
- **No Client Storage**: All data server-side, no localStorage or sessionStorage for actions data

**Testing**: 
- **Frontend**: 
  - Vitest for unit tests (form validation logic, ActionCode format validation, character counter logic)
  - React Testing Library for component tests (ActionsList rendering, ActionForm validation, button states)
  - Playwright for E2E flows (create action workflow, update action workflow, concurrency conflict scenario, network failure recovery)
- **Backend**: 
  - xUnit for API controller tests, application service tests
  - Repository integration tests with test database (verify stored procedure calls, tState parsing)
  - Database integration tests for stored procedures using test database with rollback transactions
- **TDD Required**: Tests written before implementation per Constitution Section III (Red-Green-Refactor cycle)

**Target Platform**: 
- **Deployment**: Web application (SPA frontend + RESTful backend API)
- **Browsers**: Modern browsers supporting ES6+ (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- **Responsive**: Mobile ≥768px, Tablet ≥992px, Desktop ≥1200px breakpoints (per Constitution Section VIII)
- **No Mobile Native**: Web-only, responsive design for mobile browsers

**Project Type**: Web (frontend + backend)

**Performance Goals**: 
- **Actions List API**: <1s p95 response time for paginated query (10-100 rows per page) with server-side filtering/sorting
- **Create/Update API**: <500ms p95 response time including database insert/update and tState return
- **ActionCode Check API**: <200ms p95 for async uniqueness validation (debounced 500ms client-side)
- **Frontend Page Load**: <2s TTI on desktop for Actions list page with initial data load
- **DataGrid Interaction**: <100ms for client-side interactions (row hover, column sort toggle before API call), <1s for server-side operations (pagination, filter, sort with API call)
- **CSV Export**: <30s for exports up to 5000 rows with streaming generation on backend
- **Database Indexes**: Required on ActionCode (unique), CreatedBy, CreatedDate for query performance in Sec_Actions_List procedure

**Constraints**: 
- **Constitutional Mandates**: 
  - No Entity Framework or ORMs except Dapper (Constitution Section V)
  - All database access via stored procedures (Constitution Section V)
  - tState output parameter mandatory for all procedures (Constitution Section VI)
  - All stored procedures MUST use TRY-CATCH blocks with SET QUOTED_IDENTIFIER ON (Constitution Section VI)
  - Layered architecture strictly enforced: Controllers → Application → Infrastructure → Database (Constitution Section IV)
  - No business logic in Controllers or Infrastructure layers (Constitution Section IV)
  - TDD workflow required (tests before code) (Constitution Section III)
  - Material-UI 24-column grid, 8px spacing, WCAG AA contrast (Constitution Section VIII)
- **Deployment Configuration**:
  - Database: TRANTS_EMS_DEV on PRECISION7520\SQLEXPRESSADV25
  - SQL Server Authentication: User=sa, Password=trandts@2013
  - Backend API: http://localhost:5000
  - Frontend React: http://localhost:3000
- **Security & Authorization**: 
  - Authentication required: User must be logged in to access `/Sec/Actions` routes (enforced by backend middleware)
  - No role-based authorization for MVP (all authenticated users can CRUD actions)
  - CreatedBy/ModifiedBy populated from authenticated user's UserID in session/JWT token
  - No deletion functionality in MVP (future soft delete with IsDeleted flag)
- **Data Integrity**: 
  - ActionCode UNIQUE constraint enforced at database level
  - ActionCode format validation in stored procedure (regex: `^[A-Za-z0-9._-]+$`)
  - Optimistic concurrency control using ModifiedDate comparison in Sec_Actions_Update
  - Audit trail immutability (CreatedBy/CreatedDate never updated after insert)
- **Error Handling**: 
  - Network failures: Client-side retry with exponential backoff (1s, 2s, 4s, then fail)
  - Session expiration: Detect 401 response, display modal, redirect to login with return URL
  - Concurrent updates: Detect via tState ERR~50004, display refresh option to reload latest data
  - Duplicate ActionCode: Detect via tState ERR~50001/50002, display inline error below ActionCode field

**Scale/Scope**: 
- **Initial Release**: 10-100 actions expected in Sec_Actions table, single page load without virtualization
- **Performance Threshold**: DataGrid row virtualization not required until 100+ actions (Material-UI DataGrid handles this automatically)
- **Future Considerations**: Delete functionality with soft delete (IsDeleted flag), action categories/grouping, action-permission mappings for RBAC, bulk operations (bulk delete, bulk update), action usage analytics (track which actions referenced most)
- **Database Design**: Schema supports future extensions (no breaking changes needed for soft delete or RBAC mappings)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Evaluation (February 12, 2026)

✅ **PASS: System Architecture Immutability (Section II)**
- React 19.2.4 with Vite 7.3.1 ✓
- ASP.NET Core Web API v10 ✓
- SQL Server 2025 ✓
- Material-UI 8.x with Material-UI X DataGrid 8.x ✓
- Dapper for data access ✓
- Serilog for structured logging ✓
- Vitest/React Testing Library/Playwright/xUnit for testing ✓
- **Status**: All constitutional technology choices confirmed in Technical Context

✅ **PASS: Mandatory TDD (Section III)**
- TDD workflow specified in Testing section
- Test frameworks identified: Vitest, React Testing Library, Playwright (frontend), xUnit (backend)
- Integration tests planned for stored procedures
- React StrictMode behavior documented in Constitution Section III (useEffect double-invocation in development)
- **Status**: Red-Green-Refactor cycle will be enforced during implementation

✅ **PASS: Layered Architecture Enforcement (Section IV)**
- Architecture explicitly defined: Controllers → Application → Infrastructure → Database
- Layer responsibilities documented:
  - **Controllers**: Handle HTTP transport (ActionsController with GET/POST/PUT endpoints), validate DTOs using FluentValidation, invoke Application layer services, return standardized API responses
  - **Application**: Orchestrate CRUD use cases (ActionsService with ListActions, GetAction, CreateAction, UpdateAction, CheckActionCode methods), interpret tState from Infrastructure, control application flow, map domain models to DTOs
  - **Infrastructure**: Execute stored procedures via Dapper (ActionsRepository with methods matching services), map result sets to domain entities, surface raw tState output parameters
  - **Database**: Data integrity enforcement via constraints, transaction control in stored procedures, defensive validation (ActionCode format, uniqueness), auditing (CreatedBy/Date, ModifiedBy/Date), error signaling via tState
- Forbidden patterns acknowledged: No business logic in Controllers, no Dapper in Application, no orchestration in Infrastructure
- **Status**: Layered architecture will be strictly enforced during design and implementation

✅ **PASS: Database-as-Authority (Section V)**
- All CRUD operations via stored procedures: `Sec_Actions_Get`, `Sec_Actions_List`, `Sec_Actions_Insert`, `Sec_Actions_Update`, `Sec_Actions_CheckCode`
- Direct table access prohibited (no `SELECT * FROM Sec_Actions` in application code)
- Dapper will invoke procedures by name only with parameter objects
- Business logic placement: ActionCode format validation in stored procedure, uniqueness check in stored procedure, optimistic concurrency in stored procedure, orchestration in Application layer
- Transaction ownership: All mutating operations (INSERT, UPDATE) wrapped in transactions within stored procedures (BEGIN TRANSACTION, COMMIT, ROLLBACK on error)
- Naming conventions: `Sec_Actions` table (Domain_Entity), `Sec_Actions_<Action>` procedures (SecActions<Action> e.g., Sec_Actions_Insert)
- **Status**: Database-as-authority principle will be strictly followed

✅ **PASS: Stored Procedures as Primary Interface (Section VI)**
- tState output parameter (`@tState VARCHAR(500) OUTPUT`) mandatory for all 5 procedures
- tState format: `<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>`
- Examples: 
  - `OK~00000~Sec_Actions_Insert~ActionID=123~Action created successfully`
  - `ERR~50001~Sec_Actions_Insert~N/A~ActionCode already exists`
  - `ERR~50004~Sec_Actions_Update~N/A~This action was modified by another user. Please refresh and try again.`
- All procedures will use TRY…CATCH blocks with ERROR_NUMBER() and ERROR_MESSAGE() preserved
- Application-level error code taxonomy defined: 50001 (duplicate create), 50002 (duplicate update), 50003 (not found), 50004 (concurrency conflict), 50010-50015 (validation errors)
- Native SQL Server error numbers preserved in CATCH blocks (e.g., 8134 for divide by zero)
- SET QUOTED_IDENTIFIER ON mandatory in all procedures per Constitution Section VI (prevents metadata inconsistency in integration tests)
- Auditing: All create/update operations populate CreatedBy/CreatedDate/ModifiedBy/ModifiedDate audit fields
- DbUp mandatory for schema versioning with idempotent migrations and rollback scripts
- **Status**: tState pattern and auditing requirements will be implemented

✅ **PASS: Error Handling & Observability (Section VII)**
- Serilog specified for server-side structured logging with correlation IDs
- Client-side structured logging will be configured (console.error in development, backend logging endpoint in production)
- Correlation IDs will be generated at request entry in backend middleware and propagated through all layers
- Logging requirements: Request/response metadata, error context (tState parsing failures, validation errors), user actions (ActionCode checked, action created/updated), database operations (stored procedure calls with parameters)
- Centralized exception handling middleware planned in ASP.NET Core (catch unhandled exceptions, log with correlation ID, return standardized error response)
- **Status**: Comprehensive observability strategy will be implemented

✅ **PASS: Enterprise UI/UX Standards (Section VIII)**
- Material-UI with 24-column grid system specified (form layouts, page layout)
- 8px spacing system confirmed (16px, 24px, 32px intervals for component spacing)
- Color palette: Primary (#FFFFFF, #F8F9FA, #212529 for backgrounds), Semantic (Red #D32F2F for errors, Green #388E3C for success, Yellow #F57C00 for warnings, Blue #1976D2 for info/primary actions)
- WCAG AA contrast standards mandated (4.5:1 for normal text, 3:1 for large text)
- Responsive breakpoints: Mobile ≥768px (single column, touch-optimized), Tablet ≥992px (multi-column where appropriate), Desktop ≥1200px (optimal 600px form width)
- Form validation: Real-time inline validation on blur with 300ms debounce for async checks, success checkmarks, error messages below fields
- System feedback: Loading indicators for all async actions (button spinner, DataGrid LinearProgress), Snackbar notifications for success/error, Alert component for form-level errors
- Animation constraints: ≤300ms transitions (200ms field validation, 300ms dialog modal), ease-out/ease-in-out only, respect prefers-reduced-motion
- Keyboard navigation: All elements accessible via Tab, Enter/Space activates, Arrow keys navigate DataGrid, focus indicators clearly visible
- Screen reader support: ARIA labels, aria-describedby for errors, aria-invalid for error states, aria-live regions for loading states
- **Status**: All UI/UX requirements from specification align with constitutional standards

✅ **PASS: Database Migration Execution Strategy (Section IX)**
- Migration workflow documented in data-model.md: Create script → Execute immediately → Verify → Test → Proceed
- Idempotent migrations using IF NOT EXISTS checks for tables, indexes, stored procedures
- Forward migration: `001-create-sec-actions-table.sql` (creates table, indexes, constraints)
- Rollback migration: `001-drop-sec-actions-table.sql` (drops procedures first, then table)
- Verification queries included: Check table exists, verify column definitions, check stored procedure metadata (uses_quoted_identifier = 1)
- **Status**: Immediate execution workflow will be followed during implementation

✅ **PASS: Complete Task Specifications (Section X)**
- User stories specify full integration: Create form → API endpoint → Service → Repository → Stored Procedure → Database → Response → UI feedback
- Acceptance scenarios cover end-to-end workflows: "Click Create button → Navigate to form → Fill fields → Submit → Verify in list"
- Task completion checklist applied: Component created, registered (DI/routes), integrated (API calls), tested (unit+integration+E2E), verified (manual smoke test)
- **Status**: Task specifications will include full integration requirements, not just component creation

✅ **PASS: End-to-End Cookie Testing Strategy (Section XI)**
- **DEFERRED**: This feature does not involve authentication cookies (assumes existing session from 001-user-login-logout)
- Dual authentication mechanism (httpOnly cookie + Bearer token fallback) already implemented in 001-user-login-logout
- Actions Management E2E tests will use existing authenticated session context from Playwright fixtures
- **Status**: No additional cookie testing strategy required for this feature

✅ **PASS: Test Execution Order & Dependencies (Section XII)**
- Test pyramid execution order documented:
  1. **Unit Tests First**: Frontend form validation logic, ActionCode format regex, character counter logic (Vitest), Backend service logic mocking repository (xUnit)
  2. **Integration Tests Second**: API endpoints + stored procedures (xUnit with test database), ActionsRepository calling real stored procedures with tState parsing
  3. **E2E Tests Last**: Full workflows (Playwright) - Create action, Update action, Concurrency conflict, Network failure recovery
- When to run: Unit tests per feature iteration, Integration tests per user story completion, E2E tests per phase completion
- **Status**: Clear execution order documented and will be followed

✅ **PASS: Continuous Quality Gates (Section XIII)**
- Mini-Phase 6 checklist will be applied after each user story completion:
  - **Security**: Authentication middleware enforces login requirement, ActionCode SQL injection prevented by parameterized stored procedures
  - **Error Handling**: All error paths return proper tState, UI displays user-friendly messages, network failures handled with retry
  - **Logging**: Structured logs include correlation IDs, user actions logged (action created/updated), no console-only logging in production
  - **Testing**: All tests passing (unit + integration + E2E for completed features)
  - **Code Quality**: No TODO comments in committed code, no commented code blocks, consistent formatting (Prettier for frontend, EditorConfig for backend)
  - **Documentation**: API endpoints documented in OpenAPI spec, error codes defined in tstate-contracts.md
- Phase 6 comprehensive audit deferred to end of feature (performance benchmarks, accessibility compliance WCAG AA, UI/UX consistency)
- **Status**: Continuous quality gates will be enforced throughout implementation

✅ **PASS: Explicit File Path Requirements (Section XIV)**
- Routes specified with absolute paths: `/Sec/Actions`, `/Sec/Actions/New`, `/Sec/Actions/<ActionID>`
- Component structure documented in Project Structure section:
  - Frontend: `frontend/src/pages/Security/Actions/ActionsListPage.tsx`, `frontend/src/pages/Security/Actions/ActionFormPage.tsx`
  - Backend: `backend/src/WebApi/Controllers/ActionsController.cs`, `backend/src/WebApi/Application/Services/ActionsService.cs`, `backend/src/WebApi/Infrastructure/Data/ActionsRepository.cs`
  - Database: `backend/database/migrations/001-create-sec-actions-table.sql`
- **Status**: All file paths will use absolute paths from repository root in task specifications

✅ **PASS: Dependency Injection Registration Tracking (Section XV)**
- DI registration planned for .NET backend:
  - `IActionsService` / `ActionsService` registered in `backend/src/WebApi/Program.cs`: `builder.Services.AddScoped<IActionsService, ActionsService>()`
  - `IActionsRepository` / `ActionsRepository` registered in `backend/src/WebApi/Program.cs`: `builder.Services.AddScoped<IActionsRepository, ActionsRepository>()`
- Verification: Integration tests will verify DI resolution (constructor injection successful, service methods callable)
- **Status**: DI registration will be included in task specifications and verified

✅ **PASS: Task Priority Taxonomy (Section XVI)**
- User stories tagged with Priority (P1, P2, P3) in spec.md
- Mapping for production deployment:
  - **P1 = [REQUIRED]**: User Stories 1-3 (View Actions List, Create New Action, Update Existing Action) - Blocking for MVP
  - **P2 = [RECOMMENDED]**: User Story 4 (Actions Table Interaction & Navigation - sorting, filtering, pagination, export)
  - **P3 = [OPTIONAL]**: User Story 5 (Actions Search & Quick Access - global search)
- Tasks in tasks.md will use [REQUIRED]/[RECOMMENDED]/[OPTIONAL] tags explicitly
- **Status**: Priority taxonomy will be applied in Phase 2 task breakdown

✅ **PASS: Playwright Browser Configuration (Section XVII)**
- **DEFERRED**: Playwright configuration already established in 001-user-login-logout and 002-modern-ui-redesign features
- Browser support: Chromium primary, Firefox/Safari optional for MVP
- No browser-specific limitations for Actions Management feature (standard form inputs and DataGrid)
- **Status**: Standard Chromium testing sufficient, no additional browser configuration needed

### Gate Status: **✅ APPROVED FOR PHASE 0 RESEARCH**

**No constitutional violations identified.** All architectural, technology, and design constraints are aligned with Constitution v1.1.0. Proceed to Phase 0 research to resolve implementation details (Material-UI DataGrid server-side patterns, CSV export streaming, optimistic concurrency implementation, async validation debouncing).

## Project Structure

### Documentation (this feature)

```text
specs/003-actions-management/
├── spec.md              # Feature specification (COMPLETE)
├── data-model.md        # Database schema & stored procedures (COMPLETE)
├── quickstart.md        # User guide & getting started (COMPLETE)
├── plan.md              # This file (IN PROGRESS - Phase 0/1 pending)
├── research.md          # Phase 0 output (PENDING)
├── contracts/           # Phase 1 output (PENDING)
│   ├── actions-api.openapi.yaml        # OpenAPI spec for Actions API
│   └── tstate-contracts.md             # tState parsing and error code reference
└── tasks.md             # Phase 2 output - NOT created by /speckit.plan (PENDING)
```

### Source Code (repository root)

```text
# Web Application Structure (frontend + backend)

backend/
├── database/
│   ├── migrations/
│   │   ├── 001-create-sec-actions-table.sql          # Forward migration (table + indexes)
│   │   ├── 001-drop-sec-actions-table.sql            # Rollback migration
│   │   ├── 002-create-sec-actions-procedures.sql     # Forward migration (5 stored procedures)
│   │   └── 002-drop-sec-actions-procedures.sql       # Rollback migration
│   └── scripts/
│       └── seed-sample-actions.sql                   # Optional seed data for development
├── src/
│   ├── WebApi/
│   │   ├── Controllers/
│   │   │   └── ActionsController.cs                  # HTTP endpoints (GET /api/actions, POST, PUT)
│   │   ├── Application/
│   │   │   ├── Interfaces/
│   │   │   │   └── IActionsService.cs                # Service contract
│   │   │   ├── Services/
│   │   │   │   └── ActionsService.cs                 # Business orchestration, tState interpretation
│   │   │   ├── DTOs/
│   │   │   │   ├── ActionDto.cs                      # API response model
│   │   │   │   ├── CreateActionRequest.cs            # POST request model
│   │   │   │   ├── UpdateActionRequest.cs            # PUT request model
│   │   │   │   ├── ActionListRequest.cs              # Query parameters for pagination/filtering
│   │   │   │   └── ActionListResponse.cs             # Paginated response with TotalCount
│   │   │   └── Validators/
│   │   │       ├── CreateActionRequestValidator.cs   # FluentValidation rules
│   │   │       └── UpdateActionRequestValidator.cs   # FluentValidation rules
│   │   ├── Infrastructure/
│   │   │   ├── Data/
│   │   │   │   ├── IActionsRepository.cs             # Repository contract
│   │   │   │   └── ActionsRepository.cs              # Dapper stored procedure execution
│   │   │   └── Models/
│   │   │       └── Action.cs                         # Domain entity (internal model)
│   │   └── Program.cs                                # DI registration (services, repositories)
│   └── Database/
│       └── [Existing database project files]
└── tests/
    └── WebApi.Tests/
        ├── Controllers/
        │   └── ActionsControllerTests.cs             # Unit tests with mocked service
        ├── Application/
        │   └── ActionsServiceTests.cs                # Unit tests with mocked repository
        ├── Infrastructure/
        │   └── ActionsRepositoryTests.cs             # Integration tests with test database
        └── Integration/
            └── ActionsApiIntegrationTests.cs         # End-to-end API tests

frontend/
├── src/
│   ├── pages/
│   │   └── Security/
│   │       └── Actions/
│   │           ├── ActionsListPage.tsx               # /Sec/Actions route component (DataGrid)
│   │           ├── ActionFormPage.tsx                # /Sec/Actions/New & /Sec/Actions/:id route component
│   │           └── components/
│   │               ├── ActionsDataGrid.tsx           # Material-UI DataGrid with server-side features
│   │               ├── ActionForm.tsx                # Reusable form component (Create/Update)
│   │               ├── ActionCodeField.tsx           # ActionCode input with async validation
│   │               └── ExportButton.tsx              # CSV export functionality
│   ├── services/
│   │   └── actionsService.ts                         # API client for Actions endpoints (Axios)
│   ├── hooks/
│   │   ├── useActions.ts                             # Custom hook for list operations
│   │   ├── useActionForm.ts                          # Custom hook for form state management
│   │   └── useActionCodeValidation.ts                # Custom hook for async uniqueness check
│   ├── types/
│   │   └── action.ts                                 # TypeScript interfaces (Action, CreateActionRequest, etc.)
│   ├── utils/
│   │   ├── tStateParser.ts                           # Parse tState from API responses
│   │   └── csvExport.ts                              # CSV generation utility
│   └── contracts/
│       └── actions-api.types.ts                      # TypeScript types generated from OpenAPI spec
└── tests/
    ├── unit/
    │   ├── services/
    │   │   └── actionsService.test.ts                # Unit tests for API client
    │   ├── hooks/
    │   │   ├── useActions.test.ts                    # Hook tests
    │   │   └── useActionCodeValidation.test.ts       # Async validation hook tests
    │   └── utils/
    │       ├── tStateParser.test.ts                  # tState parsing logic tests
    │       └── csvExport.test.ts                     # CSV generation tests
    ├── components/
    │   └── Security/
    │       └── Actions/
    │           ├── ActionsListPage.test.tsx          # Component render tests
    │           ├── ActionFormPage.test.tsx           # Form validation tests
    │           └── ActionsDataGrid.test.tsx          # DataGrid interaction tests
    └── e2e/
        └── actions/
            ├── create-action.spec.ts                 # E2E: Create workflow
            ├── update-action.spec.ts                 # E2E: Update workflow
            ├── concurrency-conflict.spec.ts          # E2E: Concurrent update detection
            └── network-failure.spec.ts               # E2E: Network error recovery
```

**Structure Decision**: This feature follows the established web application structure (frontend + backend) with clear separation between presentation (React components), business logic (services), and data access (repositories/stored procedures). The structure aligns with layered architecture requirements from Constitution Section IV, with Controllers → Application → Infrastructure → Database dependency flow. All file paths are absolute from repository root per Constitution Section XIV.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No constitutional violations identified.** This section intentionally left blank as all architectural decisions align with Constitution v1.1.0 requirements.

---

## Phase 0: Research & Technology Decisions

**Status**: ✅ COMPLETE - February 12, 2026

**Artifact**: [research.md](./research.md) (37,186 tokens)

**Research Topics Resolved** (8 total):

1. **Material-UI X DataGrid Server-Side Pagination**: 
   - **Decision**: Use `@mui/x-data-grid` with `paginationMode="server"` and `sortingMode="server"`
   - **Rationale**: Community edition sufficient, prevents loading entire dataset, built-in UI controls
   - **API Contract**: `GET /api/actions?page=1&pageSize=10&sortColumn=actionCode&sortDirection=asc&filterText=USER`
   - **Response**: `{ data: Action[], totalCount: number, page: number, pageSize: number }`

2. **CSV Export Streaming Implementation**:
   - **Decision**: Backend streaming with `CsvHelper` NuGet package, `text/csv` Content-Type, chunked transfer encoding
   - **Rationale**: Prevents memory exhaustion for 5000 rows, streaming provides better performance
   - **Frontend**: Axios `responseType: 'blob'`, blob URL download, 60s timeout

3. **Optimistic Concurrency Control**:
   - **Decision**: ModifiedDate timestamp comparison in `Sec_Actions_Update` stored procedure
   - **Rationale**: Simpler than ROWVERSION, sufficient for human-speed updates, ModifiedDate already exists for audit
   - **Conflict Handling**: tState `ERR~50004`, frontend displays refresh dialog

4. **Async ActionCode Validation with Debouncing**:
   - **Decision**: React custom hook with `useEffect` debouncing (500ms) + AbortController for cancellation
   - **Rationale**: Reduces API load, prevents race conditions, provides real-time feedback
   - **API**: `GET /api/actions/check-code?code=USER_CREATE&excludeActionId=123`

5. **Error Code Taxonomy & HTTP Status Mapping**:
   - **Decision**: Application-specific codes 50001-50015 in tState, map to HTTP status in backend
   - **Mapping**: 50001/50002/50004 → 409 Conflict, 50003 → 404 Not Found, 50010-50015 → 400 Bad Request, SQL errors → 500 Internal Server Error
   - **User Messages**: Frontend `getErrorMessage(errorCode)` provides friendly text

6. **Character Counter Implementation**:
   - **Decision**: Material-UI TextField `helperText` prop with live character count on every `onChange`
   - **Rationale**: Built-in component, consistent styling, visual warning (red color) at 95% limit
   - **Format**: `"X/50"` for ActionCode, `"X/200"` for ActionTitle

7. **Snackbar Notification Management**:
   - **Decision**: Material-UI Snackbar with `notistack` library for queue management
   - **Configuration**: Success messages auto-dismiss 3s (bottom-center), Error messages persistent (top-center, manual dismiss), max 3 stacked
   - **Rationale**: Queue prevents overlap, persistent errors ensure user awareness

8. **DataGrid Column Configuration & Responsive Behavior**:
   - **Decision**: Fixed widths for narrow columns, `flex: 1` for ActionTitle, hide audit columns on tablet/mobile
   - **Responsive**: Mobile horizontal scroll with pinned ActionCode (left) + Actions (right) columns
   - **Breakpoints**: Desktop ≥1200px (all columns), Tablet 992-1199px (hide audit), Mobile <992px (hide ActionID + audit)

**Key Patterns Documented**:
- Server-side pagination request/response contracts
- Backend CSV streaming with batch processing (100 rows/batch)
- Frontend blob download with timestamp filename
- React debouncing hook with AbortController cancellation
- Exception hierarchy mapping tState error codes to custom exceptions
- Material-UI responsive grid with `useMediaQuery` hooks
- Snackbar queue configuration with variant-specific behavior

**All research decisions align with Constitution v1.1.0 requirements and technical constraints.**

---

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETE - February 12, 2026

**Artifacts Generated**:

### 1. OpenAPI Specification: contracts/actions-api.openapi.yaml (3,586 tokens)

**Endpoints Defined** (5 total):
- `GET /api/actions` - List actions with server-side pagination, sorting, filtering
  - Query params: `page` (1-based), `pageSize` (10/25/50/100), `sortColumn`, `sortDirection`, `filterText`
  - Response: `{ data: Action[], totalCount: number, page: number, pageSize: number }`
  - Status: 200 OK, 400 Bad Request, 500 Internal Server Error

- `POST /api/actions` - Create new action
  - Request: `{ actionCode: string, actionTitle: string, createdBy: number }`
  - Response: `{ data: Action, message: "Action created successfully" }`
  - Status: 201 Created, 400 Bad Request, 409 Conflict, 500 Internal Server Error

- `GET /api/actions/{id}` - Get single action by ID
  - Path param: `id` (integer, minimum 1)
  - Response: `{ data: Action }`
  - Status: 200 OK, 400 Bad Request, 404 Not Found, 500 Internal Server Error

- `PUT /api/actions/{id}` - Update existing action
  - Path param: `id` (integer, minimum 1)
  - Request: `{ actionCode: string, actionTitle: string, modifiedBy: number, originalModifiedDate: string (ISO 8601) }`
  - Response: `{ data: Action, message: "Action updated successfully" }`
  - Status: 200 OK, 400 Bad Request, 404 Not Found, 409 Conflict, 500 Internal Server Error

- `GET /api/actions/check-code` - Check ActionCode availability (async validation)
  - Query params: `code` (string, 1-50 chars), `excludeActionId` (optional integer)
  - Response: `{ available: boolean }`
  - Status: 200 OK, 400 Bad Request, 500 Internal Server Error

- `GET /api/actions/export` - Export actions to CSV with optional sorting/filtering
  - Query params: `sortColumn`, `sortDirection`, `filterText`
  - Response: CSV file (binary) with Content-Disposition header
  - Status: 200 OK, 400 Bad Request, 500 Internal Server Error

**Schemas Defined**:
- `Action` - Complete entity (actionId, actionCode, actionTitle, createdBy, createdDate, modifiedBy, modifiedDate)
- `CreateActionRequest` - Creation payload (actionCode, actionTitle, createdBy)
- `UpdateActionRequest` - Update payload (actionCode, actionTitle, modifiedBy, originalModifiedDate)
- `ErrorResponse` - Standardized error (error message, errorCode)

**Error Response Examples**:
- Validation errors: `{ error: "ActionCode is required.", errorCode: "50011" }`
- Duplicate codes: `{ error: "Action code already exists. Please use a unique code.", errorCode: "50001" }`
- Concurrency conflicts: `{ error: "This action was modified by another user. Please refresh and try again.", errorCode: "50004" }`
- Not found: `{ error: "Action not found.", errorCode: "50003" }`

**Validation Rules**:
- ActionCode: pattern `^[a-zA-Z0-9_.-]+$`, maxLength 50
- ActionTitle: maxLength 200
- All required fields enforced in schema

### 2. tState Contracts Reference: contracts/tstate-contracts.md (4,588 tokens)

**Format Specification**: `STATUS~ERRORCODE~PROCEDURE_NAME~DATA~MESSAGE`
- **STATUS**: `OK` (success) or `ERR` (error)
- **ERRORCODE**: `00000` (success), `50001-50015` (application errors), SQL error codes (database errors)
- **PROCEDURE_NAME**: Stored procedure name (e.g., `Sec_Actions_Insert`)
- **DATA**: Key-value pairs (e.g., `ActionID=123,TotalCount=150`)
- **MESSAGE**: Human-readable description

**Error Code Taxonomy** (15 application codes):
| Code | Category | Description | HTTP Status | User Message |
|------|----------|-------------|-------------|--------------|
| 00000 | Success | Operation completed | 200/201 OK | (Varies by action) |
| 50001 | Validation | Duplicate ActionCode (create) | 409 Conflict | Action code already exists. Please use a unique code. |
| 50002 | Validation | Duplicate ActionCode (update) | 409 Conflict | Action code already exists for another action. Please use a unique code. |
| 50003 | Not Found | Action not found | 404 Not Found | Action not found. |
| 50004 | Concurrency | Modified by another user | 409 Conflict | This action was modified by another user. Please refresh and try again. |
| 50010 | Validation | Invalid ActionID | 400 Bad Request | Invalid action ID. |
| 50011 | Validation | ActionCode required | 400 Bad Request | ActionCode is required. |
| 50012 | Validation | ActionTitle required | 400 Bad Request | ActionTitle is required. |
| 50013 | Validation | Invalid CreatedBy | 400 Bad Request | Invalid user ID for CreatedBy. |
| 50014 | Validation | Invalid ActionCode format | 400 Bad Request | ActionCode can only contain letters, numbers, underscores, hyphens, and periods. |
| 50015 | Validation | Invalid ModifiedBy | 400 Bad Request | Invalid user ID for ModifiedBy. |

**HTTP Status Mapping Rules**:
1. Success (00000): GET/PUT/DELETE → 200 OK, POST → 201 Created
2. Validation (50010-50015): 400 Bad Request
3. Not Found (50003): 404 Not Found
4. Conflict (50001, 50002, 50004): 409 Conflict
5. SQL Errors: 500 Internal Server Error (generic message)

**Backend Parsing Strategy**:
- C# `ParseTState(string)` method: Split by `~`, return tuple `(Status, ErrorCode, Procedure, Data, Message)`
- Exception mapping: Error codes → custom exceptions (`ConflictException`, `ValidationException`, `DatabaseException`)
- Controller exception handling: Map exceptions to HTTP status codes + JSON error responses

**Frontend Parsing Strategy**:
- TypeScript `getErrorMessage(errorCode: string)` function: Map error codes to user-friendly messages
- React error handling: `handleApiError(error)` extracts `errorCode` from response, displays via Snackbar
- Special handling: 50004 concurrency conflict → show refresh dialog instead of generic error

**Stored Procedure tState Examples**:
```sql
-- Success (Create)
OK~00000~Sec_Actions_Insert~ActionID=123~Action created successfully

-- Success (List with pagination)
OK~00000~Sec_Actions_List~TotalCount=150,Page=1,PageSize=10~Actions retrieved successfully

-- Error (Duplicate ActionCode)
ERR~50001~Sec_Actions_Insert~N/A~ActionCode already exists

-- Error (Concurrency Conflict)
ERR~50004~Sec_Actions_Update~N/A~This action was modified by another user. Please refresh and try again.
```

**Testing Strategies**:
- Backend: xUnit tests mocking tState output, verify exception mapping
- Frontend: Vitest tests for `getErrorMessage()`, `handleApiError()` with mock Axios errors
- Integration: E2E tests verifying error code flow (database → API → UI)

**Logging & Observability**:
- Backend: Structured logging with Serilog capturing `(Status, ErrorCode, Procedure, Data, Message)` tuple
- Frontend: Error tracking (Sentry optional) with errorCode tags

**Constitution Compliance**:
- Section V: Database-as-authority (stored procedures return tState)
- Section VI: Application error codes (50001-50015) provide granular error taxonomy
- Section VIII: User-friendly messages improve UX, technical details logged for debugging
- Section XIII: Structured logging enables traceability

---

**Both Phase 1 artifacts complete with comprehensive documentation of API contracts, error handling taxonomy, and implementation patterns.**

---

## Post-Phase 1 Constitution Re-check

**Status**: ✅ COMPLETE - February 12, 2026

### All Phase 1 Artifacts Generated:
- ✅ `research.md`: Technology decisions documented (37,186 tokens, 8 research topics resolved)
- ✅ `contracts/actions-api.openapi.yaml`: OpenAPI 3.0 spec complete (3,586 tokens, 5 endpoints + schemas)
- ✅ `contracts/tstate-contracts.md`: tState parsing reference complete (4,588 tokens, 15 error codes + mappings)

### Constitutional Compliance Re-check:

✅ **System Architecture Immutability (Section II)**: 
- No technology deviations from approved stack
- React 19.2.4, ASP.NET Core v10, SQL Server 2025, Material-UI 8.x, Dapper 2.x confirmed in research.md

✅ **Layered Architecture (Section IV)**: 
- Project structure matches design: Controllers → Application (ActionsService) → Infrastructure (ActionsRepository) → Database (stored procedures)
- All component paths use absolute repository paths

✅ **Database-as-Authority (Section V)**: 
- All 5 stored procedures defined with complete DDL in data-model.md
- No direct table access in application code
- Dapper invokes procedures by name only

✅ **tState Pattern (Section VI)**: 
- All procedures return standardized `STATUS~ERRORCODE~PROCEDURE_NAME~DATA~MESSAGE` format
- 15 application error codes (50001-50015) defined in tstate-contracts.md
- Backend parsing strategy documented with exception mapping

✅ **Error Handling (Section VII)**: 
- Error code taxonomy complete (50001-50015 application codes + SQL Server native codes)
- HTTP status mapping rules documented (400/404/409/500)
- User-friendly messages defined for all error codes

✅ **UI/UX Standards (Section VIII)**: 
- Component structure aligns with Material-UI patterns (DataGrid with server-side features, TextField with helperText, Snackbar with notistack)
- Responsive breakpoints documented (Desktop ≥1200px, Tablet 992-1199px, Mobile <992px)
- WCAG AA contrast requirements referenced in research.md

✅ **Database Migration Execution (Section IX)**:
- Migration workflow documented in data-model.md with idempotent scripts
- Verification queries included (table exists, column definitions, stored procedure metadata)

✅ **Complete Task Specifications (Section X)**:
- OpenAPI spec provides complete API contract for full integration (component → API → service → repository → stored procedure)
- tState contracts document end-to-end error flow (database → application → client)

✅ **Test Execution Order (Section XII)**:
- Testing strategy documented in research.md (Unit → Integration → E2E)
- Backend xUnit tests for tState parsing, frontend Vitest tests for error handling

✅ **Continuous Quality Gates (Section XIII)**:
- Logging strategy documented (structured logging with Serilog capturing tState components)
- Error tracking patterns defined (Sentry optional for production)

✅ **Explicit File Path Requirements (Section XIV)**:
- All project structure paths are absolute from repository root
- Component locations documented in plan.md Project Structure section

✅ **Dependency Injection Registration (Section XV)**:
- DI registration planned in plan.md (IActionsService/ActionsService, IActionsRepository/ActionsRepository)
- Registration location: `backend/src/WebApi/Program.cs`

✅ **Task Priority Taxonomy (Section XVI)**:
- User story priorities mapped in spec.md (P1=REQUIRED, P2=RECOMMENDED, P3=OPTIONAL)
- Tasks.md will use [REQUIRED]/[RECOMMENDED]/[OPTIONAL] tags

### Gate Status: **✅ APPROVED FOR PHASE 2 TASK BREAKDOWN**

**No constitutional violations introduced during design phase.** All research decisions and API contracts align with Constitution v1.1.0 requirements. Architecture remains strictly layered, database-as-authority principle maintained, tState pattern consistently applied, error handling taxonomy complete, UI/UX standards followed.

**Next Step**: Execute `/speckit.tasks` command to generate `specs/003-actions-management/tasks.md` with sequential task numbering, priority tags, and full integration specifications.

---

## Phase 2: Task Breakdown

*Task decomposition performed by `/speckit.tasks` command - NOT part of `/speckit.plan` output.*

**Status**: PENDING - Execute `/speckit.tasks` after Phase 1 completion

**Reference**: Tasks will be generated in `specs/003-actions-management/tasks.md` following the task template with:
- Sequential task numbering (T001, T002, etc.)
- [P] parallel execution tags where applicable
- [REQUIRED]/[RECOMMENDED]/[OPTIONAL] priority tags per Constitution Section XVI
- Full integration specifications per Constitution Section X
- Absolute file paths per Constitution Section XIV
- DI registration steps per Constitution Section XV

---

## Implementation Phases Summary

| Phase | Status | Deliverable | Command |
|-------|--------|-------------|---------|
| Phase 0 | ✅ COMPLETE | research.md (37,186 tokens) | Subagent research |
| Phase 1 | ✅ COMPLETE | contracts/ (8,174 tokens) | Subagent design |
| Phase 2 | ⏳ READY | tasks.md | `/speckit.tasks` |
| Phase 3+ | PENDING | Implementation, testing, deployment | Manual execution |

**Phase 0 Summary**: Resolved 8 research topics covering Material-UI DataGrid server-side patterns, CSV export streaming, optimistic concurrency control, async validation debouncing, error code mapping, character counter implementation, snackbar notification management, and responsive DataGrid column configuration.

**Phase 1 Summary**: Generated OpenAPI 3.0 specification (5 endpoints, complete schemas, error responses) and tState contracts reference (15 error codes, HTTP status mapping, backend/frontend parsing strategies).

**Phase 2 Ready**: All design artifacts complete, Constitution re-check passed. Ready to execute `/speckit.tasks` for task decomposition.

**Next Step**: Execute `/speckit.tasks` command to generate `specs/003-actions-management/tasks.md` with:
- Sequential task numbering (T001, T002, etc.)
- [P] parallel execution tags where applicable
- [REQUIRED]/[RECOMMENDED]/[OPTIONAL] priority tags per Constitution Section XVI
- Full integration specifications per Constitution Section X (component → API → service → repository → stored procedure → database → response → UI)
- Absolute file paths per Constitution Section XIV
- DI registration steps per Constitution Section XV
- Database migration execution steps per Constitution Section IX

---

**Plan Version**: 1.0.0  
**Created**: February 12, 2026  
**Constitution Version**: 1.1.0  
**Author**: AI Agent (GitHub Copilot)
