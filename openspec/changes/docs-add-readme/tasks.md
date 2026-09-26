# Tasks: docs-add-readme

## Review Workload Forecast

| Field                   | Value                                              |
| ----------------------- | -------------------------------------------------- |
| Estimated changed lines | 100–160 (one README file, ~10 sections)            |
| 400-line budget risk    | None                                               |
| Chained PRs recommended | No — single PR, well-scoped to docs                |
| Delivery strategy       | documentation                                      |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: None

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                              | Commit              |
| ---- | ----------------------------------------------------------------- | ------------------- |
| 1    | Add `README.md` with the day-one contributor surface              | `docs`              |
| 2    | OpenSpec change artifacts                                         | `docs(openspec)`    |

## Phase 1: README

- [x] 1.1 Title + tagline
- [x] 1.2 Quick start (install / test / run)
- [x] 1.3 Project structure (tree, two levels deep, annotated)
- [x] 1.4 Architecture summary (point to `openspec/config.yaml`)
- [x] 1.5 Scripts (list from `package.json`)
- [x] 1.6 Code review (GGA) — setup, rules file, CI
- [x] 1.7 OpenSpec workflow — pointer to `openspec/config.yaml` + `openspec/changes/`
- [x] 1.8 Testing (76 tests, where the suites live)
- [x] 1.9 Native build (committed `android/` + EAS Build follow-up)

## Phase 2: OpenSpec change artifacts

- [x] 2.1 `proposal.md` — Why, What Changes, Impact, Non-goals.
- [x] 2.2 `design.md` — decisions, files, ports (none), TDD (none), risks, verification.
- [x] 2.3 `tasks.md` — this file.

## Verification (must pass before archive)

- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` 76/76 (no code change).
- [x] A fresh-clone dry run follows the README end-to-end without asking questions.

## Follow-up (not in this PR)

- Status badge
- CONTRIBUTING.md
- LICENSE
- GitHub Pages site
- Spanish translation