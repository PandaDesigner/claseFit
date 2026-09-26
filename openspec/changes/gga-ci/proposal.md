## Why

`gga` (Gentleman Guardian Angel) is the project's automated code reviewer (set up in PR #2). It runs locally via `pnpm setup:review`, but the local gate only catches issues on the contributor's machine. By the time the PR opens, the same issues have already landed on `develop` via rebase or merge.

CI integration closes the gap. Every PR and every push to `develop` should run `gga run --pr-mode` against the diff so the reviewer gate applies uniformly to all contributors — including those who skip `pnpm setup:review`, those reviewing on the GitHub UI, and external reviewers without a local checkout.

This change adds a single GitHub Actions workflow that:
1. Installs `gga` from the homebrew tap (no new dependency in the project — the workflow installs it on the runner).
2. Runs `gga run --pr-mode --diff-only` on PRs (auto-detects base branch).
3. Runs `gga run --ci` on every push to `develop` (reviews the last commit).
4. Treats GGA failure as a hard gate (`exit 1` fails the workflow).

No project code change — workflow file + a short README note.

## What Changes

### New Capabilities

- `code-review-ci`: GitHub Actions workflow that runs GGA on every PR and on every push to `develop`.

### Modified Capabilities

- None.

## Impact

- **CI**: new `.github/workflows/gga.yml` that runs on `pull_request` and `push` to `develop`. Uses `bretfisher/gga-action` style — installs GGA from the homebrew tap and runs it against the changed files.
- **README**: short note in the PR body explaining the gate to new contributors.
- **No code change**. No new runtime dependencies.

## Non-goals

- No new commit-msg hook on CI. Conventional Commits enforcement stays manual / via the PR title check.
- No status badge. The PR-comment integration is left for a follow-up.
- No matrix of providers — the workflow picks the provider from the project's `.gga` (default `claude`). The team can swap providers per-developer via `~/.config/gga/config` on local runs; CI uses the committed config.
- No auto-bump of GGA. The workflow pins a version (`v2.10.1`) and updates are a separate PR.