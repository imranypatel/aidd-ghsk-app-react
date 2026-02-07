<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0
Change Type: MINOR (New principle section added with material guidance)
Ratified: 2026-02-08
Last Amended: 2026-02-08

Summary of v1.1.0 Changes:
- Added Section VIII: Application Architecture & Boundaries (NON-NEGOTIABLE)
- Defined strictly layered architecture with 4 layers (Presentation, Application, Infrastructure, Database)
- Established unidirectional dependency flow and explicit responsibility boundaries
- Added architectural integrity clause: architecture wins over implementation convenience

Previous Version (1.0.0):
- Initial constitution for the TRANDTS Enterprise Management System
- Established 7 core principles governing AI-assisted development
- Defined locked technology stack and architectural constraints
- Established database-first governance model with tState pattern
- Created AI enforcement rules for strict compliance

Principles (1.0.0):
1. Constitutional Authority (Non-Negotiable Rules)
2. System Architecture (Locked Stack)
3. Client-Side Constitution (React/TypeScript/MUI)
4. Server & Middleware Constitution (ASP.NET Core Web API)
5. Database Constitution (SQL Server 2025, Stored Procedures, tState)
6. AI Enforcement Rules (Critical Compliance)
7. Final Directive (Authority and Compliance)

Principles Added (1.1.0):
8. Application Architecture & Boundaries (Layered Architecture, Dependency Flow)

Templates Updated (1.0.0):
✅ plan-template.md
   - Added comprehensive Constitution Check section with specific gates
   - Technology stack compliance checklist
   - Database governance validation
   - Testing requirements (TDD)
   - API standards
   - Compliance validation gates

✅ spec-template.md
   - Added constitutional constraints guidance to Requirements section
   - Documents locked technology stack
   - References mandatory patterns (stored procedures, tState, TDD)
   - Links to constitution for complete constraints

✅ tasks-template.md
   - Updated Phase 2 (Foundational) with database-first infrastructure tasks
   - Added DbUp, tState pattern, auditing infrastructure tasks
   - Emphasized database artifacts BEFORE application code
   - Added TDD mandatory guidance to test sections
   - Documented client/server testing tool requirements

Templates Updated (1.1.0):
✅ plan-template.md
   - Added Application Architecture Compliance section
   - Layer boundary validation checklist (4 layers, dependency direction)
   - Controller/Application/Infrastructure/Database layer responsibility checks
   - Error flow, cross-cutting concerns, transaction boundary validation

✅ tasks-template.md
   - Added architecture layer setup tasks to Phase 2 (Foundational)
   - Layer interface contracts and dependency inversion
   - Global exception middleware, correlation ID propagation
   - Updated User Story implementation tasks with layer-specific work
   - Added layer boundary validation task

Follow-up TODOs:
- Update plan-template.md Constitution Check with layer boundary validation
- Update tasks-template.md with architecture validation tasks
- Create DbUp migration script templates with rollback pairs
- Define specific application-level error codes (beyond SQL Server native errors)
- Document tState parsing patterns/utilities for client consumption
- Create stored procedure code templates with tState implementation
- Establish code review checklist aligned with constitutional compliance gates
- Create layer-specific code templates (Controller, Application Service, Repository)
-->

# TRANDTS Enterprise Management System Constitution

**Client**: TRANDTS  
**Application**: Enterprise Management System  
**Hosting Target**: IIS 10.0  
**Authority Level**: HIGHEST (NON-NEGOTIABLE)

---

## Core Principles

### I. Constitutional Authority (NON-NEGOTIABLE)

This constitution defines absolute, non-negotiable rules governing ALL AI-assisted development for the Enterprise Management System.

**Rules**:
- Any AI agent, automation, generator, refactor, or recommendation MUST strictly comply with this constitution
- If ambiguity exists, the AI MUST ask clarifying questions before proceeding
- Assumptions are FORBIDDEN, especially regarding database schema, persistence, transactions, or data integrity
- Deviation from this constitution requires explicit instruction from authorized personnel
- Compliance is mandatory and supersedes all other practices

