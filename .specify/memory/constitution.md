<!--
Sync Impact Report - Version 1.1.0
===================================
Version Change: 1.0.0 → 1.1.0
Rationale: MINOR version increment - Added Development Process & Quality Standards 
section (9 new principles IX-XVII) based on Phase 6 lessons learned from 
001-user-login-logout feature implementation.

Modified Principles:
- UPDATED: Section III (Mandatory Test-Driven Development)
  - Added React StrictMode double-invocation behavior documentation
  - Added development strategy guidance for useEffect cleanup patterns
  - Reference: https://react.dev/reference/react/StrictMode
  
- UPDATED: Section VI (Stored Procedures as Primary Interface)
  - Added SQL Server Metadata Requirements (QUOTED_IDENTIFIER mandatory)
  - Added Standard Stored Procedure Template with SET QUOTED_IDENTIFIER ON
  - Added verification query for metadata consistency
  - Rationale: Prevents integration test failures due to metadata inconsistency

Added Sections (NEW):
- Section IX: Database Migration Execution Strategy (CRITICAL)
- Section X: Complete Task Specifications (CRITICAL)
- Section XI: End-to-End Cookie Testing Strategy (HIGH PRIORITY)
- Section XII: Test Execution Order & Dependencies (HIGH PRIORITY)
- Section XIII: Continuous Quality Gates (MEDIUM PRIORITY)
- Section XIV: Explicit File Path Requirements (MEDIUM PRIORITY)
- Section XV: Dependency Injection Registration Tracking (MEDIUM PRIORITY)
- Section XVI: Task Priority Taxonomy (LOW PRIORITY)
- Section XVII: Playwright Browser Configuration (LOW PRIORITY)

Removed Sections: None

Templates Alignment:
✅ plan-template.md - Validated (Constitution Check section aligns with all 17 principles)
✅ spec-template.md - Validated (Requirements structure supports complete task specs per Section X)
✅ tasks-template.md - Validated (Task format supports [P] parallel tags, matches new taxonomy)
⚠️  tasks-template.md - RECOMMENDED: Add [REQUIRED]/[RECOMMENDED]/[OPTIONAL] tags (Section XVI)
⚠️  plan-template.md - RECOMMENDED: Add mini-Phase 6 checklist reference (Section XIII)

Follow-up TODOs:
1. [OPTIONAL] Update tasks-template.md format from `- [ ] T001 [P] Description` 
   to `- [ ] T001 [P] [REQUIRED] Description` to support priority taxonomy (Section XVI)
2. [OPTIONAL] Add "Mini-Phase 6 Checklist" section to plan-template.md under 
   "Constitution Check" to enforce continuous quality gates (Section XIII)
3. [RECOMMENDED] Document Playwright cookie workaround in E2E testing setup guide

Estimated Time Savings (per future project):
- Database migration execution strategy (IX): 2-3 hours
- Complete task specifications (X): 3-4 hours  
- E2E cookie testing strategy (XI): 2-3 hours
- Test execution order clarity (XII): 1-2 hours
- Continuous quality gates (XIII): 2-3 hours
- Explicit file paths (XIV): 0.5 hours
- DI registration tracking (XV): 1 hour
- Task priority taxonomy (XVI): 0.5 hours
- Playwright browser config (XVII): 0.5 hours
**Total ROI: 13-19 hours saved per project vs. 3-4 hours documentation investment**

Version Validation:
- ✅ No placeholder tokens remaining (all [BRACKETS] resolved)
- ✅ Version incremented correctly (1.0.0 → 1.1.0 MINOR)
- ✅ Dates in ISO format (YYYY-MM-DD)
- ✅ Principles declarative and testable (MUST/MAY/SHOULD rationale provided)
- ✅ No vague language ("should" replaced with explicit requirements)
-->

# TRANDTS Enterprise Management System Constitution

**CLIENT**: TRANDTS  
**APPLICATION**: Enterprise Management System  
**HOSTING TARGET**: IIS 10.0  
**AUTHORITY LEVEL**: HIGHEST – NON-NEGOTIABLE

## Core Principles

### I. Constitutional Authority & Compliance (NON-NEGOTIABLE)

This constitution defines absolute, binding, and non-negotiable rules governing all AI-assisted activities related to the design, development, refactoring, documentation, and validation of the Enterprise Management System.

