# Tasks — 001-initialize-project (project-foundation)

> Every task lists:
>
> - the **spec scenario(s)** it advances,
> - the **RED → GREEN → REFACTOR** evidence,
> - the **concrete file path(s)** it touches,
> - a **commit subject** (Conventional Commits; no `Co-Authored-By:`).

## 1. OpenSpec change scaffold

- [ ] 1.1 Create the change directory `openspec/changes/initialize-project/` via the OpenSpec CLI.
  - Spec: §"OpenSpec wiring" / "OpenSpec configuration is present and parseable".
  - RED: `openspec list` shows zero changes. GREEN: lists `initialize-project`. REFACTOR: n/a.
  - File: `openspec/changes/initialize-project/.openspec.yaml`, `README.md`.
  - Commit: `chore(openspec): scaffold change 001-initialize-project`.

- [ ] 1.2 Write `proposal.md` referencing RFC-001 and PRD §4 (context only).
  - Spec: §"OpenSpec wiring" / "Strict validation passes for this change".
  - File: `openspec/changes/initialize-project/proposal.md`.

- [ ] 1.3 Write the delta spec `specs/project-foundation/spec.md` covering toolchain, lint/format, imports, wiring, commits, evidence.
  - Spec: §"Toolchain baseline", §"Lint and format scripts", §"Imports by concrete path", §"OpenSpec wiring", §"Conventional commits without AI attribution", §"Persistence of evidence", §"Out-of-scope foundation items".
  - File: `openspec/changes/initialize-project/specs/project-foundation/spec.md`.

- [ ] 1.4 Write `design.md` documenting ESLint flat config + Prettier + `npx expo install`, blast radius (none), affected ports (none), TDD cycle per task, risks.
  - File: `openspec/changes/initialize-project/design.md`.

- [ ] 1.5 Write `tasks.md` (this file).
  - File: `openspec/changes/initialize-project/tasks.md`.

## 2. ESLint + Prettier toolchain (the only RFC-001 deliverable still pending)

- [ ] 2.1 RED — confirm `pnpm lint` and `pnpm format:check` currently fail or are absent.
  - Spec: §"Lint and format scripts" / "Lint passes on the bootstrap files".
  - RED evidence: capture exit code 127 (command not found) or non-zero lint output and append to `openspec/changes/initialize-project/apply-progress.md` (or verify log).

- [ ] 2.2 GREEN — install `eslint`, `eslint-config-expo`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `prettier` via `npx expo install -- --save-dev`. Commit the resulting `package.json` + `pnpm-lock.yaml` change.
  - Spec: §"Lint and format scripts".
  - File: `package.json`, `pnpm-lock.yaml`.

- [ ] 2.3 GREEN — create `eslint.config.js` (flat config extending `eslint-config-expo`) and `.eslintignore`. Add `lint` and `lint:fix` scripts to `package.json`.
  - Spec: §"Lint and format scripts" / "Lint passes on the bootstrap files".
  - File: `eslint.config.js` (new), `.eslintignore` (new), `package.json`.

- [ ] 2.4 GREEN — create `.prettierrc` and `.prettierignore`. Add `format` and `format:check` scripts to `package.json`.
  - Spec: §"Lint and format scripts" / "Format check passes", "Auto-format rewrites offending files".
  - File: `.prettierrc` (new), `.prettierignore` (new), `package.json`.

- [ ] 2.5 GREEN — run `pnpm lint`, capture exit 0; run `pnpm format:check`, capture exit 0. Append verbatim output to the verify log.
  - Spec: §"Lint and format scripts".

- [ ] 2.6 REFACTOR — tighten ESLint rules only if lint exits 0 today and the rule set has no obvious gap; otherwise stop and document the gap in design.md / risks.
  - File: `eslint.config.js`.

- [ ] 2.7 Commit as `chore(tooling): add ESLint and Prettier compatible with Expo 57`.

## 3. Verify the foundation (real CLI, no fabrication)

- [ ] 3.1 Run `pnpm test`, capture exit 0 + verbatim output.
  - Spec: §"Toolchain baseline" / "Test runner executes the smoke suite".

- [ ] 3.2 Run `pnpm typecheck`, capture exit 0 + verbatim output.
  - Spec: §"Toolchain baseline" / "TypeScript strict typecheck passes".

- [ ] 3.3 Run `npx expo-doctor`, capture exit 0 + verbatim output.
  - Spec: §"Toolchain baseline" / "Expo doctor reports a healthy project".

- [ ] 3.4 Run `pnpm lint`, capture exit 0 + verbatim output.
  - Spec: §"Lint and format scripts" / "Lint passes on the bootstrap files".

- [ ] 3.5 Run `pnpm format:check`, capture exit 0 + verbatim output.
  - Spec: §"Lint and format scripts" / "Format check passes".

- [ ] 3.6 Run `npx openspec validate initialize-project --strict`, capture exit 0 + verbatim output.
  - Spec: §"OpenSpec wiring" / "Strict validation passes for this change".

- [ ] 3.7 Reconcile each captured command against the spec scenarios in §3.1–§3.6. If any fails, return to its task; do not archive.
  - File: `openspec/changes/initialize-project/verify-log.md` (new).

- [ ] 3.8 Commit as `chore(foundation): record verify log for change 001-initialize-project`.

## 4. Archive

- [ ] 4.1 Run `openspec archive initialize-project --yes` after §3 is fully green.
  - Spec: §"OpenSpec wiring" + every scenario in §1–§3.
  - File: moves artifacts from `openspec/changes/initialize-project/` to `openspec/changes/archive/YYYY-MM-DD-initialize-project/` and materializes `openspec/specs/project-foundation/spec.md`.

- [ ] 4.2 Confirm `openspec list --specs` lists `project-foundation`.
  - Spec: §"OpenSpec wiring" / "Strict validation passes for this change".

- [ ] 4.3 Final git commit on `develop`: `chore(foundation): archive change 001-initialize-project` (only if archive produced uncommitted artifacts).
