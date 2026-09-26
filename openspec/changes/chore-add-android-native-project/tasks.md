# Tasks: chore-add-android-native-project

## Review Workload Forecast

| Field                   | Value                                              |
| ----------------------- | -------------------------------------------------- |
| Estimated changed lines | ~1000+ (gradle wrapper, AndroidManifest, resources, Kotlin files) |
| 400-line budget risk    | High (single commit is large; but isolated to a setup PR) |
| Chained PRs recommended | No — single PR, well-scoped to tooling              |
| Delivery strategy       | tooling                                            |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: High (single commit is large but the directory is generated verbatim from `expo prebuild` — no manual edits)

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                                              | Commit              |
| ---- | --------------------------------------------------------------------------------- | ------------------- |
| 1    | Update `.gitignore` to add `*.keystore`                                            | `chore(setup)`      |
| 2    | Commit the `android/` directory produced by `expo prebuild`                       | `chore(setup)`      |
| 3    | OpenSpec change artifacts                                                          | `docs(openspec)`     |

## Phase 1: `.gitignore`

- [x] 1.1 Add `*.keystore` to the signing / keystores block.

## Phase 2: `android/`

- [x] 2.1 Run `npx expo prebuild --platform android --clean --no-install` (no need to re-install node_modules).
- [x] 2.2 Verify build outputs are gitignored (`android/build`, `android/app/build`, `android/.gradle`, `android/local.properties`).
- [x] 2.3 Stage and commit the generated directory (excluding `debug.keystore`).

## Phase 3: OpenSpec change artifacts

- [x] 3.1 `proposal.md`, `design.md`, `tasks.md` (this file).

## Verification (must pass before archive)

- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` still 76/76 (no code change).
- [x] `npx expo export --platform android` still bundles cleanly.
- [x] `android/app/debug.keystore` is NOT tracked (verified with `git ls-files android/`).

## Follow-up (not in this PR)

- iOS native directory (`ios/`) via `expo prebuild --platform ios`.
- EAS Build configuration (`.eas/build.json`).
- ProGuard / R8 tuning for release builds.
- Native module additions (notifications, haptics) — each one is its own PR with a regenerated `android/` diff.