**Rules**:
- Any AI agent, automation, generator, refactor, advisor, or recommendation engine operating on this project MUST strictly comply with this constitution
- If ambiguity exists at any stage, the AI is REQUIRED to stop and request explicit clarification before proceeding
- This obligation is especially critical for database schema, persistence rules, transactional behavior, error handling, and data integrity
- Assumptions of any kind are strictly prohibited
- Violations require explicit instruction and written authorization

**Rationale**: Enterprise systems require deterministic, predictable behavior. AI agents must operate within explicit constraints to prevent data corruption, architectural drift, and production failures.

### II. System Architecture Immutability (LOCKED)

The technology stack is immutable and locked. No substitutions, parallel stacks, alternative frameworks, or experimental technologies may be introduced without explicit written authorization.

**Locked Stack**:
- **Client**: React 19.2.4 with Vite 7.3.1 (Single Page Application)
- **Server**: ASP.NET Core Web API (Version 10, latest stable)
- **Database**: SQL Server 2025 (existing development environment)
- **Routing**: React Router 7.13.0
- **UI Framework**: Material-UI (@mui/material, @emotion/react, @emotion/styled, @mui/icons-material, @mui/x-data-grid 8.x, @mui/x-tree-view 8.x)
- **Data Access**: Dapper (Stored Procedures primary, parameterized SQL read-only secondary with approval)
- **Server Logging**: Serilog (structured, configurable, centralized)
- **Server Testing**: xUnit or NUnit
- **Client Testing**: Vitest, Jest, React Testing Library, Playwright
- **Database Migrations**: DbUp (idempotent, versioned, with rollback scripts)

**Explicitly Forbidden**:
- Entity Framework (any variant)
- ORM auto-tracking
- MVC Views, Razor Pages, Blazor rendering
- Direct table access (all CRUD via stored procedures)

**Rationale**: Stack stability ensures predictable behavior, maintainability, and eliminates technology churn. The database is the enforcing authority for data integrity.

### III. Mandatory Test-Driven Development (NON-NEGOTIABLE)

Test-Driven Development (TDD) is mandatory for all production code. No production code may exist without corresponding tests.

**Rules**:
- Tests must be written first, reviewed, approved, and confirmed to fail before implementation
- Red-Green-Refactor cycle is strictly enforced
- Coverage must include components, hooks, routing, state transitions (client), and business logic, APIs, database interactions (server)
- No database-dependent logic may exist without test coverage
- Snapshot testing permitted only when it provides real value

**Client Testing Requirements**:
- Vitest, Jest, React Testing Library for unit and component tests
- Playwright for end-to-end testing
- React 18+ StrictMode behavior: useEffect and component lifecycle hooks intentionally double-invoke in development only
- Expected behavior: API calls may fire twice during development debugging, console logs appear doubled
- Production: StrictMode disabled automatically, no double-invocation occurs
- Development strategy: Keep StrictMode enabled (catches bugs early), use cleanup functions in useEffect, implement idempotency for side effects
- Reference: https://react.dev/reference/react/StrictMode

**Server Testing Requirements**:
- xUnit or NUnit for business logic and API tests
- Integration tests required for APIs and database interactions

**Rationale**: TDD prevents regressions, enforces design clarity, and ensures testability. Untested code is untrusted code.

### IV. Layered Architecture Enforcement (CRITICAL)

The system MUST follow a strictly layered architecture with explicit responsibilities and unidirectional dependency flow.

**Layers**:
1. **Controllers**: Handle HTTP transport, validate requests, invoke Application layer, return standardized API responses
2. **Application**: Orchestrate use cases, enforce application rules, coordinate infrastructure calls, interpret database tState, control application flow
3. **Infrastructure**: Execute stored procedures, map result sets, surface raw tState, implement application-defined interfaces
4. **Database**: Data integrity enforcement, transaction control, defensive validation, auditing, error signaling via tState

**Dependency Direction (Critical)**:
```
Controllers → Application → Infrastructure → Database
```

**Reverse dependencies are forbidden. No layer may bypass another.**

