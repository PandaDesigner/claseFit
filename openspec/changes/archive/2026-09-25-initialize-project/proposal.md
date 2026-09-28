# Change 001-initialize-project — Foundation (RFC-001)

- Change ID: `001-initialize-project`
- OpenSpec directory: `openspec/changes/initialize-project/`
- Capability: `project-foundation`
- Schema: `spec-driven`
- RFC: [`001-foundation.md`](https://github.com/KEPPRI/clasefit-planning-es/blob/main/rfcs/001-foundation.md)

## Why

The ClaseFit repository needs a deterministic, testable mobile baseline before any business behavior is written. RFC-001 establishes the **technical foundation and feature-first structure** so that subsequent RFCs (002 specification, 003 implementation, 004 release, 005 evidence) plug into a known surface. Without this change we cannot enforce OOP boundaries, import conventions, TDD discipline, or reproduce build/type/lint status across machines.

This change also captures the **only remaining RFC-001 deliverable** not already committed on the `develop` branch: lint scripts (ESLint + Prettier compatible with Expo 57). The Expo SDK, React Native 0.86, TypeScript strict, Jest + jest-expo + RNTL, React Navigation, Zustand and AsyncStorage are already installed and verified.

## What Changes

- **Adds** OpenSpec change `001-initialize-project` with full proposal/spec/design/tasks artifacts under `openspec/changes/initialize-project/`.
- **Adds** `openspec/specs/project-foundation/spec.md` — the baseline capability (RFC-001).
- **Adds** ESLint v9 flat-config + `eslint-config-expo` + Prettier 3 to `package.json`, with `.eslintrc` / `eslint.config.js`, `.prettierrc`, `.prettierignore`, and `.eslintignore`.
- **Adds** `lint`, `lint:fix`, `format`, and `format:check` scripts to `package.json`.
- **Adds** dependency entries via `npx expo install` so versions stay Expo-aligned: `eslint`, `eslint-config-expo`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `prettier`.
- **Verifies** baseline commands run green: `pnpm test`, `pnpm typecheck`, `npx expo-doctor`, `pnpm lint`, and `openspec validate 001-initialize-project --strict`.
- **No breaking changes.** All new tooling is additive; the existing smoke test, `tsconfig.json`, and `jest.setup.ts` remain untouched.

## Capabilities

### New Capabilities

- `project-foundation` — the technical baseline of the project (RFC-001): toolchain, file layout, lint/format, OpenSpec configuration. Becomes `openspec/specs/project-foundation/spec.md`.

### Modified Capabilities

- None. RFC-002 (`class-booking`) is the next change and is **out of scope** here.

## Impact

- **Repo files**:
  - `package.json` (scripts + devDependencies)
  - `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.eslintignore` (new)
  - `openspec/changes/initialize-project/{proposal,design,tasks}.md` (new)
  - `openspec/changes/initialize-project/specs/project-foundation/spec.md` (new)
  - `openspec/specs/project-foundation/spec.md` (new — produced at archive time)
- **Tooling surface**: adds ESLint + Prettier but does not modify `tsconfig.json`, `jest.config`, or `jest.setup.ts`.
- **CI/dev workflow**: future PRs must run `pnpm lint` and `pnpm test` before merging. No CI wiring change is in scope.
- **Out of scope (non-goals)**:
  - Business logic, screens, hooks, store — RFC-002.
  - Persistence adapters, ports, DTOs — RFC-002.
  - Visual design tokens, components, copy — RFC-002.
  - APK build, EAS workflow, store submission — RFC-004/005.
  - Wiring OpenSpec into a third-party tool beyond what is already configured.

## Traceability

| Source                                                  | Citation                                                                                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| RFC-001 §"Tareas de configuración y criterio de cierre" | mandates scripts for tests, typecheck, lint; conventional commit; no attribution lines                                             |
| RFC-001 §"Regla de imports (sin barrels)"               | forbids `index.ts` re-export; honored by leaving `src/` and `shared/ui/` empty until RFC-002                                       |
| RFC-001 §"Blast radius al cambiar un adaptador"         | informational; no adapters exist in this change — first adapters land in RFC-002                                                   |
| `openspec/config.yaml` rules.*                          | applied verbatim to every artifact of this change                                                                                  |
| PRD §4 (functional messages RN-01..RN-04, FR-05, FR-06) | cited in `project-foundation` spec only as **context** — the messages belong to the `class-booking` capability, not the foundation |
