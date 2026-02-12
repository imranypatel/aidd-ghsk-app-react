# Implementation Plan: User Login and Logout

**Branch**: `001-user-login-logout` | **Date**: February 9, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-user-login-logout/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements secure administrator authentication with backend API validation against SQL Server 2025 database credentials. The Admin user (Admin/Admin123@) can log in via a Material-UI login form, maintain a session with 30-minute inactivity timeout, and explicitly log out. Session expiration is lazily detected (redirect on next interaction). All authentication events (successful logins, failed attempts, logouts, session expirations) are comprehensively logged to `Audit_AuthEvents` table with timestamps and usernames. Implementation strictly follows layered architecture (Controllers → Application → Infrastructure → Database) with stored procedures as the exclusive database interface, tState output pattern for error handling, and TDD workflow.

## Technical Context

**Language/Version**: 
- **Frontend**: TypeScript with React 19.2.4, Vite 7.3.1
- **Backend**: C# with ASP.NET Core Web API v10 (.NET 10.0)
- **Database**: SQL Server 2025 (T-SQL)

**Primary Dependencies**: 
- **Frontend**: Material-UI (MUI) for UI components and 24-column grid system, React Router v7 for navigation, Axios for HTTP client, emotion/styled for component styling, Vitest for unit testing, React Testing Library for component testing, Playwright for E2E testing
- **Backend**: Dapper 2.x for stored procedure execution, Serilog for structured logging with correlation IDs, ASP.NET Core built-in middleware for CORS/error handling, System.Security.Cryptography for session token generation, BCrypt.Net for password hashing
- **Database**: DbUp for versioned schema migrations, SQL Server built-in security functions

**Storage**: 
- **Database**: TRANTS_EMS_DEV on SQL Server instance PRECISION7520\SQLEXPRESSADV25
- **Database Tables**:
  - `Sec_Users` (UserId PK, Username UNIQUE, PasswordHash, FirstName, LastName, Email, Phone, Address, LastLoginDate, IsActive, CreatedDate, ModifiedDate)
  - `Sec_Sessions` (SessionId PK, UserId FK, SessionToken UNIQUE, CreatedDate, ExpiresDate, IsActive)
  - `Audit_AuthEvents` (EventId PK, UserId, Username, EventType, Success BIT, ErrorCode, Timestamp, IpAddress)
- **Stored Procedures**: 
  - `Sec_Users_Authenticate_User` (validates credentials, updates LastLoginDate, returns UserId, outputs tState with TRY-CATCH)
  - `Sec_Users_Create_Session` (creates session record, returns SessionToken, outputs tState with TRY-CATCH)
  - `Sec_Users_End_Session` (marks session inactive, outputs tState with TRY-CATCH)
  - `Sec_Users_Validate_Session` (checks token validity and expiration, outputs tState with TRY-CATCH)
  - `Audit_AuthEvents_Insert` (logs authentication event, outputs tState with TRY-CATCH)
- **Client Storage**: Session token stored in httpOnly cookie (preferred for XSS protection) or localStorage as fallback

**Testing**: 
- **Frontend**: Vitest for unit tests (services, utilities), React Testing Library for component tests (LoginPage, LogoutButton), Playwright for E2E flows (full login/logout/session expiration scenarios)
- **Backend**: xUnit for API controller tests, application service tests, infrastructure repository tests with mock database
- **Database**: Integration tests for stored procedures using test database with rollback transactions
- **TDD Required**: Tests written before implementation per Constitution Section III (Red-Green-Refactor cycle)

