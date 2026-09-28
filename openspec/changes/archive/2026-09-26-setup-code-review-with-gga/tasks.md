# Tasks: setup-code-review-with-gga

## Review Workload Forecast

| Field                   | Value                                      |
| ----------------------- | ------------------------------------------ |
| Estimated changed lines | 80–120 (config files + OpenSpec artifacts) |
| 400-line budget risk    | None — tooling-only PR                     |
| Chained PRs recommended | No — single PR, well-scoped                |
| Delivery strategy       | tooling                                    |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: None

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                                    | Commit            |
| ---- | ----------------------------------------------------------------------- | ----------------- |
| 1    | Project-local GGA provider config (`PROVIDER=claude`, patterns, strict) | `chore(tooling)`  |
| 2    | Review rules distilled from OpenSpec config into `AGENTS.md`            | `docs(standards)` |
| 3    | `pnpm setup:review` script that runs `gga install` for fresh clones     | `chore(tooling)`  |
| 4    | OpenSpec change artifacts for traceability                              | `docs(openspec)`  |

## Phase 1: GGA provider config

- [x] 1.1 Create `.gga` at the project root via `gga init`.
- [x] 1.2 Keep default `PROVIDER="claude"`; team overrides per-developer via `~/.config/gga/config`.
- [x] 1.3 `FILE_PATTERNS="*.ts,*.tsx,*.js,*.jsx"` (project source).
- [x] 1.4 `EXCLUDE_PATTERNS="*.test.ts,*.spec.ts,*.test.tsx,*.spec.tsx,*.d.ts"` (skip tests + ambient types).
- [x] 1.5 `STRICT_MODE="true"` (no silent passes).
- [x] 1.6 `RULES_FILE="AGENTS.md"`.

## Phase 2: Review rules

- [x] 2.1 Create `AGENTS.md` at the project root.
- [x] 2.2 Sections: Architecture (hexagonal + dependency rule), Domain Model, Use Cases, Presentation, OpenSpec Workflow, Persistence, Functional Messages (literal from PRD §4), Reject If (booleans, barrels, AI attribution, etc.), Style.
- [x] 2.3 Keep it focused: the rules the reviewer needs to make judgement calls, not the full RFC / PRD history.

## Phase 3: Setup script

- [x] 3.1 Add `scripts.setup:review` to `package.json`: `gga install`.
- [x] 3.2 Documented in `AGENTS.md` (Contributor Setup section).

## Phase 4: OpenSpec change artifacts

- [x] 4.1 `proposal.md` — Why, What Changes, Impact, Non-goals.
- [x] 4.2 `design.md` — decisions, files, ports (none), TDD, risks, verification.
- [x] 4.3 `tasks.md` — this file.

## Verification (must pass before archive)

- [x] `pnpm setup:review` runs `gga install` and exits 0
- [x] `.git/hooks/pre-commit` contains the `gga run || exit 1` block
- [x] `pnpm test` still 75/75 green (tooling-only change)
- [x] `pnpm typecheck` clean
- [x] `pnpm lint` 0 warnings
- [x] `gg --version` shows 2.10.1+ on the host

## Follow-up (not in this PR)

- CI integration: GitHub Actions job running `gga run --ci` (or `--pr-mode`) on push.
- Commit-msg hook: `gga install --commit-msg` once Conventional Commits enforcement becomes a hard gate.
- Per-provider setup docs in the README.
- Optional: `.gga` per-language override (e.g., `*.go`, `*.py`) when the project adds services outside React Native.
