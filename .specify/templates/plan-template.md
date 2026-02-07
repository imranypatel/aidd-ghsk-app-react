# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Technology Stack Compliance

- [ ] **Client**: React 19.2.4 with Vite 7.3.1, TypeScript mandatory (JavaScript only if technically impossible with justification)
- [ ] **UI Library**: @mui/material, @emotion/react, @emotion/styled, @mui/icons-material, @mui/x-data-grid 8.x, @mui/x-tree-view 8.x
- [ ] **Routing**: React Router 7.13.0
- [ ] **Server**: ASP.NET Core 10 Web API (no MVC Views, Razor Pages, or Blazor)
- [ ] **Database**: SQL Server 2025
- [ ] **Data Access**: Dapper with Stored Procedures (no Entity Framework or ORM auto-tracking)
- [ ] **Logging**: Client structured logging (configurable, no console-only in prod); Server Serilog with correlation IDs

### Architecture Compliance

- [ ] **Application Type**: Full-Stack Enterprise Application confirmed
- [ ] **Client**: Single Page Application (SPA) architecture
- [ ] **Server**: API-only backend (RESTful, versioned, consistent response envelopes)
- [ ] **Database**: Central authoritative data store (rule-enforcing authority)
- [ ] **Hosting**: IIS 10.0 target confirmed

### Database Governance

- [ ] **Naming Conventions**: Tables follow `<Domain>_<Entity>` format (e.g., `Sec_Users`, `Core_Students`)
- [ ] **Stored Procedures**: Follow `<Domain><Entity><Action>` format (e.g., `Sec_Users_Get`, `Sec_Users_Authenticate_User`)
- [ ] **tState Pattern**: ALL stored procedures return `@tState VARCHAR(500) OUTPUT` with format `<STATUS>~<ERRORCODE>~<DATA>~<MESSAGE>`
- [ ] **CRUD Interface**: ALL CRUD operations use stored procedures (no direct table access)
- [ ] **Error Handling**: Application-level error code taxonomy defined; native SQL errors preserved
- [ ] **Transactions**: Owned inside stored procedures (Begin/Commit/Rollback)
- [ ] **Auditing**: Required for authentication, security changes, and mutating operations (Audit_* tables/procedures)
- [ ] **Schema Versioning**: DbUp with idempotent, versioned migrations and paired rollback scripts

### Testing Requirements (TDD Mandatory)

- [ ] **Client Tests**: Vitest/Jest/React Testing Library with coverage for components, hooks, routing, state
- [ ] **Server Tests**: xUnit/NUnit with unit tests for business logic and integration tests for APIs/database
- [ ] **Test-First**: No production code without tests (Red-Green-Refactor cycle enforced)
- [ ] **Database Tests**: All database-dependent logic has test coverage

### API Standards

- [ ] **Swagger**: OpenAPI documentation mandatory for all endpoints
- [ ] **RESTful**: APIs follow REST principles
- [ ] **Versioning**: API versioning enforced
- [ ] **Response Envelopes**: Consistent response structure defined

### Compliance Validation

- [ ] No assumptions about schema, persistence, transactions, or data integrity
- [ ] Clarifying questions documented for any ambiguity
- [ ] Database artifacts generated BEFORE application code
- [ ] All naming conventions enforced
- [ ] No constitutional violations present

### Application Architecture Compliance (Layered Architecture)

- [ ] **4-Layer Model**: Presentation → Application → Infrastructure → Database layers defined
- [ ] **Dependency Direction**: Unidirectional flow enforced (no reverse dependencies, no layer bypassing)
- [ ] **Presentation Layer (Controllers)**: Thin controllers, HTTP concerns only, no business logic or database access
- [ ] **Application Layer (Use Cases)**: Business orchestration, tState interpretation, one service per use case, stateless
- [ ] **Infrastructure Layer (Repositories)**: Dapper execution, stored procedure calls, raw tState surfacing, no business logic
- [ ] **Database Layer**: Transaction ownership, data integrity, minimal defensive logic, no workflow orchestration
- [ ] **Error Flow**: Database → Infrastructure (raw) → Application (interpretation) → Presentation (HTTP mapping)
- [ ] **Cross-Cutting Concerns**: Centralized logging/auditing/exception handling, correlation IDs propagated
- [ ] **Transaction Boundaries**: Database owns transactions, application defines intent, no application-level transaction management
- [ ] **Architectural Integrity**: Architecture wins over implementation convenience

**Status**: ⚠️ MUST PASS ALL GATES BEFORE PROCEEDING

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