**Rationale**: Prevents architectural drift, ensures consistency, protects data integrity, and maintains enterprise-grade quality standards across all AI-assisted work.

---

### II. System Architecture (LOCKED)

The technology stack is immutable and MUST NOT be substituted without explicit approval.

**Architecture**:
- Application Type: Full-Stack Enterprise Application
- Client: Single Page Application (SPA)
- Server: API-only Backend
- Database: Central Authoritative Data Store

**Technology Stack**:
- **Client**: React 19.2.4 (Vite 7.3.1), TypeScript mandatory
- **Server**: ASP.NET Core 10 Web API (latest stable)
- **Database**: SQL Server 2025 (existing development environment)

**Forbidden**:
- No substitutions, parallel stacks, or alternative frameworks
- No MVC Views, Razor Pages, or Blazor rendering on server
- No Entity Framework or ORM auto-tracking

**Rationale**: Locked stack prevents technology sprawl, ensures team expertise alignment, maintains supportability, and leverages existing infrastructure investments.

---

### III. Client-Side Constitution

TypeScript is mandatory. JavaScript allowed ONLY as last resort when TypeScript is technically impossible (requires justification and documentation).

**Mandatory Libraries**:
- @mui/material (Material Design compliance)
- @emotion/react, @emotion/styled
- @mui/icons-material
- @mui/x-data-grid (version 8.x)
- @mui/x-tree-view (version 8.x)
- React Router 7.13.0

**Requirements**:
- Follow Material Design principles
- Accessible by default
- Support enterprise-scale datasets
- Structured logging for all significant events (configurable levels, sinks)
- Console-only logging FORBIDDEN in production

**Testing (Mandatory TDD)**:
- Approved tools: Vitest, Jest, React Testing Library
- No production code without tests
- Coverage MUST include: components, hooks, routing, state transitions
- Snapshot testing only when meaningful

**Rationale**: TypeScript prevents runtime type errors; MUI provides consistent enterprise UI; structured logging enables production debugging; TDD ensures client reliability.

---

### IV. Server & Middleware Constitution

ASP.NET Core Web API is the exclusive server framework.

**Mandatory Standards**:
- Swagger (OpenAPI) for documentation, manual testing, and API contract definition
- RESTful APIs with consistent response envelopes
- API versioning enforced
- Serilog for structured, configurable, centralized logging (correlation IDs, request/response metadata, error context)

**Testing (Mandatory TDD)**:
- Approved tools: xUnit, NUnit
- Business logic MUST be unit tested
- Integration tests REQUIRED for APIs and database interactions
- No database-dependent logic without test coverage

**Data Access**:
- Dapper is MANDATORY
- Primary access: Stored Procedures
- Secondary (exceptional, requires approval): Parameterized SQL queries (read-only only)
- FORBIDDEN: Entity Framework, ORM auto-tracking, direct table access

**Rationale**: API-only keeps client/server decoupled; Swagger ensures contract clarity; Serilog provides production diagnostics; Dapper with stored procedures enforces database governance.

---

### V. Database Constitution (AUTHORITATIVE)

SQL Server 2025 is the rule-enforcing authority, not a passive persistence layer.

**Naming Conventions (Immutable)**:
- Tables: `<Domain>_<Entity>` (e.g., `Sec_Users`, `Core_Students`, `Ref_Lookups`)
- Stored Procedures: `<Domain><Entity><Action>` (e.g., `Sec_Users_Get`, `Sec_Users_Authenticate_User`)
- Explicit action verbs only; single responsibility per procedure

**Stored Procedures as Primary Interface**:
- ALL CRUD operations MUST use stored procedures
- Direct table access FORBIDDEN
- Dapper calls procedures by name

**Standard Output Contract (tState)**:
- Every procedure MUST return: `@tState VARCHAR(500) OUTPUT`
- Format: `<STATUS>~<ERRORCODE>~<DATA>~<MESSAGE>`
  - STATUS: `OK` or `ERR`
  - ERRORCODE: `00000`, application error code, or SQL Server error number
  - DATA: relevant value or `N/A`
  - MESSAGE: human-readable explanation
