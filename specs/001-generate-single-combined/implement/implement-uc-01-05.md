# Implementation Chunk: UC-01 to UC-05

**Scope (Use Cases)**: UC-01, UC-02, UC-03, UC-04, UC-05
**Related User Stories**: US-01, US-02, US-03, US-04, US-05
**Acceptance Tests**: AT-UC-01-*, AT-UC-02-*, AT-UC-03-*, AT-UC-04-*, AT-UC-05-*
**Authoritative Sources**: `cms_user_stories.md`, `Use Cases_Scenarios_ATs.md`

## Prerequisites

- Complete shared setup and foundation tasks T001 to T012 from `specs/001-generate-single-combined/tasks.md`.
- Follow architecture and constraints in `specs/001-generate-single-combined/plan.md`.

## Requirements Reference

- Use case requirements are defined in `specs/001-generate-single-combined/spec.md` for UC-01 through UC-05.
- Do not introduce requirements beyond the authoritative sources.

## API Endpoints (From plan.md / contracts)

- `POST /api/register` (UC-01, UC-02)
- `POST /api/login` (UC-03)
- `POST /api/password` (UC-04)
- `POST /api/submissions` (UC-05)

## Data Model Entities (From data-model.md)

- User Account
- Paper Submission

## Task Slice (From tasks.md)

- T013 Add backend/src/models/user.js for user persistence
- T014 Add backend/src/services/user_service.js for registration logic
- T015 Implement POST /api/register in backend/src/routes/auth.js (UC-01, UC-02)
- T016 Add backend/tests/unit/test_password_policy.js for password validation
- T017 Add backend/tests/integration/test_register_api.js for /api/register
- T018 Add backend/tests/acceptance/test_uc01_register.js mapped to AT-UC-01-*
- T019 Add backend/src/services/auth_service.js for login verification
- T020 Implement POST /api/login in backend/src/routes/auth.js (UC-03)
- T021 Implement POST /api/password in backend/src/routes/auth.js (UC-04)
- T022 Add backend/tests/integration/test_login_api.js for /api/login
- T023 Add backend/tests/integration/test_password_change_api.js for /api/password
- T024 Add backend/tests/acceptance/test_uc03_login.js mapped to AT-UC-03-*
- T025 Add backend/tests/acceptance/test_uc04_password_change.js mapped to AT-UC-04-*
- T026 Add backend/src/models/submission.js for submission persistence
- T027 Add backend/src/services/submission_service.js for submission workflow
- T028 Implement POST /api/submissions in backend/src/routes/submissions.js (UC-05)
- T031 Add backend/tests/integration/test_submission_api.js for /api/submissions

## Cross-Chunk Links

- T033 adds an acceptance test covering UC-05 and UC-07. It is listed in the UC-06 to UC-10 chunk to keep UC-07 co-located.
- UC-06 and UC-07 draft/validation endpoints are implemented in the UC-06 to UC-10 chunk.

## Checklist Focus

- `specs/001-generate-single-combined/checklists/requirements.md`
- `specs/001-generate-single-combined/checklists/api.md`
- `specs/001-generate-single-combined/checklists/data-model.md`
- `specs/001-generate-single-combined/checklists/security.md`
- `specs/001-generate-single-combined/checklists/ux.md`

## Constitution Check

- [x] All requirements trace to the authoritative sources.
- [x] No new fields, actors, or behaviors were introduced.
- [x] Tasks and endpoints are derived from existing plan and tasks artifacts.
