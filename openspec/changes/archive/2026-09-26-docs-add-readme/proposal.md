## Why

The repository has 5 merged PRs covering the visual redesign, the GGA code-review setup, motion vocabulary, and the Android native project — but no `README.md`. New contributors land on a greenfield checkout with no entry point:

- No description of what the app does.
- No quick-start (`pnpm install`, `pnpm test`, `pnpm android`).
- No project structure / architectural overview.
- No pointer to the OpenSpec workflow that owns every change.
- No pointer to the GGA code-review setup (`pnpm setup:review`).
- No pointer to the CI workflow that runs on every PR and push.

This change adds a single `README.md` that captures the surface area a contributor needs on day one. It is documentation only — no code change, no test change, no OpenSpec artifacts beyond the change that ships the README itself.

## What Changes

### New Capabilities

- `project-readme`: top-level `README.md` with project overview, quick start, project structure, architecture summary, scripts, code review workflow, OpenSpec workflow, and testing.

### Modified Capabilities

- None.

## Impact

- **New file**: `README.md` at the repo root.
- No production code change. No test changes. No domain / application / infrastructure touches.

## Non-goals

- No CONTRIBUTING.md, no CODE_OF_CONDUCT.md, no LICENSE file. Follow-ups if the team wants them.
- No CHANGELOG.md. Releases are tracked in the OpenSpec changes archive.
- No GitHub Pages site or extended docs. The README is enough for a focused MVP.