**Layer Responsibilities**:
- **Controllers**: Thin and decision-free. Explicitly forbidden: business logic, database access, Dapper usage, transaction handling, error code interpretation
- **Application**: One service per use case. Stateless. Explicit input/output models. Forbidden: SQL, Dapper, infrastructure implementation details
- **Infrastructure**: Forbidden: business logic, orchestration, HTTP concerns
- **Database**: Never calls upward layers

**Error Flow**: Database → Infrastructure → Application → Controller (each layer interprets only its own responsibility)

**Rationale**: Clear separation of concerns enables testability, maintainability, and parallel development. When implementation convenience conflicts with architecture, architecture prevails.

### V. Database-as-Authority (AUTHORITATIVE)

SQL Server 2025 is an enforcing authority, not a passive persistence layer. The database enforces correctness, not business orchestration.

**Rules**:
- All CRUD operations MUST be implemented through stored procedures
- Direct table access is strictly forbidden
- Dapper must invoke procedures by name only
- Business logic permitted inside stored procedures: authentication checks, authorization validation, integrity enforcement, status transitions, defensive validation
- Business logic disallowed: complex business workflows, cross-aggregate orchestration
- All transactions are owned exclusively by stored procedures
- Mutating procedures must: Begin transaction, commit on success, roll back on failure
- Application-level transaction control is forbidden unless explicitly authorized

**Naming Conventions (Immutable)**:
- Table format: `<Domain>_<Entity>` (e.g., `Sec_Users`, `Com_Configs`, `Ref_Lookups`, `Audit_Operations`)
- Stored procedure format: `<Domain><Entity><Action>` (e.g., `Sec_Users_Get`, `Sec_Users_Authenticate_User`, `Com_Config_Insert`)
- Rules: Explicit action verbs only, single responsibility per procedure, no ambiguous or overloaded names

**Rationale**: The database is the single source of truth. Enforcing rules at the database layer prevents data corruption regardless of client implementation.

### VI. Stored Procedures as Primary Interface (MANDATORY)

Every stored procedure MUST return a standardized output parameter named `@tState VARCHAR(500) OUTPUT`.

**tState Format (Strict)**:
```
<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>
```

**Where**:
- `STATUS` is `OK` or `ERR`
- `ERRORCODE` may be `00000`, an application-defined error code, or a native SQL Server error number
- `DATA` is any relevant value or `N/A`
- `MESSAGE` is human-readable

**Examples**:
```
OK~00000~Sec_Users_Authenticate_User~USERID=1024~Login successful
ERR~8134~Sec_Users_Insert~N/A~Divide by zero error occurred
```

**Rules**:
- Stored procedures may return result sets
- The tState output parameter is mandatory in all cases
- Consumers must: Evaluate tState first, process result sets only when STATUS equals OK
- Stored procedures must use TRY…CATCH and expose ERROR_NUMBER() and ERROR_MESSAGE()
- SQL errors must never be masked
- AI must define and enforce a consistent application-level error code taxonomy
- Native SQL Server error numbers MUST be preserved and surfaced

**SQL Server Metadata Requirements (CRITICAL)**:
- ALL stored procedures MUST explicitly declare `SET QUOTED_IDENTIFIER ON` before CREATE PROCEDURE
- This ensures metadata consistency for integration testing
- Without explicit declaration, SQL Server uses session defaults causing test failures
- Verification required after creation:
  ```sql
  SELECT uses_quoted_identifier 
  FROM sys.sql_modules 
  WHERE object_id = OBJECT_ID('dbo.ProcedureName')
  -- Must return 1
  ```

