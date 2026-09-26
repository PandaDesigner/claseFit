# code-review-ci Specification (delta)

## Purpose

This delta introduces the `code-review-ci` capability: a single GitHub Actions workflow that runs GGA (Gentleman Guardian Angel) on every PR and on every push to `develop`, so the same review gate that runs locally via `pnpm setup:review` also runs on CI.

It does NOT introduce behavior — the workflow is tooling only. No production code, no tests, no domain / application / infrastructure touches.

## ADDED Requirements

### Requirement: A GitHub Actions workflow runs GGA on every PR and on every push to develop

The repository MUST contain a workflow at `.github/workflows/gga.yml` with `name: gga`, triggered on `pull_request` and on `push` to the `develop` branch. The workflow MUST checkout the repo (`fetch-depth: 0`), install Linuxbrew, tap `Gentleman-Programming/homebrew-tap`, install `gga`, and then run the review:

- On `pull_request`: `gga run --pr-mode --diff-only` (auto-detects the base branch, reviews only the diff).
- On `push` to `develop`: `gga run --ci` (reviews the last commit).

The workflow MUST treat a non-zero exit from `gga run` as a hard gate (the step fails the workflow).

#### Scenario: Opening a PR triggers a GGA review run

- **WHEN** a contributor opens a pull request targeting `develop`
- **THEN** the Actions tab shows a `gga` workflow run that exits with status 0 when the reviewer passes the diff and status non-zero when the reviewer flags an issue.

#### Scenario: Pushing to develop triggers a GGA review of the last commit

- **WHEN** a commit is pushed to `develop` (directly or via merge)
- **THEN** the Actions tab shows a `gga` workflow run invoking `gga run --ci` that exits with status 0 when the last commit passes the review and non-zero otherwise.

### Requirement: The workflow uses the committed project config

The workflow MUST rely on the project's committed `.gga` (provider default `claude`) and `AGENTS.md` rules file. It MUST NOT install a global GGA config different from the project's. It MUST NOT pin a model / provider inside the workflow file.

#### Scenario: Provider changes flow through the project config

- **WHEN** the team edits `.gga` to change the provider (e.g., to `opencode` or `gemini`)
- **THEN** the next PR or push-to-develop CI run uses the new provider — no workflow edit required.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.