**Target Platform**: 
- **Deployment**: Web application (SPA frontend + RESTful backend API)
- **Browsers**: Modern browsers supporting ES6+ (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- **Responsive**: Mobile ≥768px, Tablet ≥992px, Desktop ≥1200px breakpoints (per Constitution Section VIII)

**Project Type**: Web (frontend + backend)

**Performance Goals**: 
- **Login API**: <500ms p95 response time (target <300ms) including database authentication
- **Session Validation**: <100ms p95 for token validation on protected route access
- **Logout API**: <200ms p95 for session termination
- **Frontend TTI**: <2s on desktop, <3s on mobile (initial page load)
- **Database Indexes**: Required on `Sec_Users.Username`, `Sec_Sessions.SessionToken`, `Sec_Sessions.UserId` for query performance

**Constraints**: 
- **Constitutional Mandates**: 
  - No Entity Framework or ORMs except Dapper (Constitution Section V)
  - All database access via stored procedures (Constitution Section V)
  - tState output parameter mandatory for all procedures (Constitution Section VI)
  - All stored procedures MUST use TRY-CATCH blocks (Constitution Section VI)
  - Layered architecture strictly enforced: Controllers → Application → Infrastructure → Database (Constitution Section IV)
  - No business logic in Controllers or Infrastructure layers (Constitution Section IV)
  - TDD workflow required (tests before code) (Constitution Section III)
  - Material-UI 24-column grid, 8px spacing, WCAG AA contrast (Constitution Section VIII)
- **Deployment Configuration**:
  - Database: TRANTS_EMS_DEV on PRECISION7520\SQLEXPRESSADV25
  - SQL Server Authentication: User=sa, Password=trandts@2013
  - Backend API: http://localhost:5000
  - Frontend React: http://localhost:3000
- **Security**: 
  - No account lockout mechanism (per clarification)
  - Passwords stored as salted hashes using BCrypt with 12 rounds
  - PasswordHasher console utility (utilities/PasswordHasher) for generating hashes
  - Session tokens must be cryptographically secure (32-byte random values, base64 encoded)
  - All authentication events logged with timestamp, username, IP address
- **Session Management**: 
  - 30-minute inactivity timeout (1800 seconds)
  - Lazy expiration detection (no automatic redirect until next user interaction)
  - Single session per user (new login refreshes existing session)

**Scale/Scope**: 
- **Initial Release**: Single administrator user (Admin), 1 concurrent session
- **Future Considerations**: Multi-user support (10-100 users), role-based access control (RBAC), concurrent sessions per user, password reset flow, "Remember Me" functionality
- **Database Design**: Schema supports future multi-user without migration (UserId references, session-user relationships already normalized)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Evaluation (February 9, 2026)

✅ **PASS: System Architecture Immutability (Section II)**
- React 19.2.4 with Vite 7.3.1 ✓
- ASP.NET Core Web API v10 ✓
- SQL Server 2025 ✓
- Material-UI for UI components ✓
- Dapper for data access ✓
- Serilog for structured logging ✓
- xUnit/Vitest/Playwright for testing ✓
- **Status**: All constitutional technology choices confirmed in Technical Context

✅ **PASS: Mandatory TDD (Section III)**
- TDD workflow specified in Testing section
- Test frameworks identified: Vitest, React Testing Library, Playwright (frontend), xUnit (backend)
- Integration tests planned for stored procedures
- **Status**: Red-Green-Refactor cycle will be enforced during implementation

✅ **PASS: Layered Architecture Enforcement (Section IV)**
- Architecture explicitly defined: Controllers → Application → Infrastructure → Database
- Layer responsibilities documented:
  - **Controllers**: HTTP transport, request validation, invoke Application, return responses
  - **Application**: Use case orchestration (AuthenticationService), interpret tState, control flow
  - **Infrastructure**: Execute stored procedures via Dapper, map results, surface raw tState
  - **Database**: Stored procedures enforce data integrity, authentication validation, audit logging
- Forbidden patterns acknowledged: No business logic in Controllers, no Dapper in Application, no orchestration in Infrastructure
- **Status**: Layered architecture will be strictly enforced during design and implementation

✅ **PASS: Database-as-Authority (Section V)**
- All CRUD operations via stored procedures: `Sec_Users_Authenticate_User`, `Sec_Users_Create_Session`, `Sec_Users_End_Session`, `Sec_Users_Validate_Session`, `Audit_AuthEvents_Insert`
- Direct table access prohibited
- Dapper will invoke procedures by name only
- Business logic placement: Authentication validation in stored procedure, session creation/termination in stored procedure, orchestration in Application layer
- Transaction ownership: All transactions owned by stored procedures
- Naming conventions: `<Domain>_<Entity>` for tables (`Sec_Users`, `Sec_Sessions`, `Audit_AuthEvents`), `<Domain><Entity><Action>` for procedures (e.g., `Sec_Users_Authenticate_User`)
- **Status**: Database-as-authority principle will be strictly followed

✅ **PASS: Stored Procedures as Primary Interface (Section VI)**
- tState output parameter (`@tState VARCHAR(500) OUTPUT`) mandatory for all procedures
- tState format: `<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>`
- Examples: `OK~00000~Sec_Users_Authenticate_User~USERID=1~Login successful`, `ERR~50001~Sec_Users_Authenticate_User~N/A~Invalid credentials`
- All procedures will use TRY…CATCH blocks
- Native SQL Server error numbers preserved
- Application-level error code taxonomy to be defined in Phase 0 research
- Auditing: All authentication events logged to `Audit_AuthEvents` with user, timestamp, action, success/failure
- DbUp mandatory for schema versioning
- **Status**: tState pattern and auditing requirements will be implemented

✅ **PASS: Error Handling & Observability (Section VII)**
- Serilog specified for server-side structured logging
- Client-side structured logging will be configured (library selection in Phase 0 research)
- Correlation IDs will be generated at request entry and propagated through all layers
- Logging requirements: Request/response metadata, error context, authentication events
- Centralized exception handling middleware planned
- **Status**: Comprehensive observability strategy will be implemented

✅ **PASS: Enterprise UI/UX Standards (Section VIII)**
- Material-UI with 24-column grid system specified
- 8px spacing system confirmed
- Color palette: Primary (#FFFFFF, #F8F9FA, #212529), Semantic (Red/Green/Yellow for error/success/warning)
- WCAG AA contrast standards mandated
- Responsive breakpoints: Mobile ≥768px, Tablet ≥992px, Desktop ≥1200px
- Form validation: Real-time inline validation required
- System feedback: Loading indicators for async actions, clear success/error messages
- Animation constraints: ≤300ms transitions, ease-out/ease-in-out only, respect prefers-reduced-motion
- **Status**: All UI/UX requirements from specification align with constitutional standards

### Gate Status: **✅ APPROVED FOR PHASE 0 RESEARCH**

**No constitutional violations identified.** All architectural, technology, and design constraints are aligned with Constitution v1.0.0. Proceed to Phase 0 research to resolve remaining implementation details.

### Post-Phase 1 Re-evaluation (February 9, 2026)

✅ **PASS: All Phase 1 Artifacts Generated**
- `research.md`: Complete with 8 technology decision areas (session storage, password hashing, error codes, Material-UI patterns, authentication middleware, client logging, session timeout, database connection management)
- `data-model.md`: Complete with 3 database tables (Sec_Users, Sec_Sessions, Audit_AuthEvents), 5 stored procedures, entity models, state transitions, validation rules
- `contracts/auth-api.openapi.yaml`: Complete OpenAPI 3.0 specification with 3 endpoints (login, logout, session validation), request/response schemas, error codes
- `contracts/tstate-contracts.md`: Complete tState format reference with parsing strategy, error code taxonomy, HTTP response mapping
- `quickstart.md`: Complete developer onboarding guide with prerequisites, setup instructions, TDD workflow, debugging tips, troubleshooting

✅ **PASS: Constitutional Compliance Re-check**

**System Architecture Immutability (Section II)**:
- All technology choices confirmed and documented in research.md
- No deviations from constitutional stack

**Mandatory TDD (Section III)**:
- TDD workflow documented in quickstart.md with Red-Green-Refactor examples
- Test frameworks and strategies defined for all layers

**Layered Architecture Enforcement (Section IV)**:
- Architecture diagrams included in quickstart.md
- Layer responsibilities clearly documented in data-model.md
- Project structure in plan.md shows proper layer separation

**Database-as-Authority (Section V)**:
- All 5 stored procedures defined in data-model.md with full DDL
- Naming conventions follow constitutional mandates (<Domain>_<Entity> for tables, <Domain><Entity><Action> for procedures)
- No direct table access in design

**Stored Procedures as Primary Interface (Section VI)**:
- All procedures return @tState VARCHAR(500) OUTPUT
- tState format strictly follows <STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>
- Native SQL Server error preservation documented in tstate-contracts.md
- Application error code taxonomy defined (SEC-XX-XXX, VAL-XX-XXX, SYS-XX-XXX)

**Error Handling & Observability (Section VII)**:
- Serilog configuration documented in quickstart.md
- Client-side logging strategy defined in research.md
- Correlation IDs mentioned in project structure (CorrelationIdMiddleware.cs)

**Enterprise UI/UX Standards (Section VIII)**:
- Material-UI 24-column grid documented in research.md
- 8px spacing system confirmed
- React Hook Form integration for real-time validation documented
- WCAG AA compliance mentioned in research.md

### Gate Status: **✅ APPROVED FOR PHASE 2 IMPLEMENTATION**

**No constitutional violations identified post-Phase 1 design.** All architectural decisions, database schemas, API contracts, and technology choices fully align with Constitution v1.0.0. Ready to proceed with implementation (Phase 2: Task breakdown via `/speckit.tasks` command).

---

## Phase 2 Readiness Checklist

✅ Technical Context fully defined (no NEEDS CLARIFICATION markers)  
✅ Constitution Check passed (pre-Phase 0 and post-Phase 1)  
✅ Phase 0 Research complete (8 decision areas documented)  
✅ Phase 1 Design complete (data-model, contracts, quickstart)  
✅ Agent context updated (copilot-instructions.md)  

**Next Command**: `/speckit.tasks` to generate task breakdown and implementation sequence

## Project Structure

### Documentation (this feature)

```text
specs/001-user-login-logout/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification with requirements and UI/UX
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── auth-api.openapi.yaml  # OpenAPI spec for /api/auth endpoints
│   └── tstate-contracts.md    # tState format examples for all procedures
├── checklists/          # Quality validation artifacts
│   └── requirements.md  # Requirements checklist (already exists)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── Api/                           # ASP.NET Core Web API
│   │   ├── Controllers/
│   │   │   └── AuthController.cs      # Login, Logout, ValidateSession endpoints
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlingMiddleware.cs    # Centralized error handling
│   │   │   └── CorrelationIdMiddleware.cs        # Correlation ID generation
│   │   ├── Models/
│   │   │   ├── LoginRequest.cs        # DTO for login endpoint
│   │   │   ├── LoginResponse.cs       # DTO for login response (token, expiry)
│   │   │   ├── LogoutRequest.cs       # DTO for logout endpoint
│   │   │   └── ApiResponse.cs         # Standardized API response wrapper
│   │   ├── Program.cs                 # Application entry point, DI setup
│   │   └── appsettings.json           # Configuration (DB connection, Serilog)
│   │
│   ├── Application/                   # Business logic orchestration
│   │   ├── Services/
│   │   │   └── AuthenticationService.cs  # Orchestrates login, logout, session validation
│   │   ├── Interfaces/
│   │   │   └── IAuthenticationService.cs # Service contract
│   │   ├── Models/
│   │   │   ├── AuthenticationResult.cs   # Service layer result model
│   │   │   └── SessionInfo.cs            # Session data model
│   │   └── Exceptions/
│   │       └── AuthenticationException.cs # Application-specific exceptions
│   │
│   ├── Infrastructure/                # Data access and external concerns
│   │   ├── Repositories/
│   │   │   └── AuthenticationRepository.cs  # Dapper-based stored procedure calls
│   │   ├── Interfaces/
│   │   │   └── IAuthenticationRepository.cs # Repository contract
│   │   ├── Data/
│   │   │   ├── DbConnectionFactory.cs    # SQL Server connection management
│   │   │   └── TStateParser.cs           # tState parsing utility
│   │   └── Logging/
│   │       └── SerilogConfiguration.cs   # Serilog setup
│   │
│   └── Database/                      # Database artifacts (migrations, scripts)
│       ├── Migrations/                # DbUp migration scripts
│       │   ├── 001_Create_Sec_Users_Table.sql
│       │   ├── 002_Create_Sec_Sessions_Table.sql
│       │   ├── 003_Create_Audit_AuthEvents_Table.sql
│       │   ├── 004_Create_Sec_Users_Authenticate_User_SP.sql
│       │   ├── 005_Create_Sec_Users_Create_Session_SP.sql
│       │   ├── 006_Create_Sec_Users_End_Session_SP.sql
│       │   ├── 007_Create_Sec_Users_Validate_Session_SP.sql
│       │   ├── 008_Create_Audit_AuthEvents_Insert_SP.sql
│       │   ├── 009_Seed_Admin_User.sql
│       │   └── 010_Create_Indexes.sql
│       └── Rollbacks/                 # Rollback scripts (paired with migrations)
│           ├── 001_Drop_Sec_Users_Table.sql
│           └── [corresponding rollback scripts for each migration]
│
└── tests/
    ├── Api.Tests/                     # Controller integration tests
    │   └── AuthControllerTests.cs
    ├── Application.Tests/             # Service unit tests
    │   └── AuthenticationServiceTests.cs
    ├── Infrastructure.Tests/          # Repository integration tests
    │   └── AuthenticationRepositoryTests.cs
    └── Database.Tests/                # Stored procedure tests
        └── AuthenticationProceduresTests.cs

frontend/
├── src/
│   ├── components/                    # React components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx          # Login form page
│   │   │   ├── LoginForm.tsx          # Material-UI form component
│   │   │   └── LogoutButton.tsx       # Logout control
│   │   └── common/
│   │       ├── ProtectedRoute.tsx     # Route guard for authenticated routes
│   │       └── LoadingSpinner.tsx     # Loading indicator
│   │
│   ├── services/                      # API client and business logic
│   │   ├── authService.ts             # Authentication API calls
│   │   └── apiClient.ts               # Axios instance with interceptors
│   │
│   ├── context/                       # React Context for global state
│   │   └── AuthContext.tsx            # Authentication state (user, token, isAuthenticated)
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.ts                 # Hook to access AuthContext
│   │   └── useSessionTimeout.ts       # Hook for session timeout detection
│   │
│   ├── types/                         # TypeScript type definitions
│   │   ├── auth.types.ts              # Authentication types (User, LoginCredentials, Session)
│   │   └── api.types.ts               # API response types
│   │
│   ├── utils/                         # Utility functions
│   │   ├── tokenStorage.ts            # Session token storage (cookie/localStorage)
│   │   └── logger.ts                  # Client-side structured logging
│   │
│   ├── App.tsx                        # Root component with routing
│   ├── main.tsx                       # Application entry point
│   └── vite-env.d.ts                  # Vite type declarations
│
├── tests/
│   ├── unit/                          # Unit tests (services, hooks, utilities)
│   │   ├── authService.test.ts
│   │   └── useSessionTimeout.test.ts
│   ├── components/                    # Component tests (React Testing Library)
│   │   ├── LoginPage.test.tsx
│   │   └── LogoutButton.test.tsx
│   └── e2e/                           # End-to-end tests (Playwright)
│       └── auth.spec.ts               # Full login/logout/session expiration flows
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```

**Structure Decision**: **Web application (Option 2)** with separate backend and frontend directories. This structure is chosen because:
1. Clear separation between ASP.NET Core Web API (backend) and React SPA (frontend)
2. Supports independent deployment strategies (backend API can be deployed separately from frontend static assets)
3. Enables parallel development by frontend and backend teams
4. Follows constitutional layered architecture within backend (Controllers → Application → Infrastructure → Database)
5. Frontend follows component-based architecture with separation of concerns (components, services, context, hooks)

**Key Architectural Decisions**:
- **Backend**: Strictly layered with Controllers (HTTP), Application (orchestration), Infrastructure (data access), Database (stored procedures)
- **Frontend**: Component-based with React Context for global auth state, custom hooks for session management, services for API calls
- **Database Artifacts**: Co-located with backend in `Database/` directory for migration versioning and stored procedure definitions
- **Testing**: Separate test directories for each project with unit, integration, and E2E coverage

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No constitutional violations identified.** All architectural decisions, technology choices, and design patterns align with Constitution v1.0.0.

**Complexity justifications**: N/A

**Simpler alternatives rejected**: N/A
