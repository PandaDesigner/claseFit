# Tasks: gga-ci

## Review Workload Forecast

| Field                   | Value                                  |
| ----------------------- | -------------------------------------- |
| Estimated changed lines | 30–50 (1 workflow file, 1 README note) |
| 400-line budget risk    | None                                   |
| Chained PRs recommended | No — single PR, isolated to `.github/` |
| Delivery strategy       | CI tooling                             |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: None

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                                       | Commit           |
| ---- | -------------------------------------------------------------------------- | ---------------- |
| 1    | Add `.github/workflows/gga.yml` (PR + push-to-develop triggers, hard gate) | `chore(ci)`      |
| 2    | OpenSpec change artifacts                                                  | `docs(openspec)` |

## Phase 1: GitHub Actions workflow

- [x] 1.1 Create `.github/workflows/gga.yml` with:
  - `name: gga`
  - `on: pull_request` and `push: branches: [develop]`
  - `jobs.gga`: runs-on `ubuntu-latest`, uses `bretfisher/gga-action@v1`, with `args: --pr-mode --diff-only` for PRs and `--ci` for push-to-develop.
- [x] 1.2 Pin the action to `@v1`. Document in the workflow comment that bumps are explicit PRs.

## Phase 2: OpenSpec change artifacts

- [x] 2.1 `proposal.md` — Why, What Changes, Impact, Non-goals.
- [x] 2.2 `design.md` — decisions (use community action, `--pr-mode --diff-only`, fail the workflow, pin to `@v1`), files, ports (none), TDD (none), risks, verification.
- [x] 2.3 `tasks.md` — this file.

## Verification (must pass before archive)

- [x] Workflow YAML is valid.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` still green (76/76 — tooling-only change).
- [x] After merge, opening a test PR triggers the workflow and the run appears in the Actions tab.

## Follow-up (not in this PR)

- Status badge / PR comment integration via the Gentleman Programming ecosystem.
- Reduced-motion handling (unrelated; in the animation change follow-ups).
- Matrix of providers (unrelated; future if the team wants CI to test multiple providers).
