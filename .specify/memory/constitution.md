<!--
SYNC IMPACT REPORT
===================
Version Change: INITIAL → 1.0.0
Rationale: Initial constitutional establishment for TRANDTS Enterprise Management System.
          This is a MAJOR version as it defines the complete governance framework.

Modified Principles: N/A (initial creation)
Added Sections:
  - Core Principles (8 principles: Technology Stack Immutability, TypeScript Supremacy, 
    Material Design Compliance, Test-Driven Development, Structured Logging, 
    API-First Architecture, Stored Procedure Sovereignty, Layered Architecture Discipline)
  - Client-Side Constitution (tooling, language rules, UI requirements, logging, testing)
  - Server-Side Constitution (framework, API standards, logging, testing, data access)
  - Database Constitution (platform, naming conventions, stored procedures, business logic,
    tState contract, error codes, transactions, auditing, schema versioning)
  - Architectural Boundaries (layered model, dependency rules, layer responsibilities)
  - AI Enforcement Rules
  - Governance

Removed Sections: N/A (initial creation)

Templates Requiring Updates:
  ✅ plan-template.md - Updated constitution check section to reflect database-first, 
     stored procedure enforcement, and layered architecture validation
  ✅ spec-template.md - Already aligned (requirements-driven, testable stories)
  ✅ tasks-template.md - Already aligned (test-first workflow, phase organization)

Follow-up TODOs: None - All placeholders filled with concrete values

Deployment Note: This constitution establishes non-negotiable rules for AI-assisted 
development. All future changes must comply with amendment procedures defined in 
Governance section.
-->

# TRANDTS Enterprise Management System Constitution

**Client**: TRANDTS  
**Application**: Enterprise Management System  
**Hosting Target**: IIS 10.0  
**Authority Level**: HIGHEST (NON-NEGOTIABLE)

---

## Constitutional Authority

This document defines **absolute, non-negotiable rules** governing AI-assisted development for the Enterprise Management System.

**ANY** AI agent, automation, generator, refactor, or recommendation **MUST** strictly comply with this constitution.

**Compliance Rules**:
- If ambiguity exists, the AI **MUST** ask clarifying questions before proceeding, especially regarding database schema, persistence, transactions, or data integrity
- Assumptions are **FORBIDDEN**
- Deviation requires **explicit written approval**
- This constitution supersedes all other development practices, patterns, or conventions

---

## Core Principles

### I. Technology Stack Immutability

**The technology stack is LOCKED and cannot be substituted without explicit approval.**

**Stack Definition**:
- **Client**: React 19.2.4 (Single Page Application) built with Vite 7.3.1
- **Server**: ASP.NET Core 10 Web API (API-only, no views/pages/Blazor)
- **Database**: SQL Server 2025 (existing development environment)
- **Routing**: React Router 7.13.0

**Rationale**: Stack consistency ensures maintainability, eliminates tooling conflicts, and preserves team expertise. Changes would require retraining, migration effort, and introduce architectural risk.

**Enforcement**:
- No parallel frameworks or alternative stacks may be introduced
- No framework version changes without approval
- AI must reject any suggestion to introduce competing technologies

---

### II. TypeScript Supremacy

**TypeScript is MANDATORY for all client-side code. JavaScript is allowed ONLY as a last resort when TypeScript is technically impossible.**

**Rules**:
- All React components, hooks, utilities, services MUST be TypeScript
- JavaScript usage requires written justification
- Any JavaScript code MUST be isolated, documented, and flagged for future migration

**Rationale**: TypeScript provides compile-time safety, self-documenting contracts, and refactoring confidence essential for enterprise-scale applications with multiple developers.

**Enforcement**:
- AI must refuse to generate JavaScript code unless explicitly instructed with justification
- All file creation defaults to `.ts` or `.tsx`
- Type definitions MUST be explicit (no `any` unless justified)

---

### III. Material Design Compliance

**UI implementation MUST use Material Design (MUI) components exclusively.**

**Mandatory Libraries**:
- `@mui/material`
- `@emotion/react`
- `@emotion/styled`
- `@mui/icons-material`
- `@mui/x-data-grid` version 8.x
- `@mui/x-tree-view` version 8.x

**Requirements**:
- Follow Material Design principles
- Ensure accessibility by default (WCAG 2.1 AA minimum)
- Support enterprise-scale datasets (10,000+ rows)
- Consistent theming and component usage

