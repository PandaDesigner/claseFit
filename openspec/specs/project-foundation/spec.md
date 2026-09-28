# project-foundation Specification

## Purpose

The technical baseline of the ClaseFit repository (RFC-001): a working mobile toolchain (Expo SDK 57 + React Native 0.86 + TypeScript strict + Jest + RNTL), an ESLint + Prettier toolchain wired to a single command each, and a configured OpenSpec workspace that captures the project context for downstream changes. This capability owns **no business behavior** — RFC-002 (`class-booking`) introduces the first feature module on top of it.

## Requirements

### Requirement: Toolchain baseline

The repository MUST provide a working mobile toolchain: Expo SDK 57, React Native 0.86, TypeScript strict mode, Jest 29 with the `jest-expo` preset, and React Native Testing Library 14. `pnpm test`, `pnpm typecheck`, and `npx expo-doctor` MUST each exit with status 0 on the current commit.

#### Scenario: Test runner executes the smoke suite

- **WHEN** a developer runs `pnpm test`
- **THEN** Jest discovers `__tests__/smoke.test.tsx`, runs the assertion `expect(screen.getByText('Hola, Laura')).toBeOnTheScreen()`, and exits with status 0.

#### Scenario: TypeScript strict typecheck passes

- **WHEN** a developer runs `pnpm typecheck`
- **THEN** `tsc --noEmit` exits with status 0 and reports zero errors against `tsconfig.json` (which extends `expo/tsconfig.base` and sets `"strict": true`).

#### Scenario: Expo doctor reports a healthy project

- **WHEN** a developer runs `npx expo-doctor`
- **THEN** the command exits with status 0 and either reports 21/21 checks passing or lists only expected/known advisories (none blocking).

### Requirement: Lint and format scripts

The repository MUST expose ESLint and Prettier scripts wired to a single command each, configured via `eslint-config-expo` so they remain compatible with Expo SDK 57. Scripts: `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`. The configuration files MUST live at the repo root: `eslint.config.js`, `.prettierrc`, `.prettierignore`. Lint MUST ignore `node_modules/`, `.expo/`, and `dist/` (declared in `eslint.config.js` via the `ignores` block — `.eslintignore` is deprecated in ESLint v9).

#### Scenario: Lint passes on the bootstrap files

- **WHEN** a developer runs `pnpm lint` against the current repository
- **THEN** ESLint exits with status 0 and reports zero errors against `App.tsx`, `index.ts`, `jest.setup.ts`, `__tests__/smoke.test.tsx`, and the new OpenSpec artifacts in `openspec/`.

#### Scenario: Format check passes

- **WHEN** a developer runs `pnpm format:check`
- **THEN** Prettier exits with status 0 and reports zero files needing reformatting across the repository (excluding the ignore list).

#### Scenario: Auto-format rewrites offending files

- **WHEN** a developer runs `pnpm format`
- **THEN** Prettier rewrites any file that violates its rules, leaves already-formatted files untouched, and exits with status 0.

### Requirement: Imports by concrete path (no barrels)

The repository MUST NOT contain a re-exporting `index.ts` (or barrel file) inside `src/` or `src/shared/ui/`. New code MUST be imported by its concrete file path. This applies to code authored in this change and is enforced by code review on subsequent changes (RFC-002 introduces the first feature module and is the first place the rule can be mechanically checked).

#### Scenario: No barrel exists at the feature root or shared UI root

- **WHEN** a reviewer greps `^export \*` (or any named re-export that aggregates siblings) inside `src/` and `src/shared/ui/`
- **THEN** the search returns zero hits.

#### Scenario: ESLint flags a would-be barrel on lint

- **WHEN** a developer adds `src/features/class-booking/index.ts` that re-exports siblings and runs `pnpm lint`
- **THEN** the lint job fails with a clear violation tied to the project rule documented in `openspec/config.yaml`.

### Requirement: OpenSpec wiring

The repository MUST contain a configured OpenSpec workspace at `openspec/`, with `config.yaml` carrying the full project context (architecture, OOP rules, dependency rule, import rule, TDD cycle, blast radius, PRD §4 messages, timezone rule, persistence policy, commit convention). At least one change MUST exist under `openspec/changes/` (this change). The `openspec validate 001-initialize-project --strict` invocation MUST exit with status 0.

#### Scenario: OpenSpec configuration is present and parseable

- **WHEN** the OpenSpec CLI reads `openspec/config.yaml`
- **THEN** it loads the `context` block, applies the per-artifact `rules` to the `spec-driven` schema, and lists at least one active change.

#### Scenario: Strict validation passes for this change

- **WHEN** a developer runs `npx openspec validate initialize-project --strict` (CLI rejects leading numerics; the canonical change id is `initialize-project`, equivalent to `001-initialize-project`)
- **THEN** OpenSpec reports every required artifact (`proposal`, `specs`, `design`, `tasks`) as present and exits with status 0.

### Requirement: Conventional commits without AI attribution

Commits produced under this change MUST follow the Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`). They MUST NOT contain `Co-Authored-By:` trailers or any other line attributing the commit to an AI tool.

#### Scenario: Commit history is attributable to the developer only

- **WHEN** a reviewer inspects `git log --pretty=fuller` for the last two commits on the current branch
- **THEN** every commit message begins with a valid Conventional Commits prefix and contains no `Co-Authored-By:` line.

### Requirement: Persistence of evidence (verify report)

The apply/verify phase MUST save the real CLI output of `pnpm test`, `pnpm typecheck`, `pnpm lint`, `npx expo-doctor`, and `openspec validate initialize-project --strict` into an artifact (the apply-progress / verify log under this change directory). Output MUST NOT be paraphrased or fabricated.

#### Scenario: Verify log captures real command output

- **WHEN** the verify phase completes
- **THEN** the resulting log file contains the verbatim stdout/stderr of every command, including exit codes, and matches the result of re-running the same commands from the same commit.

### Requirement: Out-of-scope foundation items (PRD §4 messages are NOT foundation)

Functional user-facing messages defined in PRD §4 (`"Esta clase ya no tiene cupos."`, `"Ya reservaste esta clase."`, `"Solo puedes reservar 2 clases por día."`, `"Ya no puedes cancelar: faltan menos de 2 horas."`, `"¡Listo! Tu cupo está reservado"`, `"Aún no tienes reservas"`) belong to the `class-booking` capability (RFC-002). They are listed here only as **context references** and MUST NOT be implemented, rendered, or tested under the `project-foundation` capability.

#### Scenario: No foundation code references a PRD §4 message

- **WHEN** a reviewer greps for any of the six PRD §4 messages inside the repository
- **THEN** every hit is inside `openspec/` documentation files, and zero hits appear in `App.tsx`, `index.ts`, `jest.setup.ts`, or any future `src/` file added by this change.