**Standard Stored Procedure Template**:
```sql
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON  -- MANDATORY for metadata consistency
GO
CREATE PROCEDURE [dbo].[ProcedureName]
    @Param1 INT,
    @tState VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Business logic here
        SET @tState = 'OK~00000~ProcedureName~N/A~Operation successful';
        
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

**Auditing (Mandatory)**:
- Required for: authentication attempts, security changes, insert/update/delete operations
- Audit records must include: user identifier, timestamp, action, entity, success/failure, error code
- Implemented via Audit_* tables and/or procedures

**Schema Versioning**:
- DbUp is mandatory
- Manual production changes are forbidden
- Every migration must: be idempotent, be versioned, include a paired rollback script
- AI must refuse irreversible migrations unless explicitly instructed

**Rationale**: Standardized error contracts enable reliable error handling across all layers. tState provides a uniform interface for success/failure detection and diagnostics.

### VII. Error Handling & Observability (MANDATORY)

Structured logging and error handling are mandatory at all layers.

**Client-Side Logging**:
- Structured logging is mandatory for all significant client-side events
- Logging must be configurable by level, enablement, and sink
- Console-only logging is strictly forbidden in production environments

**Server-Side Logging**:
- Serilog is mandatory
- Logging must be structured, configurable, and centrally consumable
- Logs must include: correlation IDs, request and response metadata, error context

**Cross-Cutting Concerns**:
- **Logging**: Middleware or infrastructure only
- **Auditing**: Triggered by Application, executed by Infrastructure/Database
- **Exception handling**: Centralized middleware
- **Correlation IDs**: Generated at request entry and propagated everywhere

**Rationale**: Observability is non-negotiable in enterprise systems. Structured logs enable diagnostics, auditing, and incident response.

### VIII. Enterprise UI/UX Standards (NON-NEGOTIABLE)

The UI must prioritize efficiency, clarity, trust, and scalability. Decorative, non-functional UI elements are forbidden.

**Foundational Mandates**:
- Efficiency is mandatory. No decorative, non-functional UI elements
- Clarity overrides cleverness. All icons require tooltips. Labels must be explicit
- Trust and reliability are mandatory. Destructive actions require confirmation
- Consistency across the entire application is non-negotiable

**Layout Standards**:
- All layouts must use a 24-column grid
- All spacing must follow an 8px spatial system
- High information density is permitted only with strict visual hierarchy
- Primary information and actions must always be visually dominant

**Theme and Visual Design**:
- Primary palette: #FFFFFF, #F8F9FA, #212529
- Accent color usage restricted to primary actions and active states only
- Semantic colors strictly enforced: Red for errors, Green for success, Yellow/Orange for warnings
- All elements must meet WCAG AA contrast standards; AAA preferred

**Navigation**:
- Mandatory persistent left sidebar for primary navigation
- Top bar reserved for global actions
- Breadcrumbs required beyond two navigation levels
- Global search is mandatory and always accessible

**Data Interaction**:
- Tables are the primary data display mechanism
- Sorting, filtering, pagination, and bulk actions are mandatory
- Charts must be simple, clear, and non-decorative
- All data views must support one-click export

**Forms**:
- Forms exceeding five fields must use multi-step wizards
- Inline, real-time validation is mandatory
- Auto-save and "Save as Draft" are required

**System Feedback**:
- All async actions require loading indicators
- All actions must return clear success, error, warning, or info feedback
- Error messages must be user-friendly and actionable

**Responsiveness**:
- Supported breakpoints: Mobile ≥ 768px, Tablet ≥ 992px, Desktop ≥ 1200px
- Mobile layouts must be redesigned, not shrunk
- Unsupported features must clearly communicate limitations

**Animation**:
- Animations must be functional only
- Standard transitions must not exceed 300ms
- Only ease-out and ease-in-out are permitted
- All animations must be GPU-accelerated
- `prefers-reduced-motion` must be respected

**Rationale**: Enterprise users prioritize speed, clarity, and reliability over aesthetics. Consistent, efficient UI reduces training costs and cognitive load.

## Technology Stack & Standards

### Client-Side Standards

**Language Rules**:
- TypeScript is mandatory for all client-side code
- JavaScript is permitted only when TypeScript is technically impossible
- Any JavaScript usage must be explicitly justified, isolated, and documented

**API Standards**:
- Swagger is mandatory and authoritative
- Swagger must be used for documentation, manual testing, and API contract definition
- All APIs must: be RESTful, be versioned, use consistent response envelopes

**Explicitly Forbidden**:
- Console-only logging in production
- Direct backend database access from client
- Inline styles (use emotion/styled)

### Server-Side Standards

**Framework Requirements**:
- ASP.NET Core Web API only
- Explicitly forbidden unless explicitly approved: MVC Views, Razor Pages, Blazor rendering

**Data Access Rules**:
- Dapper is mandatory
- Primary access method: Stored procedures
- Secondary access method (explicit approval required): Parameterized SQL queries, read-only only
- Explicitly forbidden: Entity Framework (any variant), ORM auto-tracking

## AI Enforcement Rules

### AI MUST

- Enforce all naming conventions
- Generate database artifacts before application code
- Always implement tState
- Preserve native SQL Server error numbers
- Generate DbUp forward and rollback scripts
- Respect layer boundaries
- Reject bypass implementations
- Ask questions when responsibility is unclear

## Development Process & Quality Standards

### IX. Database Migration Execution Strategy (CRITICAL)

Database migrations must be executed immediately after creation to ensure consistency and prevent late-stage test failures.

**Migration Workflow (Mandatory)**:
1. Create migration script in `database/migrations/XXX-description.sql`
2. **IMMEDIATELY** execute migration against development database
3. Verify execution success with query validation
4. Run integration tests to verify stored procedure metadata
5. Only then proceed to application code

**Execution Verification Required**:
```sql
-- After creating stored procedure, MUST verify:
SELECT 
    uses_quoted_identifier,
    uses_ansi_nulls
