# Implementation Chunk: UC-06 to UC-10

**Scope (Use Cases)**: UC-06, UC-07, UC-08, UC-09, UC-10
**Related User Stories**: US-06, US-07, US-08, US-09, US-10
**Acceptance Tests**: AT-UC-06-*, AT-UC-07-*, AT-UC-08-*, AT-UC-09-*, AT-UC-10-*
**Authoritative Sources**: `cms_user_stories.md`, `Use Cases_Scenarios_ATs.md`

## Prerequisites

- Complete shared setup and foundation tasks T001 to T012 from `specs/001-generate-single-combined/tasks.md`.
- Complete UC-01 to UC-05 tasks that establish core user account and submission flows.

## Requirements Reference

- Use case requirements are defined in `specs/001-generate-single-combined/spec.md` for UC-06 through UC-10.
- Do not introduce requirements beyond the authoritative sources.

## API Endpoints (From plan.md / contracts)

- `POST /api/submissions/:id/draft` (UC-06)
- `POST /api/submissions/validate` (UC-07)
- `POST /api/reviewer-assignments` (UC-08, UC-09)
- `POST /api/reviewers/notify` (UC-10)

## Data Model Entities (From data-model.md)

- User Account
- Paper Submission
- Review Assignment

## Task Slice (From tasks.md)

- T029 Implement POST /api/submissions/:id/draft in backend/src/routes/submissions.js (UC-06)
- T030 Implement POST /api/submissions/validate in backend/src/routes/submissions.js (UC-07)
- T032 Add backend/tests/integration/test_submission_draft_api.js for /api/submissions/:id/draft
- T033 Add backend/tests/acceptance/test_uc05_uc07_submission.js mapped to AT-UC-05-* and AT-UC-07-*
- T034 Add backend/tests/acceptance/test_uc06_draft.js mapped to AT-UC-06-*
- T035 Add backend/src/models/review_assignment.js for reviewer assignments
- T036 Add backend/src/models/reviewer_notification.js for notification records
- T037 Add backend/src/services/reviewer_assignment_service.js for assignment and workload checks
- T038 Add backend/src/services/reviewer_notification_service.js for notification logging
- T039 Implement POST /api/reviewer-assignments in backend/src/routes/reviewers.js (UC-08, UC-09)
- T040 Implement POST /api/reviewers/notify in backend/src/routes/reviewers.js (UC-10)
- T042 Add backend/tests/integration/test_reviewer_assignment_api.js
- T044 Add backend/tests/acceptance/test_uc10_notify_reviewers.js mapped to AT-UC-10-*

## Cross-Chunk Links

- T043 covers UC-08, UC-09, and UC-11 acceptance tests and is listed in the UC-11 to UC-15 chunk to keep UC-11 co-located.
- UC-11 invitation response is implemented in the UC-11 to UC-15 chunk.

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