- Examples:
  - `OK~00000~USERID=1024~Login successful`
  - `ERR~8134~N/A~Divide by zero error occurred`

**Error Handling**:
- AI MUST define application-level error code taxonomy
- Native SQL Server error numbers MUST be preserved and surfaced
- Procedures MUST use TRY...CATCH and expose ERROR_NUMBER() and ERROR_MESSAGE()
- SQL errors MUST NOT be masked

**Dual Output Model**:
- Procedures may return result sets
- tState MUST ALWAYS be returned alongside result sets
- Consumers MUST evaluate tState first, process result sets only if STATUS = OK

**Transaction Ownership**:
- Transactions owned inside stored procedures
- All mutating procedures MUST: Begin transaction, Commit on success, Rollback on failure
- Application-level transaction control FORBIDDEN unless explicitly authorized

**Auditing (Mandatory)**:
- Required for: authentication attempts, security changes, insert/update/delete operations
- Audit records MUST include: user identifier, timestamp, action, entity, success/failure, error code
- Implemented using Audit_* tables/procedures

**Schema Versioning**:
- DbUp is MANDATORY
- Manual production changes FORBIDDEN
- Every migration MUST: be idempotent, be versioned, have paired rollback script
- Example: `003_Add_LastLogin_To_Sec_Users.sql` + `003_Rollback_Add_LastLogin_To_Sec_Users.sql`
- AI MUST refuse irreversible migrations unless explicitly instructed

**Business Logic Placement**:
- Allowed in procedures (minimal): authentication checks, authorization validation, integrity enforcement, status transitions, defensive checks
- Disallowed: complex business workflows, cross-aggregate orchestration
- Database enforces correctness, not business orchestration

**Rationale**: Database-as-authority ensures data integrity at the source; tState provides consistent error handling; stored procedures enforce encapsulation; DbUp enables safe schema evolution.

---

### VI. AI Enforcement Rules (CRITICAL)

The AI agent MUST enforce all constitutional rules during every operation.

**AI MUST**:
- Enforce all naming conventions
- Generate database artifacts BEFORE application code
- ALWAYS implement tState pattern
- Preserve native SQL Server error numbers
- Generate DbUp forward and rollback scripts
- Ask clarifying questions when ambiguity exists
- Validate compliance before code generation

**AI MUST NOT**:
- Introduce ORMs (Entity Framework, etc.)
- Bypass stored procedures
- Assume schema details
- Suppress database errors
- Drift from this constitution
- Proceed with assumptions

**Rationale**: AI enforcement ensures constitutional compliance, prevents architectural violations, maintains consistency, and protects enterprise standards.

---

### VIII. Application Architecture & Boundaries (NON-NEGOTIABLE)

The application follows a strictly layered architecture with explicit responsibility boundaries that are enforceable, not advisory.

**Architectural Model (4 Layers)**:
1. **Presentation Layer** (API Controllers)
2. **Application Layer** (Use Case Orchestration)
3. **Infrastructure Layer** (Technical Implementation)
4. **Database Layer** (Authoritative Data Engine)

**Dependency Direction (CRITICAL)**:
- Dependencies MUST flow in one direction only: Presentation → Application → Infrastructure → Database
- Reverse dependencies are STRICTLY FORBIDDEN
- No layer may bypass another layer

**Layer 1: Presentation Layer (API Controllers)**:
- **Scope**: ASP.NET Core Web API Controllers
- **Responsibilities**: Handle HTTP transport, validate request shape (not business rules), invoke Application Layer use cases, return standardized API responses
- **Forbidden**: Business logic, database access (direct or indirect), Dapper usage, transaction handling, error code interpretation, cross-cutting concerns implementation
- **Rule**: Controllers MUST be thin and MUST NOT contain decision-making logic

**Layer 2: Application Layer (Use Case Orchestration)**:
- **Scope**: Application Services / Use Case Handlers
- **Responsibilities**: Orchestrate business use cases, enforce application-level rules, coordinate multiple infrastructure calls, translate database tState into application outcomes, control application flow
- **Rules**: One service per use case, stateless services, explicit input/output models
- **Allowed**: Business decisions, validation logic, conditional flows
- **Forbidden**: SQL or Dapper code, stored procedure execution, infrastructure implementation details
- **Authority**: PRIMARY owner of business behavior

