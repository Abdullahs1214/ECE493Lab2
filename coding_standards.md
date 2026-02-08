# Coding Standards (Project-Local)

These rules are the source of truth for code style and review decisions for this project.

## General
- Prefer clarity over cleverness. Optimize for readability and maintainability.
- Keep functions small and single-purpose.
- Avoid global mutable state unless unavoidable; document it when used.
- Handle errors explicitly. Do not ignore failures silently.
- Use consistent naming and file organization. Keep related code together.
- No magic numbers/strings without a named constant.
- Comments explain "why" when it is not obvious; do not restate the code.

## JavaScript
- Use `const` by default; use `let` only when reassignment is required; avoid `var`.
- Prefer pure functions where possible; keep side effects at the boundaries (I/O, DOM, network).
- Validate all external input (forms, query params, API payloads) at boundaries.
- Avoid deeply nested logic; use early returns and small helpers.
- Use strict equality (`===` / `!==`) unless there is a concrete reason not to.
- Keep async flows explicit; use `async/await` over chained `.then()` for readability.
- Do not hardcode URLs or secrets in code; use config variables/files where applicable.

## HTML
- Use semantic elements (`header`, `nav`, `main`, `section`, `article`, `button`, `form`, `label`) where appropriate.
- Every form control must have an associated label.
- Buttons that trigger actions must be `<button>`, not clickable `<div>`.
- Keep structure clean: avoid inline styles; avoid excessive nesting.

## CSS
- Prefer class-based styling; avoid element selectors for layout.
- Avoid `!important` except for documented, rare overrides.
- Use consistent spacing and sizing conventions.
- Keep selectors shallow; avoid overly specific selectors.
- Group related styles; keep component/page styles together.

## Testing
- Tests must be deterministic and isolated (no reliance on real time, random, external network).
- Every major user-facing flow has at least one acceptance-level test scenario.
- Add negative tests for validation, permission checks, and failure handling.
