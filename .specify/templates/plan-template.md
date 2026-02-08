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
- [ ] Client stack: React 19.2.4 + Vite 7.3.1 + React Router 7.13.0 (no substitutions)
- [ ] Server stack: ASP.NET Core 10 Web API only (no MVC/Razor/Blazor)
- [ ] Database: SQL Server 2025 with stored procedures (no ORM)
- [ ] Data access: Dapper only (Entity Framework FORBIDDEN)

### Language & Type Safety
- [ ] TypeScript mandatory for all client code (JavaScript requires justification)
- [ ] Explicit typing (no `any` unless justified)

### UI Framework Compliance
- [ ] MUI (@mui/material, @emotion, @mui/icons-material) mandatory
- [ ] MUI Data Grid 8.x and Tree View 8.x for data display
- [ ] Accessibility compliance (WCAG 2.1 AA minimum)

### Testing Requirements (TDD NON-NEGOTIABLE)
- [ ] Tests written BEFORE implementation
- [ ] Client: Vitest/Jest + React Testing Library
- [ ] Server: xUnit/NUnit
- [ ] Coverage: components, hooks, business logic, API endpoints, database interactions

### Database Architecture
- [ ] ALL database access via stored procedures (direct SQL FORBIDDEN)
- [ ] Table naming: `<Domain>_<Entity>` (e.g., `Sec_Users`, `Com_Configs`)
- [ ] Procedure naming: `<Domain><Entity><Action>` (e.g., `Sec_Users_Get`)
- [ ] tState output contract: `@tState VARCHAR(500) OUTPUT` format `<STATUS>~<ERRORCODE>~<PROCEDURE_NAME>~<DATA>~<MESSAGE>`
- [ ] DbUp migrations with forward + rollback scripts
- [ ] Transactions owned by stored procedures (not application)

### Layered Architecture Compliance
- [ ] Strict layers: Controllers → Application → Infrastructure → Database
- [ ] No reverse dependencies
- [ ] Controllers: HTTP transport only (no business logic, no Dapper)
- [ ] Application: Use case orchestration (no SQL, no HTTP concerns)
- [ ] Infrastructure: Dapper execution, tState surfacing (no business logic)
- [ ] Database: Data integrity, transactions, auditing (no workflow orchestration)

### Logging & Observability
- [ ] Client: Structured logging (no console-only in production)
- [ ] Server: Serilog mandatory with correlation IDs
- [ ] Sensitive data masking

### API Standards
- [ ] RESTful design with versioned endpoints
- [ ] Swagger documentation mandatory
- [ ] Consistent response envelopes

### Auditing Requirements
- [ ] Authentication attempts logged
- [ ] Security changes logged
- [ ] All CUD operations logged with user, timestamp, action, entity, success/failure, error code

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
