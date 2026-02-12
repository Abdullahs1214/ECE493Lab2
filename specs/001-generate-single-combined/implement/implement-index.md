# Implementation Split Index: Combined CMS Specification

**Feature Branch**: `001-generate-single-combined`
**Created**: 2026-02-11
**Status**: Draft
**Authoritative Sources**: `cms_user_stories.md`, `Use Cases_Scenarios_ATs.md`
**Governing Doc**: `.specify/memory/constitution.md`
**Coding Standard**: `coding_standards.md`

## Purpose

Split the implementation planning work into manageable, traceable chunks while
preserving alignment with the constitution and the source-of-truth documents.

## Chunks

- `specs/001-generate-single-combined/implement/implement-uc-01-05.md` (UC-01 to UC-05)
- `specs/001-generate-single-combined/implement/implement-uc-06-10.md` (UC-06 to UC-10)
- `specs/001-generate-single-combined/implement/implement-uc-11-15.md` (UC-11 to UC-15)
- `specs/001-generate-single-combined/implement/implement-uc-16-21.md` (UC-16 to UC-21)

## Shared Inputs

- `specs/001-generate-single-combined/spec.md`
- `specs/001-generate-single-combined/plan.md`
- `specs/001-generate-single-combined/data-model.md`
- `specs/001-generate-single-combined/contracts/openapi.yaml`
- `specs/001-generate-single-combined/tasks.md`
- `specs/001-generate-single-combined/checklists/api.md`
- `specs/001-generate-single-combined/checklists/data-model.md`
- `specs/001-generate-single-combined/checklists/requirements.md`
- `specs/001-generate-single-combined/checklists/security.md`
- `specs/001-generate-single-combined/checklists/ux.md`

## Cross-Cutting Tasks (Apply After All Chunks)

- T069 Add backend/src/middleware/error_handler.js for consistent error responses
- T070 Add backend/tests/integration/test_error_handling.js for common failure paths
- T071 Add frontend/app.js wiring for minimal forms (register, login, submit paper, payment)
- T072 Update frontend/index.html with links/forms for UC-01, UC-03, UC-05, UC-19
- T073 Update frontend/styles.css for basic layout and readability

## Constitution Check

- [x] Requirements and behaviors trace to `cms_user_stories.md` and `Use Cases_Scenarios_ATs.md` only.
- [x] No requirements, actors, permissions, or data fields are invented.
- [x] Artifacts are planning-only and do not include implementation beyond references.
- [x] Traceability is maintained via per-chunk scope and task mapping.