**Rationale**: Unified design system ensures professional appearance, reduces custom CSS complexity, provides accessible components out-of-the-box, and delivers enterprise-grade data handling.

**Enforcement**:
- AI must use MUI components for all UI elements
- Custom components allowed only when MUI cannot provide the functionality
- Custom styling must use MUI theming system

---

### IV. Test-Driven Development (NON-NEGOTIABLE)

**NO production code may be written without tests. TDD is MANDATORY.**

**Client-Side Testing**:
- **Tools**: Vitest, Jest, React Testing Library
- **Coverage**: Components, hooks, routing, state transitions
- **No snapshot testing** unless semantically meaningful

**Server-Side Testing**:
- **Tools**: xUnit, NUnit
- **Coverage**: Business logic (unit tests), API endpoints (integration tests), database interactions (integration tests)
- **No database-dependent logic without test coverage**

**TDD Workflow**:
1. Write tests FIRST
2. Ensure tests FAIL
3. Implement minimal code to pass
4. Refactor with tests as safety net

**Rationale**: Tests prevent regressions, document intent, enable confident refactoring, and ensure correctness. TDD catches design flaws early and produces testable architecture.

**Enforcement**:
- AI must refuse to generate production code without corresponding tests
- Tests must be written before implementation
- All pull requests must include test evidence

---

### V. Structured Logging (Mandatory)

**All significant events MUST be logged with structured, configurable logging.**

**Client-Side Logging**:
- Structured logging for all significant events
- Configurable (levels, enable/disable, sinks)
- Console-only logging **FORBIDDEN** in production

**Server-Side Logging**:
- **Serilog MANDATORY**
- Structured, configurable, centralized
- Must include: correlation IDs, request/response metadata, error context

**Rationale**: Structured logs enable automated analysis, troubleshooting, compliance auditing, and performance monitoring. Unstructured logs are unmaintainable at scale.

**Enforcement**:
- AI must include logging in all service methods, error handlers, and critical paths
- Logs must use structured format (JSON or similar)
- Sensitive data must be masked

---

### VI. API-First Architecture

**The server is API-only. Swagger documentation is MANDATORY.**

**API Standards**:
- RESTful design
- Versioned endpoints
- Consistent response envelopes
- Swagger for documentation, testing, and contract definition

**Forbidden**:
- MVC Views
- Razor Pages
- Blazor server-side rendering

**Rationale**: API-first enables client flexibility, supports mobile/SPA clients, facilitates testing, and enforces separation of concerns.

**Enforcement**:
- AI must design RESTful endpoints
- All endpoints must be documented in Swagger
- Controllers must be thin and delegate to application layer

---

### VII. Stored Procedure Sovereignty

**ALL database access MUST use stored procedures. Dapper is the ONLY data access library.**

**Rules**:
- **Primary**: Stored procedures for ALL CRUD operations
- **Secondary** (exceptional, requires approval): Parameterized SQL queries (read-only ONLY)
- **FORBIDDEN**: Entity Framework, ORM auto-tracking, direct table access

**Naming Conventions** (Immutable):
- **Tables**: `<Domain>_<Entity>` (e.g., `Sec_Users`, `Com_Configs`, `Ref_Lookups`, `Audit_Operations`)
- **Procedures**: `<Domain><Entity><Action>` (e.g., `Sec_Users_Get`, `Sec_Users_Authenticate_User`, `Com_Config_Insert`)

**tState Output Contract** (MANDATORY):
Every stored procedure MUST return: `@tState VARCHAR(500) OUTPUT`

**Format**: `<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>`
- **STATUS**: `OK` or `ERR`
- **ERRORCODE**: `00000`, application error code, or native SQL Server error number
- **DATA**: Relevant value or `N/A`
- **MESSAGE**: Human-readable text

**Examples**:
- `OK~00000~USERID=1024~Login successful`
- `ERR~8134~N/A~Divide by zero error occurred`

**Rationale**: Stored procedures centralize business rules, enforce security, enable optimization, version logic independently, and provide consistent error handling. The database is a rule-enforcing authority, not a passive data store.

**Enforcement**:
- AI must generate stored procedures before application code
- AI must refuse to use Entity Framework or direct SQL
- Every database interaction must call a stored procedure via Dapper
- tState must be evaluated before processing result sets

---

### VIII. Layered Architecture Discipline

**The application MUST follow strict layered architecture with one-directional dependencies.**