FROM sys.sql_modules 
WHERE object_id = OBJECT_ID('dbo.ProcedureName')
-- Both must return 1
```

**Rationale**: Creating migration scripts without immediate execution leads to:
- Metadata inconsistencies discovered late in testing
- QUOTED_IDENTIFIER issues causing test failures
- Wasted debugging time (2-3 hours per incident)
- False sense of completion when tasks are marked done prematurely

### X. Complete Task Specifications (CRITICAL)

All tasks must specify FULL integration requirements, not just component creation.

**Task Completion Checklist (Mandatory)**:
- [ ] Component created (code exists)
- [ ] Component registered (DI/imports/routing configured)
- [ ] Component integrated (called by consumer)
- [ ] Component tested (unit + integration tests passing)
- [ ] Component verified (manual smoke test performed)

**Example - Incorrect Task Specification**:
```markdown
❌ BAD: "Create InsertAuditEventAsync method in repository"
```

**Example - Correct Task Specification**:
```markdown
✅ GOOD: "Implement audit event logging"
- Create InsertAuditEventAsync in IAuthenticationRepository
- Implement in AuthenticationRepository using Audit_AuthEvents_Insert stored procedure
- Register in DI container (if needed)
- Call from AuthenticationService.LoginAsync (success and failure cases)
- Call from AuthenticationService.LogoutAsync
- Add integration test verifying Audit_AuthEvents table records
- Verify logs appear in both Serilog files AND database table
```

**Rationale**: Incomplete task specifications lead to:
- Infrastructure created but never integrated (T056 audit logging gap)
- False task completion (checkbox marked but feature incomplete)
- HIGH priority gaps discovered in late-stage audits
- Rework effort (3-4 hours per incomplete feature)

### XI. End-to-End Cookie Testing Strategy (HIGH PRIORITY)

Playwright cannot reliably test httpOnly cookies in Chromium. A dual mechanism must be implemented upfront.

**Dual Authentication Mechanism (Required for E2E Testing)**:
```csharp
// Backend - AuthController support for both mechanisms
var sessionToken = Request.Cookies["AIDD_SESSION"];

// WORKAROUND: Fallback for E2E tests only
if (string.IsNullOrEmpty(sessionToken))
{
    var authHeader = Request.Headers["Authorization"].FirstOrDefault();
    if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        sessionToken = authHeader.Substring("Bearer ".Length).Trim();
}
```

**E2E Test Pattern**:
```typescript
// Extract session token from Set-Cookie header
const sessionToken = loginResponse.headers()['set-cookie']
  ?.match(/AIDD_SESSION=([^;]+)/)?.[1];

