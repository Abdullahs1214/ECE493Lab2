# Implementation Plan: Combined CMS Specification

**Branch**: `001-generate-single-combined` | **Date**: 2026-02-08 | **Spec**: `specs/001-generate-single-combined/spec.md`
**Input**: Feature specification from `/specs/001-generate-single-combined/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. Follow the
project constitution workflow and gates when completing this file.

## Summary

Deliver a minimal, concrete CMS implementation that satisfies UC-01 through
UC-21 without inventing new requirements. Use a simple web stack (Node.js +
Express, SQLite) and a minimal HTML/CSS/JS frontend to support the documented
user flows and acceptance tests.

## Technical Context

**Language/Version**: Node.js 20 LTS  
**Primary Dependencies**: Express 4.x, sqlite3, minimal static frontend  
**Storage**: SQLite (single-file database)  
**Testing**: Unit + integration + acceptance (API-level, aligned to AT-UC-* in `Use Cases_Scenarios_ATs.md`)  
**Target Platform**: Linux server (local dev + CI)  
**Project Type**: Web application (backend REST API + minimal frontend)  
**Performance Goals**: Support UC flows with responsive page/API interactions for a small conference workload  
**Constraints**: Must not invent requirements; all behaviors trace to authoritative sources  
**Scale/Scope**: UC-01 through UC-21 (all documented use cases)  
**Code Style**: `coding_standards.md` (binding for any code guidance)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Requirements and behaviors trace to `cms_user_stories.md` and
      `Use Cases_Scenarios_ATs.md` with no invented scope.
- [x] Clarifications are recorded for every ambiguity.
- [x] Spec covers all major capabilities and user-visible behaviors.
- [x] Plan includes architecture, data model, interfaces/contracts, and testing
      strategy.
- [x] Tasks will be test-driven and include validation, authorization, and
      failure-handling tests where documented.

## Project Structure

### Documentation (this feature)

```text
specs/001-generate-single-combined/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── app.js
└── tests/
    ├── integration/
    └── unit/

frontend/
├── index.html
├── styles.css
└── app.js
```

**Structure Decision**: Simple web app with REST API backend and minimal static frontend.

## Architecture Overview

Single-node web application:
- Express REST API for UC-backed operations
- SQLite for persistence
- Static HTML/CSS/JS for minimal user interactions

## Data Model Summary

See `specs/001-generate-single-combined/data-model.md` for the entity list derived
from the sources. The implementation will use SQLite tables that correspond to
those entities without adding new fields beyond the spec.

## Interfaces / Contracts Summary

Minimal REST endpoints to support documented UC behaviors. Endpoints are defined
only to implement the UC steps and acceptance tests; no extra capabilities are
introduced.

**Authentication & User Management**
- `POST /api/register` (UC-01, UC-02)
- `POST /api/login` (UC-03)
- `POST /api/password` (UC-04)

**Paper Submission**
- `POST /api/submissions` (UC-05)
- `POST /api/submissions/:id/draft` (UC-06)
- `POST /api/submissions/validate` (UC-07)

**Review Assignment & Review**
- `POST /api/reviewer-assignments` (UC-08, UC-09)
- `POST /api/reviewers/notify` (UC-10)
- `POST /api/reviewer-invitations/:id/response` (UC-11)
- `POST /api/reviews` (UC-12, UC-13)
- `POST /api/decisions` (UC-14)
- `POST /api/author-notifications` (UC-15)

**Scheduling**
- `POST /api/schedule/generate` (UC-16)
- `POST /api/schedule/modify` (UC-17)
- `POST /api/schedule/publish` (UC-18)

**Registration & Payment**
- `GET /api/pricing` (UC-19)
- `POST /api/payments` (UC-20)
- `POST /api/tickets` (UC-21)

## Testing Strategy

- Unit tests for validation logic (email, password policy, file validation, workload limits).
- Integration tests for each REST endpoint mapped to UC flows.
- Acceptance tests mapped directly to AT-UC-* scenarios in `Use Cases_Scenarios_ATs.md`.

## Phase 0 Output (Outline & Research)

- `specs/001-generate-single-combined/research.md`

## Phase 1 Output (Design & Contracts)

- `specs/001-generate-single-combined/data-model.md`
- `specs/001-generate-single-combined/contracts/openapi.yaml`
- `specs/001-generate-single-combined/contracts/README.md`
- `specs/001-generate-single-combined/quickstart.md`

## Constitution Check (Post-Design)

- [x] Requirements and behaviors trace to authoritative sources.
- [x] Clarifications remain resolved and recorded in the spec.
- [x] Data model and contracts reflect only documented requirements.