**Layers** (in order):
1. **Controllers** (HTTP transport only)
2. **Application** (use case orchestration)
3. **Infrastructure** (technical implementation)
4. **Database** (authoritative data engine)

**Dependency Rule**: Controllers → Application → Infrastructure → Database  
**Reverse dependencies are FORBIDDEN.**

**Layer Responsibilities**:

**Controllers**:
- Handle HTTP transport
- Validate requests
- Invoke Application Layer
- Return standardized API responses
- **FORBIDDEN**: Business logic, database access, Dapper usage, transaction handling

**Application**:
- Orchestrate business use cases
- Enforce application rules
- Coordinate infrastructure calls
- Translate tState into outcomes
- Control application flow
- **FORBIDDEN**: SQL, Dapper, HTTP concerns

**Infrastructure**:
- Execute stored procedures via Dapper
- Map database result sets
- Surface raw tState
- Implement interfaces defined by Application Layer
- **FORBIDDEN**: Business logic, orchestration

**Database**:
- Data integrity enforcement
- Transaction control
- Minimal defensive logic
- Auditing
- Error signaling via tState
- **FORBIDDEN**: Complex workflow orchestration

**Rationale**: Clear boundaries prevent coupling, enable testability, support independent evolution, and ensure single responsibility. Violations create maintenance nightmares.

**Enforcement**:
- AI must respect layer boundaries
- AI must reject bypass implementations
- AI must ask when responsibility is unclear
- If convenience conflicts with architecture, architecture wins

---

## Client-Side Constitution

### Tooling and Frameworks

**Build Tool**: Vite 7.3.1  
**React Version**: 19.2.4  
**Routing**: React Router 7.13.0

### Language Rules

**TypeScript is mandatory** (see Principle II).

### UI and Design System

**Mandatory libraries** (see Principle III):
- `@mui/material`, `@emotion/react`, `@emotion/styled`
- `@mui/icons-material`
- `@mui/x-data-grid` version 8.x
- `@mui/x-tree-view` version 8.x

### Client-Side Logging

**Structured logging mandatory** (see Principle V):
- Configurable levels, sinks
- No console-only logging in production

### Client-Side Testing

**TDD mandatory** (see Principle IV):
- **Tools**: Vitest, Jest, React Testing Library
- **Coverage**: Components, hooks, routing, state transitions

---

## Server-Side Constitution

### Framework

**ASP.NET Core Web API**  
**Version**: ASP.NET Core 10 (latest stable)

**Forbidden**:
- MVC Views
- Razor Pages
- Blazor rendering

### API Standards

**Swagger MANDATORY** (see Principle VI):
- RESTful design
- Versioned endpoints
- Consistent response envelopes

### Server-Side Logging

**Serilog MANDATORY** (see Principle V):
- Structured, configurable, centralized
- Include correlation IDs, request/response metadata, error context

### Server-Side Testing

**TDD mandatory** (see Principle IV):
- **Tools**: xUnit, NUnit
- **Coverage**: Business logic, API endpoints, database interactions

### Data Access Layer

**Dapper MANDATORY** (see Principle VII):
- Primary: Stored procedures
- Secondary (exceptional): Parameterized SQL (read-only only, requires approval)

---

## Database Constitution (AUTHORITATIVE)

### Platform

**SQL Server 2025**

The database is a **rule-enforcing authority**, not a passive persistence layer.

### Naming and Structural Conventions (Immutable)

**Table Naming**: `<Domain>_<Entity>`  
Examples: `Sec_Users`, `Com_Configs`, `Ref_Lookups`, `Audit_Operations`

**Stored Procedure Naming**: `<Domain><Entity><Action>`  
Examples: `Sec_Users_Get`, `Sec_Users_Authenticate_User`, `Com_Config_Insert`

**Rules**:
- Explicit action verbs only
- Single responsibility per procedure
- No ambiguous or overloaded names

### Stored Procedures as Primary Interface

**ALL CRUD operations MUST use stored procedures.**  
Direct table access is **FORBIDDEN**.

### Business Logic Placement

**Allowed inside stored procedures** (minimal only):
- Authentication checks
- Authorization validation
- Integrity enforcement
- Status transitions
- Defensive checks

**Disallowed**:
- Complex business workflows
- Cross-aggregate orchestration

**Rationale**: The database enforces correctness, not business orchestration.

### Standard Output Contract (tState)

**MANDATORY**: Every stored procedure MUST return `@tState VARCHAR(500) OUTPUT`

