# Implementation Chunk: UC-16 to UC-21

**Scope (Use Cases)**: UC-16, UC-17, UC-18, UC-19, UC-20, UC-21
**Related User Stories**: US-16, US-17, US-18, US-19, US-20, US-21
**Acceptance Tests**: AT-UC-16-*, AT-UC-17-*, AT-UC-18-*, AT-UC-19-*, AT-UC-20-*, AT-UC-21-*
**Authoritative Sources**: `cms_user_stories.md`, `Use Cases_Scenarios_ATs.md`

## Prerequisites

- Complete shared setup and foundation tasks T001 to T012 from `specs/001-generate-single-combined/tasks.md`.
- Complete UC-11 to UC-15 tasks so accepted-paper decisions are available for scheduling.

## Requirements Reference

- Use case requirements are defined in `specs/001-generate-single-combined/spec.md` for UC-16 through UC-21.
- Do not introduce requirements beyond the authoritative sources.

## API Endpoints (From plan.md / contracts)

- `POST /api/schedule/generate` (UC-16)
- `POST /api/schedule/modify` (UC-17)
- `POST /api/schedule/publish` (UC-18)
- `GET /api/pricing` (UC-19)
- `POST /api/payments` (UC-20)
- `POST /api/tickets` (UC-21)

## Data Model Entities (From data-model.md)

- Paper Submission
- Conference Schedule
- Conference Pricing
- Registration Payment
- Ticket / Confirmation

## Task Slice (From tasks.md)

- T053 Add backend/src/models/schedule_item.js for schedule items
- T054 Add backend/src/services/schedule_service.js for generate/modify/publish
- T055 Implement POST /api/schedule/generate in backend/src/routes/schedule.js (UC-16)
- T056 Implement POST /api/schedule/modify in backend/src/routes/schedule.js (UC-17)
- T057 Implement POST /api/schedule/publish in backend/src/routes/schedule.js (UC-18)
- T058 Add backend/tests/integration/test_schedule_api.js
- T059 Add backend/tests/acceptance/test_uc16_uc18_schedule.js mapped to AT-UC-16-*, AT-UC-17-*, AT-UC-18-*
- T060 Add backend/src/models/pricing.js for registration pricing
- T061 Add backend/src/models/payment.js for payment records
- T062 Add backend/src/models/ticket.js for ticket confirmations
- T063 Add backend/src/services/payment_service.js for payment processing
- T064 Implement GET /api/pricing in backend/src/routes/pricing.js (UC-19)
- T065 Implement POST /api/payments in backend/src/routes/payments.js (UC-20)
- T066 Implement POST /api/tickets in backend/src/routes/tickets.js (UC-21)
- T067 Add backend/tests/integration/test_payment_api.js
- T068 Add backend/tests/acceptance/test_uc19_uc21_payments.js mapped to AT-UC-19-*, AT-UC-20-*, AT-UC-21-*

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
