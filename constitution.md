<!--
Sync Impact Report:
- Version change: N/A (template) -> 1.0.0
- Modified principles: N/A (initial adoption)
- Added sections: Core Principles (instantiated), Scope & Sources,
  Workflow & Quality Gates, Governance (instantiated)
- Removed sections: None
- Templates requiring updates:
  - UPDATED .specify/templates/plan-template.md
  - UPDATED .specify/templates/spec-template.md
  - UPDATED .specify/templates/tasks-template.md
  - PENDING .specify/templates/commands/*.md (directory not found)
  - PENDING Runtime guidance docs (none found)
- Follow-up TODOs:
  - None
-->
# CMS Specification Constitution

## Core Principles

### I. Source-of-Truth Requirements
- Requirements, flows, actors, permissions, and data fields MUST come from
  `cms_user_stories.md` and `Use Cases_Scenarios_ATs.md` or be strictly implied.
- If a detail is not supported by those documents, mark it
  `NEEDS CLARIFICATION` and ask a targeted question.
Rationale: prevents requirements drift and keeps artifacts auditable.

### II. Planning-Only Output
- Work products are limited to constitution, clarify Q/A, spec, plan, tasks, and
  checklist/analyze artifacts. Do not implement unless explicitly requested.
- Any illustrative code or pseudo-code MUST follow `coding_standards.md`.
Rationale: keeps scope aligned to planning and validation.

### III. Clarify Ambiguity Before Proceeding
- Ambiguities MUST be surfaced as explicit questions and answered before
  advancing to the next pipeline step.
- When an answer is pending, record `TODO(<FIELD>): <reason>` in place.
Rationale: avoids hidden assumptions and rework later in the pipeline.

### IV. Traceability & Coverage
- The spec MUST cover all major capabilities in the source documents.
- Every requirement and acceptance test MUST trace back to user stories and/or
  use cases.
- Terminology MUST be consistent across all artifacts.
Rationale: ensures completeness and prevents conflicting interpretations.

### V. Testable Quality Gates
- Acceptance tests MUST include success paths and key failures: validation,
  authorization, and system-failure handling where documented.
- Tests MUST be deterministic and avoid external dependencies unless explicitly
  planned.
- Each pipeline step MUST include a brief validation pass against the
  source-of-truth documents; if drift is found, revise the earlier artifact.
Rationale: guarantees verifiable outcomes and stable planning inputs.

## Scope & Sources

- Authoritative requirements sources are `cms_user_stories.md` and
  `Use Cases_Scenarios_ATs.md`.
- `coding_standards.md` is binding for any code snippets or implementation
  guidance included in planning artifacts.
- Do not invent new requirements, flows, actors, permissions, or data fields.

## Workflow & Quality Gates

- Execute the pipeline in order: Constitution -> Clarify -> Specify -> Plan ->
  Tasks -> Checklist + Analyze.
- After each step, perform a short validation pass against the authoritative
  sources. If drift is found, update the earlier artifact rather than patching
  later steps.
- The plan MUST describe architecture, data model, interfaces/contracts, and
  testing strategy. Tasks MUST be ordered, chunked, and test-driven.

## Governance

- The constitution supersedes other guidance. Conflicts must be resolved by
  amending this document.
- Amendment procedure:
  1. Propose change with rationale and impact.
  2. Update this constitution and all dependent templates.
  3. Record changes in the Sync Impact Report.
- Versioning follows semantic versioning:
  - MAJOR: backward-incompatible governance/principle removal or redefinition.
  - MINOR: new principle/section or materially expanded guidance.
  - PATCH: clarifications or non-semantic refinements.
- Compliance review: every artifact must include a constitution check and
  demonstrate traceability to source documents.

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
