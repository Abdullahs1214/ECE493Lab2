# Repository Guidelines

## Project Structure & Module Organization

This repository is documentation-only. Core artifacts live in the root:
- `cms_user_stories.md`: CMS user stories grouped by feature area.
- `Use Cases_Scenarios_ATs.md`: Detailed use cases, scenario narratives, and acceptance tests.
- `.specify/`: Templates and helper scripts for planning/spec artifacts (not required for normal edits).

There is no application source code or test runner. Changes are primarily edits to Markdown documents.

## Build, Test, and Development Commands

No build or runtime commands are defined. Use standard Markdown editing and search tools. Examples:
- `rg -n "US-" cms_user_stories.md` to locate a user story.
- `rg -n "AT-UC" Use Cases_Scenarios_ATs.md` to locate acceptance tests.

## Coding Style & Naming Conventions

Follow the existing Markdown style:
- Headings use `#`, `##`, `###` with blank lines between sections.
- Use bold labels like `**Goal in Context**:` for structured fields.
- Use numbered lists for main scenarios and bullet lists for extensions/criteria.
- Keep identifiers consistent: `US-01`, `UC-01`, `AT-UC-01-01`.

## Testing Guidelines

There is no automated test suite. Acceptance tests are documented in `Use Cases_Scenarios_ATs.md` and should be kept in sync with their corresponding use cases. When adding a use case, add at least one `AT-...` entry that covers the main success scenario and any key extensions.

## Commit & Pull Request Guidelines

Git history is minimal (only an initial “Add files via upload”), so no formal convention exists. Use clear, imperative commit subjects that describe the document change, for example:
- `Add UC-02 use case and ATs`
- `Clarify password validation in UC-01`

For pull requests, include:
- A short summary of the changed use cases or user stories.
- Any new or updated `US-`, `UC-`, or `AT-` identifiers.
- Notes on assumptions or open issues introduced.

## Agent-Specific Instructions

If you use automation under `.specify/`, keep output aligned with the existing Markdown structure and identifiers, and avoid introducing new formatting conventions unless agreed upon.