// Use Authorization header for subsequent requests
await page.setExtraHTTPHeaders({
  'Authorization': `Bearer ${sessionToken}`
});
```

**Production vs Testing**:
- **Production**: HttpOnly cookies only (secure, recommended)
- **E2E Tests**: Authorization Bearer token fallback (testing workaround)
- **Security**: Document that Bearer token support is for testing only

**Rationale**: Without upfront planning:
- 2-3 hours wasted debugging Playwright cookie limitations
- Multiple workaround attempts before finding solution
- Test infrastructure rebuilt late in development

### XII. Test Execution Order & Dependencies (HIGH PRIORITY)

Clear test execution strategy prevents confusion and ensures proper validation at each stage.

**Test Pyramid Execution Order (Mandatory)**:
1. **Unit Tests First** (Run during development)
   - Backend: `dotnet test` in each test project
   - Frontend: `npm run test` in frontend directory
   - No external dependencies (mocked/stubbed)
   - Fast feedback loop (< 5 seconds)

2. **Integration Tests Second** (Run after unit tests pass)
   - Backend: Tests with `[Collection("Database")]` attribute
   - Requires: Database running, migrations applied
   - Tests stored procedures, repository layer
   - Medium execution time (10-30 seconds)

3. **E2E Tests Last** (Run after integration tests pass)
   - Requires: Backend running, Frontend running, Database seeded
   - Tests complete user workflows through browser
   - Slow execution time (1-3 minutes)

**When to Run Each Type**:
- **Per Feature**: Unit tests only (rapid iteration)
- **Per User Story**: Unit + Integration tests (verify database layer)
- **Per Phase**: All tests (full validation before merge)
- **Pre-Deployment**: All tests + manual smoke tests

**Rationale**: Without clear execution order:
- 1-2 hours wasted running wrong test type at wrong time
- Integration tests fail because migrations not run
- E2E tests fail because backend not started
- Confusion about which tests validate which layers

### XIII. Continuous Quality Gates (MEDIUM PRIORITY)

Quality verification must occur continuously, not just at project end (Phase 6).

**Mini-Phase 6 Checklist (After Each User Story)**:
- [ ] **Security**: Authentication/authorization working, no SQL injection vectors
- [ ] **Error Handling**: All error paths return proper error codes, no unhandled exceptions
- [ ] **Logging**: Structured logs include correlation IDs, no console-only logging
- [ ] **Testing**: All tests passing (unit + integration + E2E for completed features)
- [ ] **Code Quality**: No TODO comments, no commented code, consistent formatting
- [ ] **Documentation**: API endpoints documented, error codes defined

**Phase-End Full Audit (Phase 6 Comprehensive)**:
- Performance benchmarks
- Security penetration testing
- Accessibility compliance (WCAG AA)
- UI/UX consistency review
- Production deployment checklist

**Rationale**: Deferring quality checks to Phase 6:
- Discovered HIGH priority gaps late (T103 audit logging)
- Required 2-3 hours rework per gap
- Could have been caught immediately after US1 completion
- Earlier detection = easier fixes

### XIV. Explicit File Path Requirements (MEDIUM PRIORITY)

All file paths in tasks, specifications, and instructions must use absolute paths from repository root.

**Path Format (Mandatory)**:
```markdown
❌ BAD: "Create file in backend/src/Infrastructure"
✅ GOOD: "Create file at backend/src/WebApi/Infrastructure/Data/AuthenticationRepository.cs"

❌ BAD: "Add to frontend components"
✅ GOOD: "Create file at frontend/src/components/auth/LoginForm.tsx"
```

**AI Response Format**:
When user requests file creation, AI must:
1. State full absolute path from repository root
2. Confirm directory structure matches actual codebase
3. Create file using complete path

**Rationale**: Ambiguous paths cause:
- 30 minutes wasted searching for correct location
- Files created in wrong directories
- Confusion between "backend/src" vs "backend/src/WebApi"

### XV. Dependency Injection Registration Tracking (MEDIUM PRIORITY)

Every interface creation must include explicit DI registration step.

**DI Registration Checklist (Mandatory for .NET)**:
When creating interface/implementation pair:
- [ ] Interface defined (e.g., `IAuthenticationRepository`)
- [ ] Implementation created (e.g., `AuthenticationRepository`)
- [ ] **Registered in Program.cs** (e.g., `builder.Services.AddScoped<IAuthenticationRepository, AuthenticationRepository>()`)
- [ ] Verified via integration test (DI resolution test or service usage test)

**Task Format**:
```markdown
✅ GOOD:
- Create IAuthenticationService interface at backend/src/WebApi/Application/Interfaces/IAuthenticationService.cs
- Create AuthenticationService implementation at backend/src/WebApi/Application/Services/AuthenticationService.cs
- Register in Program.cs: builder.Services.AddScoped<IAuthenticationService, AuthenticationService>()
- Verify registration with integration test
```

**Rationale**: Forgetting DI registration:
- Runtime errors discovered late (DI resolution failures)
- 1 hour debugging "service not registered" exceptions
- Tests pass but application fails at runtime

### XVI. Task Priority Taxonomy (LOW PRIORITY)

All tasks must clearly indicate whether they are REQUIRED, RECOMMENDED, or OPTIONAL.

**Priority Tags (Mandatory)**:
- `[REQUIRED]` - Blocking for production deployment, must be implemented
- `[RECOMMENDED]` - Should be implemented, can be deferred with risk assessment
- `[OPTIONAL]` - Nice-to-have, can be deferred without risk

**Example Task Format**:
```markdown
- [ ] T100 [REQUIRED] Implement BCrypt password hashing with 12 rounds
- [ ] T101 [RECOMMENDED] Add rate limiting middleware (5 attempts per IP per 15 minutes)
- [ ] T102 [OPTIONAL] Add custom page transition animations with prefers-reduced-motion support
```

**Phase 6 Audit Format**:
```markdown
## Security Audit Results