**Format**: `<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>`

(See Principle VII for details and examples)

### Error Code Policy

**AI MUST define and enforce application-level error code taxonomy.**

**Requirements**:
- Native SQL Server error numbers MUST be preserved and surfaced
- Stored procedures MUST use `TRY…CATCH` and expose: `ERROR_NUMBER()`, `ERROR_MESSAGE()`
- SQL errors must **NEVER** be masked

### Result Sets and tState (Dual Output Model)

**Stored procedures may return result sets AND tState.**

**Consumer Rules**:
1. Evaluate tState FIRST
2. Process result sets ONLY if `STATUS = OK`

### Transaction Ownership

**Transactions are owned INSIDE stored procedures.**

**Mutating procedures MUST**:
- Begin transaction
- Commit on success
- Rollback on failure

**Application-level transaction control is FORBIDDEN** unless explicitly authorized.

### Auditing and Traceability (Mandatory)

**Auditing required for**:
- Authentication attempts
- Security changes
- Insert, update, delete operations

**Audit records MUST include**:
- User identifier
- Timestamp
- Action
- Entity
- Success or failure
- Error code

**Implementation**: Use `Audit_*` tables and/or procedures.

### Schema Versioning and Migration

**DbUp is MANDATORY.**

**Manual production changes are FORBIDDEN.**

**Every migration MUST**:
- Be idempotent
- Be versioned
- Have a paired rollback script

**Example**:
- `003_Add_LastLogin_To_Sec_Users.sql`
- `003_Rollback_Add_LastLogin_To_Sec_Users.sql`

**AI must refuse irreversible migrations** unless explicitly instructed.

---

## Architectural Boundaries

### Architectural Model

**Strict layered architecture with explicit responsibilities** (see Principle VIII).

### Dependency Direction (Critical)

**One-directional flow**: Controllers → Application → Infrastructure → Database

### Layer Responsibilities

(See Principle VIII for full details)

**Controllers**: HTTP transport only  
**Application**: Use case orchestration  
**Infrastructure**: Technical implementation  
**Database**: Authoritative data engine

### Error Flow & Responsibility

**Error propagation**: Database → Infrastructure → Application → Controller

**Rules**:
- Database reports errors
- Application interprets
- Controller formats
- No layer may interpret errors belonging to another layer

### Cross-Cutting Concerns Governance

**Logging**: Middleware or infrastructure sinks only  
**Auditing**: Triggered by Application Layer, executed in Infrastructure/Database  
**Exception Handling**: Centralized middleware  
**Correlation IDs**: Generated at request entry, propagated across layers

### Transaction Boundaries

**Database owns transactions.**  
Application defines intent.  
Infrastructure executes within database boundaries.  
**Application MUST NOT start/manage transactions.**

### Architectural Integrity Clause

**If implementation convenience conflicts with architecture, architecture wins.**

Violating code MUST be rejected and regenerated.

---

## AI Enforcement Rules (CRITICAL)

### AI MUST

- Enforce all naming conventions
- Generate database artifacts BEFORE application code
- Always implement tState
- Preserve native SQL Server error numbers
- Generate DbUp forward AND rollback scripts
- Respect layer boundaries
- Reject bypass implementations
- Ask questions when responsibility is unclear
- Prefer composition over coupling

### AI MUST NOT

- Introduce ORMs (Entity Framework or similar)
- Bypass stored procedures
- Assume schema details
- Suppress database errors
- Drift from this constitution
- Place business logic in controllers
- Place orchestration in infrastructure
- Place application logic in database
- Break dependency direction
- Generate JavaScript without justification
- Use non-MUI UI components without justification
- Write production code before tests

---

## Governance

### Amendment Procedure

**Constitution amendments require**:
1. Written proposal with rationale
2. Impact analysis on existing code and templates
3. Approval from project lead
4. Migration plan (if applicable)
5. Version bump according to semantic versioning

**Version Semantics**:
- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review

**All PRs/reviews must verify compliance with this constitution.**

**Complexity violations must be justified** (see plan-template.md Complexity Tracking section).

### Runtime Guidance

Use `.specify/templates/commands/*.md` files for command-specific execution workflows.

Use `.specify/templates/plan-template.md` Constitution Check section for gate validation.

### Non-Compliance Consequences

**Code that violates this constitution MUST be**:
- Flagged immediately
- Rejected in code review
- Rewritten to comply

**No exceptions without written approval.**

---

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
