## Why

The codebase ships with 75 tests, strict TypeScript, and a hexagonal architecture enforced by code review, but there is no automated pre-commit gate. Reviewer feedback happens after the commit lands in the PR — too late to catch the easy stuff (unused exports, business logic in components, test bypasses, barrel imports) before it pollutes git history and forces a follow-up commit.

This change installs **Gentleman Guardian Angel (GGA)** as the project's automated pre-commit reviewer. GGA is provider-agnostic (Claude / Gemini / Codex / OpenCode / Cursor / Ollama / LM Studio / GitHub / Kiro / MiniMax) so the team can switch providers without rewriting tooling. The rules live in `AGENTS.md` (project-local), so the reviewer's criteria stay close to the architecture and never drift.

## What Changes

### New Capabilities

- `code-review-tooling`: GGA-based pre-commit review, project-local review rules.

### Modified Capabilities

- None.

## Impact

- New project files: `.gga` (provider config), `AGENTS.md` (review rules), and a `setup:review` npm script to install the hook on a fresh clone.
- The pre-commit hook itself lives under `.git/hooks/` and is **not tracked by git**. Each contributor runs `pnpm setup:review` (or `npx gga install`) once after cloning.
- No new runtime dependencies. GGA is installed via Homebrew tap (`brew install gga`).
- No CI change in this PR; CI integration (e.g., GitHub Actions calling `gga run --ci` on push) is a follow-up.

## Non-goals

- No CI integration (GitHub Actions, GitLab CI). Manual runs and local pre-commit only.
- No commit-message linting hook (no `gga install --commit-msg`). Conventional Commits is enforced by review discipline, not by tooling, for now.
- No project-policy change. Domain / application / infrastructure layers are untouched.
- No provider lock-in. The default is `claude` but every team member can switch locally without touching the project config.
- No automated bump / release of the GGA formula. Follows the existing Gentleman-Programming homebrew-tap workflow if a version bump is ever needed.