✅ T100 [REQUIRED] - PASS - BCrypt implemented
⚠️  T101 [RECOMMENDED] - PARTIAL - Documented as optional for v1.0, recommended for production
✅ T102 [OPTIONAL] - PASS - Material-UI defaults sufficient
```

**Rationale**: Without clear priority taxonomy:
- 30 minutes wasted clarifying if T100 rate limiting is blocking
- Unclear if partial implementation is acceptable
- Difficulty determining MVP scope vs enhancements

### XVII. Playwright Browser Configuration (LOW PRIORITY)

E2E tests must document browser compatibility and configuration requirements.

**Browser Support Declaration (Mandatory)**:
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox and WebKit support optional for MVP
  ],
});
```

**Cookie Handling Documentation**:
```markdown
## Known E2E Testing Limitations

1. **HttpOnly Cookies**: Playwright cannot access httpOnly cookies in Chromium
   - Workaround: Authorization Bearer token fallback (see Section XI)
   - Production: HttpOnly cookies only (secure)

2. **Browser Support**: E2E tests validated on Chromium only
   - Firefox/Safari testing deferred to Phase 7
```

**Rationale**: Documenting limitations upfront:
- Prevents repeated browser compatibility questions
- Sets clear expectations for test coverage
- Avoids wasted time debugging browser-specific issues

## AI Enforcement Rules

### AI MUST

- Enforce all naming conventions
- Generate database artifacts before application code
- Always implement tState
- Preserve native SQL Server error numbers
- Generate DbUp forward and rollback scripts
- Respect layer boundaries
- Reject bypass implementations
- Ask questions when responsibility is unclear
- Execute database migrations immediately after creation (IX)
- Specify complete task integration requirements (X)
- Implement dual authentication mechanism for E2E tests (XI)
- Follow test pyramid execution order (XII)
- Apply mini-Phase 6 checklist after each user story (XIII)
- Use absolute file paths from repository root (XIV)
- Include DI registration in all interface creation tasks (XV)
- Tag all tasks with [REQUIRED]/[RECOMMENDED]/[OPTIONAL] (XVI)

### AI MUST NOT

- Introduce ORMs
- Bypass stored procedures
- Assume schema details
- Suppress database errors
- Drift from this constitution
- Place business logic in controllers
- Place orchestration in infrastructure
- Place application logic in the database
- Break dependency direction

### Violation Protocol

Any deviation from this constitution requires:
1. Explicit instruction from authorized personnel
2. Written justification
3. Documentation of architectural impact
4. Approval before implementation

## Governance

This constitution is authoritative and binding. Compliance is mandatory.

**Amendment Process**:
- Amendments require explicit documentation of changes
- Approval from project authority required
- Version must be incremented according to semantic versioning
- Migration plan required for breaking changes
- All dependent templates and documentation must be updated

**Versioning Policy**:
- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

**Compliance Review**:
- All PRs/reviews must verify compliance with this constitution
- Architectural violations must be rejected
- Complexity must be justified against constitution principles
- When implementation convenience conflicts with architecture, architecture prevails

**Version**: 1.1.0 | **Ratified**: 2026-02-09 | **Last Amended**: 2026-02-10