**Layer 3: Infrastructure Layer (Technical Implementation)**:
- **Scope**: Dapper repositories, external system integrations, logging sinks, audit writers
- **Responsibilities**: Execute stored procedures, map database result sets, surface raw tState without interpretation, implement interfaces defined by Application Layer
- **Rules**: Infrastructure depends on Application contracts (not vice versa), no business logic, no decision-making
- **Forbidden**: HTTP concerns, use case orchestration, error translation
- **Nature**: Mechanical executor

**Layer 4: Database Layer (Authoritative Data Engine)**:
- **Scope**: SQL Server 2025
- **Responsibilities**: Data integrity enforcement, transaction control, minimal defensive logic, auditing, error signaling via tState
- **Rules**: Owns transactions, owns data consistency, does not orchestrate workflows
- **Constraint**: Database never calls upward layers

**Error Flow & Responsibility**:
- Flow: Database → Infrastructure (raw tState + result sets) → Application Layer (interpretation and decision) → Presentation Layer (HTTP mapping)
- Database reports errors, Application decides meaning, Presentation formats response
- No layer may interpret errors belonging to another layer

**Cross-Cutting Concerns Governance**:
- **Logging**: Implemented via middleware and infrastructure sinks (never inline in business logic)
- **Auditing**: Triggered by Application Layer, executed by Infrastructure or Database
- **Exception Handling**: Centralized global exception middleware (controllers must not catch general exceptions)
- **Correlation IDs**: Generated at request entry, propagated across all layers

**Transaction Boundaries**:
- Database Layer owns database transactions
- Application Layer defines transactional intent
- Infrastructure executes within database-defined boundaries
- Application code MUST NOT start or manage database transactions

**AI Enforcement (Architecture)**:
- AI MUST: Generate code respecting layer boundaries, reject implementations that bypass layers, ask questions when responsibility is unclear, prefer composition over coupling
- AI MUST NOT: Place business logic in controllers, place orchestration in infrastructure, place application logic in database, break dependency direction

**Architectural Integrity Clause**:
- If any architectural rule conflicts with implementation convenience, THE ARCHITECTURE WINS
- If any generated code violates this section, it MUST be rejected and regenerated

**Rationale**: Layered architecture enforces separation of concerns, prevents coupling, ensures testability, maintains clean boundaries, and enables independent evolution of each layer without affecting others.

---

### IX. Final Directive (AUTHORITY AND COMPLIANCE)

This constitution is authoritative and supersedes all other practices, preferences, or suggestions.

**Mandate**:
- Compliance is MANDATORY
- Deviation requires explicit written instruction
- When in doubt, ask—do not assume
- All work products MUST align with constitutional principles
- Code reviews MUST verify constitutional compliance

**Rationale**: Establishes clear hierarchy of authority, prevents drift, ensures consistent quality, and maintains enterprise governance.

---

## Governance

This constitution supersedes all other development practices, coding standards, and AI behaviors.

**Amendment Process**:
- Amendments require explicit approval from project authority
- Version number MUST increment following semantic versioning:
  - MAJOR: Backward incompatible governance/principle removals or redefinitions
  - MINOR: New principle/section added or materially expanded guidance
  - PATCH: Clarifications, wording, typo fixes, non-semantic refinements
- All amendments MUST include rationale and impact analysis
- Migration plan required for breaking changes

**Compliance Review**:
- All pull requests MUST verify constitutional compliance
- Code reviews MUST check:
  - Technology stack alignment
  - Naming convention adherence
  - tState implementation
  - Stored procedure usage
  - Audit trail presence
  - Test coverage
  - Layer boundary respect
  - Dependency direction adherence
- Complexity introduced MUST be justified against constitutional principles
- Constitutional violations MUST be rejected

**Development Guidance**:
- Use this constitution as the primary reference during all AI-assisted development
- Refer to `.specify/templates/` for implementation templates aligned with this constitution
- When implementing features, validate against constitutional principles at each phase

**Version**: 1.1.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
