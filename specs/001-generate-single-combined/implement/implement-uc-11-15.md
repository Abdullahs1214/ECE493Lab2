# Implementation Chunk: UC-11 to UC-15

**Scope (Use Cases)**: UC-11, UC-12, UC-13, UC-14, UC-15
**Related User Stories**: US-11, US-12, US-13, US-14, US-15
**Acceptance Tests**: AT-UC-11-*, AT-UC-12-*, AT-UC-13-*, AT-UC-14-*, AT-UC-15-*
**Authoritative Sources**: `cms_user_stories.md`, `Use Cases_Scenarios_ATs.md`

## Prerequisites

- Complete shared setup and foundation tasks T001 to T012 from `specs/001-generate-single-combined/tasks.md`.
- Complete UC-06 to UC-10 tasks that establish reviewer assignment and notification flows.

## Requirements Reference

- Use case requirements are defined in `specs/001-generate-single-combined/spec.md` for UC-11 through UC-15.
- Do not introduce requirements beyond the authoritative sources.

## API Endpoints (From plan.md / contracts)

- `POST /api/reviewer-invitations/:id/response` (UC-11)
- `POST /api/reviews` (UC-12, UC-13)
- `POST /api/decisions` (UC-14)
- `POST /api/author-notifications` (UC-15)

## Data Model Entities (From data-model.md)

- User Account
- Paper Submission
- Review Assignment
- Review
- Editorial Decision

## Task Slice (From tasks.md)

- T041 Implement POST /api/reviewer-invitations/:id/response in backend/src/routes/reviewers.js (UC-11)
- T043 Add backend/tests/acceptance/test_uc08_uc11_assignments.js mapped to AT-UC-08-*, AT-UC-09-*, AT-UC-11-*
- T045 Add backend/src/models/review.js for reviews
- T046 Add backend/src/services/review_service.js for review submission
- T047 Add backend/src/services/decision_service.js for accept/reject decisions
- T048 Implement POST /api/reviews in backend/src/routes/reviews.js (UC-12, UC-13)
- T049 Implement POST /api/decisions in backend/src/routes/reviews.js (UC-14)
- T050 Implement POST /api/author-notifications in backend/src/routes/notifications.js (UC-15)
- T051 Add backend/tests/integration/test_review_api.js
- T052 Add backend/tests/acceptance/test_uc12_uc15_reviews.js mapped to AT-UC-12-*, AT-UC-13-*, AT-UC-14-*, AT-UC-15-*

## Cross-Chunk Links

- T043 also covers UC-08 and UC-09 acceptance tests; coordinate with the UC-06 to UC-10 chunk.

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
