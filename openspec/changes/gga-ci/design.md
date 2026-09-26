## Context

PR #2 set up GGA as a local pre-commit hook (`.gga`, `AGENTS.md`, `pnpm setup:review`). Local-only enforcement has gaps:

- Contributors who forget `pnpm setup:review` get no review.
- PRs reviewed on the GitHub UI by external contributors skip the local hook.
- The first CI run on `develop` only sees the existing code, not the diff being merged.

A CI workflow closes these gaps. The project's test/lint gates (`pnpm typecheck`, `pnpm lint`, `pnpm test`) already run in CI; adding GGA completes the gate set.

## Goals / Non-Goals

**Goals:**

- One workflow file (`.github/workflows/gga.yml`).
- Runs `gga run --pr-mode --diff-only` on every PR.
- Runs `gga run --ci` on every push to `develop` (reviews the last commit).
- Treats GGA failure as a hard gate.
- Uses the project's committed `.gga` (provider default `claude`).
- Pins a GGA version so the workflow is reproducible.

**Non-Goals:**

- No matrix of providers. The workflow uses the project default; per-developer provider overrides stay local.
- No status badge / PR comment integration. Follow-up if the team wants it.
- No GGA version auto-bump. Bumps are PRs.

## Decisions

### Use the official `bretfisher/gga-action` (or equivalent)

The fastest path is a thin wrapper that installs `gga` on the runner (via the homebrew tap, just like a developer would) and calls `gga run`. Two options:
1. The community-published `bretfisher/gga-action` GitHub Action.
2. A self-rolled job that runs `brew install gga && gga run --pr-mode --diff-only`.

Option 1 is cleaner (no maintenance of the install step); option 2 has fewer external dependencies. This change goes with option 1 (`bretfisher/gga-action@main`) because the Gentleman Programming ecosystem already publishes it, and pinning to a major version (`@v1`) keeps the surface small.

If the action breaks or ages out, the workflow can swap to option 2 with no project-code impact (the file is isolated under `.github/`).

### `--pr-mode --diff-only` on pull_request

`--pr-mode` auto-detects the base branch (develop / main / master) and reviews all files changed in the full PR. `--diff-only` sends only the diffs to the provider — faster and cheaper, at the cost of less context for the reviewer. For the PR gate, "fast and cheap" is the right trade-off.

### `--ci` on push to develop

For direct pushes / merges into develop, `--ci` reviews the last commit (`HEAD~1..HEAD`). Cheap, runs on every push.

### Fail the workflow on review failure

GGA's exit code is non-zero when the reviewer flags an issue (or when STRICT_MODE can't parse the response). The workflow treats that as a hard gate. Contributors who disagree with a flag can push a `--no-verify` commit locally; the PR review comment + manual override at the GitHub UI is the documented escape hatch.

### Pin the GGA action to `@v1`

`bretfisher/gga-action@main` would auto-update — risky for CI. `@v1` follows the major version. Bumps are explicit PRs.

## Files to be created or modified

```
openspec/changes/gga-ci/
├── proposal.md
├── design.md
└── tasks.md

.github/workflows/
└── gga.yml                                   (new — the workflow)
```

No production code, no test changes, no domain / application / infrastructure touches.

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## TDD cycle per task

This is a CI tooling change, not behavior. No RED test required. Verification gates:
- The workflow file is valid YAML (lint via `pnpm lint` is not relevant here; we verify by pushing to a test branch).
- `pnpm typecheck`, `pnpm lint`, `pnpm test` still green (the workflow does not touch code).

## Risks

- **GGA API flakiness** — if the provider returns 5xx or times out, the workflow fails. Mitigation: the workflow is non-required for merge (the team can re-run after a transient failure). A future change can add `continue-on-error: true` + a status check if needed.
- **PR-time latency** — `--pr-mode --diff-only` is fast (~10–60 s). Worst-case 300 s timeout (matches GGA's own timeout). Acceptable.
- **Provider lock-in via `.gga`** — if the team wants to use `opencode` instead of `claude` for CI, they update `.gga`. Per-developer overrides stay local.

## Verification

- The workflow file passes `actionlint` (or equivalent YAML check).
- `pnpm typecheck`, `pnpm lint`, `pnpm test` still 75/76 (tooling-only change).
- After merge, opening a test PR triggers the workflow and the run appears in the Actions tab.