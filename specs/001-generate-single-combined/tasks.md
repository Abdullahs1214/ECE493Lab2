# Tasks: Combined CMS Specification

**Input**: Design documents from `/specs/001-generate-single-combined/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Required (unit, integration, acceptance) per plan.md and AT-UC-* scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan (backend/, frontend/)
- [x] T002 Initialize Node.js project in backend/package.json with Express and sqlite3 dependencies
- [x] T003 [P] Add backend/src/app.js with Express app bootstrap and JSON middleware
- [x] T004 [P] Add frontend/index.html, frontend/styles.css, frontend/app.js (minimal static shell)
- [x] T005 [P] Add backend/src/routes/index.js to register API routes
- [x] T006 [P] Add backend/tests/ directory structure (unit/, integration/, acceptance/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T007 Create backend/src/models/db.js to manage SQLite connection
- [x] T008 Create backend/src/models/schema.sql with tables for users, submissions, review_assignments, reviews, decisions, schedule_items, pricing, payments, tickets, reviewer_notifications
- [x] T009 Implement backend/src/models/migrate.js to initialize schema.sql on startup
- [x] T010 [P] Add backend/src/services/validation.js with shared validators (email format, password policy, file constraints)
- [x] T011 [P] Add backend/src/services/errors.js with standard error response helpers
- [x] T012 Add backend/src/middleware/auth.js for session-based authentication (logged-in vs not logged-in checks only)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Register Account (Priority: P1) 🎯 MVP

**Goal**: New users create a CMS account (UC-01/UC-02).

**Independent Test**: Register with valid email/password and get success; invalid inputs return errors.

### Tests and Implementation

- [x] T013 [P] [US1] Add backend/src/models/user.js for user persistence
- [x] T014 [P] [US1] Add backend/src/services/user_service.js for registration logic
- [x] T015 [US1] Implement POST /api/register in backend/src/routes/auth.js (UC-01, UC-02)
- [x] T016 [P] [US1] Add backend/tests/unit/test_password_policy.js for password validation
- [x] T017 [P] [US1] Add backend/tests/integration/test_register_api.js for /api/register
- [x] T018 [P] [US1] Add backend/tests/acceptance/test_uc01_register.js mapped to AT-UC-01-*

---

## Phase 4: User Story 2 - Log In and Change Password (Priority: P1)

**Goal**: Registered users authenticate and can change passwords (UC-03, UC-04).

**Independent Test**: Login succeeds with valid credentials; password change updates credentials and enforces policy.

### Tests and Implementation

- [x] T019 [P] [US2] Add backend/src/services/auth_service.js for login verification
- [x] T020 [US2] Implement POST /api/login in backend/src/routes/auth.js (UC-03)
- [x] T021 [US2] Implement POST /api/password in backend/src/routes/auth.js (UC-04)
- [x] T022 [P] [US2] Add backend/tests/integration/test_login_api.js for /api/login
- [x] T023 [P] [US2] Add backend/tests/integration/test_password_change_api.js for /api/password
- [x] T024 [P] [US2] Add backend/tests/acceptance/test_uc03_login.js mapped to AT-UC-03-*
- [x] T025 [P] [US2] Add backend/tests/acceptance/test_uc04_password_change.js mapped to AT-UC-04-*

---

## Phase 5: User Story 3 - Submit Paper (Priority: P1)

**Goal**: Authors submit papers with metadata and files (UC-05, UC-06, UC-07).

**Independent Test**: Submission and draft save succeed with valid metadata/file; invalid file/fields fail.

### Tests and Implementation

- [x] T026 [P] [US3] Add backend/src/models/submission.js for submission persistence
- [x] T027 [P] [US3] Add backend/src/services/submission_service.js for submission workflow
- [x] T028 [US3] Implement POST /api/submissions in backend/src/routes/submissions.js (UC-05)
- [x] T029 [US3] Implement POST /api/submissions/:id/draft in backend/src/routes/submissions.js (UC-06)
- [x] T030 [US3] Implement POST /api/submissions/validate in backend/src/routes/submissions.js (UC-07)
- [x] T031 [P] [US3] Add backend/tests/integration/test_submission_api.js for /api/submissions
- [x] T032 [P] [US3] Add backend/tests/integration/test_submission_draft_api.js for /api/submissions/:id/draft
- [x] T033 [P] [US3] Add backend/tests/acceptance/test_uc05_uc07_submission.js mapped to AT-UC-05-* and AT-UC-07-*
- [x] T034 [P] [US3] Add backend/tests/acceptance/test_uc06_draft.js mapped to AT-UC-06-*

---

## Phase 6: User Story 4 - Assign Reviewers (Priority: P2)

**Goal**: Editors assign reviewers, enforce workload limits, and notify reviewers (UC-08, UC-09, UC-10, UC-11).

**Independent Test**: Assignment succeeds within limit; over-limit rejected; notification recorded; invitation response recorded.

### Tests and Implementation

- [x] T035 [P] [US4] Add backend/src/models/review_assignment.js for reviewer assignments
- [x] T036 [P] [US4] Add backend/src/models/reviewer_notification.js for notification records
- [x] T037 [P] [US4] Add backend/src/services/reviewer_assignment_service.js for assignment and workload checks
- [x] T038 [P] [US4] Add backend/src/services/reviewer_notification_service.js for notification logging
- [x] T039 [US4] Implement POST /api/reviewer-assignments in backend/src/routes/reviewers.js (UC-08, UC-09)
- [x] T040 [US4] Implement POST /api/reviewers/notify in backend/src/routes/reviewers.js (UC-10)
- [ ] T041 [US4] Implement POST /api/reviewer-invitations/:id/response in backend/src/routes/reviewers.js (UC-11)
- [x] T042 [P] [US4] Add backend/tests/integration/test_reviewer_assignment_api.js
- [ ] T043 [P] [US4] Add backend/tests/acceptance/test_uc08_uc11_assignments.js mapped to AT-UC-08-*, AT-UC-09-*, AT-UC-11-*
- [x] T044 [P] [US4] Add backend/tests/acceptance/test_uc10_notify_reviewers.js mapped to AT-UC-10-*

---

## Phase 7: User Story 5 - Submit Review (Priority: P2)

**Goal**: Reviewers submit review forms for assigned papers (UC-12, UC-13, UC-14, UC-15).

**Independent Test**: Review submission stored and decisions/notifications triggered per UC steps.

### Tests and Implementation

- [ ] T045 [P] [US5] Add backend/src/models/review.js for reviews
- [ ] T046 [P] [US5] Add backend/src/services/review_service.js for review submission
- [ ] T047 [P] [US5] Add backend/src/services/decision_service.js for accept/reject decisions
- [ ] T048 [US5] Implement POST /api/reviews in backend/src/routes/reviews.js (UC-12, UC-13)
- [ ] T049 [US5] Implement POST /api/decisions in backend/src/routes/reviews.js (UC-14)
- [ ] T050 [US5] Implement POST /api/author-notifications in backend/src/routes/notifications.js (UC-15)
- [ ] T051 [P] [US5] Add backend/tests/integration/test_review_api.js
- [ ] T052 [P] [US5] Add backend/tests/acceptance/test_uc12_uc15_reviews.js mapped to AT-UC-12-*, AT-UC-13-*, AT-UC-14-*, AT-UC-15-*

---

## Phase 8: User Story 6 - Publish Schedule (Priority: P3)

**Goal**: Admins generate and editors modify/publish schedule (UC-16, UC-17, UC-18).

**Independent Test**: Schedule generate/modify/publish endpoints enforce conflict rules.

### Tests and Implementation

- [ ] T053 [P] [US6] Add backend/src/models/schedule_item.js for schedule items
- [ ] T054 [P] [US6] Add backend/src/services/schedule_service.js for generate/modify/publish
- [ ] T055 [US6] Implement POST /api/schedule/generate in backend/src/routes/schedule.js (UC-16)
- [ ] T056 [US6] Implement POST /api/schedule/modify in backend/src/routes/schedule.js (UC-17)
- [ ] T057 [US6] Implement POST /api/schedule/publish in backend/src/routes/schedule.js (UC-18)
- [ ] T058 [P] [US6] Add backend/tests/integration/test_schedule_api.js
- [ ] T059 [P] [US6] Add backend/tests/acceptance/test_uc16_uc18_schedule.js mapped to AT-UC-16-*, AT-UC-17-*, AT-UC-18-*

---

## Phase 9: User Story 7 - Register and Pay (Priority: P3)

**Goal**: Attendees view pricing, pay, and receive tickets (UC-19, UC-20, UC-21).

**Independent Test**: Pricing retrieved, payment recorded, ticket issued on success.

### Tests and Implementation

- [ ] T060 [P] [US7] Add backend/src/models/pricing.js for registration pricing
- [ ] T061 [P] [US7] Add backend/src/models/payment.js for payment records
- [ ] T062 [P] [US7] Add backend/src/models/ticket.js for ticket confirmations
- [ ] T063 [P] [US7] Add backend/src/services/payment_service.js for payment processing
- [ ] T064 [US7] Implement GET /api/pricing in backend/src/routes/pricing.js (UC-19)
- [ ] T065 [US7] Implement POST /api/payments in backend/src/routes/payments.js (UC-20)
- [ ] T066 [US7] Implement POST /api/tickets in backend/src/routes/tickets.js (UC-21)
- [ ] T067 [P] [US7] Add backend/tests/integration/test_payment_api.js
- [ ] T068 [P] [US7] Add backend/tests/acceptance/test_uc19_uc21_payments.js mapped to AT-UC-19-*, AT-UC-20-*, AT-UC-21-*

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T069 Add backend/src/middleware/error_handler.js for consistent error responses
- [ ] T070 [P] Add backend/tests/integration/test_error_handling.js for common failure paths
- [ ] T071 [P] Add frontend/app.js wiring for minimal forms (register, login, submit paper, payment)
- [ ] T072 Update frontend/index.html with links/forms for UC-01, UC-03, UC-05, UC-19
- [ ] T073 Update frontend/styles.css for basic layout and readability

## Dependencies

- User stories can be completed in order: US1 -> US2 -> US3 -> US4 -> US5 -> US6 -> US7
- Foundational phase (T007-T012) blocks all user story phases

## Parallel Execution Examples

- US1: T013, T014, T016 can run in parallel after T010
- US3: T026, T027, T031 can run in parallel after T010
- US4: T035, T036, T038 can run in parallel after T007

## Implementation Strategy

- MVP: Complete Phase 3 (US1) to enable account registration with validation.
- Incremental delivery: Add US2 and US3 next to enable authenticated submission flow.
- Subsequent delivery: Add reviewer, scheduling, and payment flows in order of priorities.
