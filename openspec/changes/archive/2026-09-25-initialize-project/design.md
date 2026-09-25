# Design — 001-initialize-project (project-foundation)

> Cross-references: RFC-001 (§"Tareas de configuración y criterio de cierre"), `openspec/config.yaml` (rules.*), PRD §4 (context only).

## Context

The repository is on the `develop` branch with a clean working tree (only `.vscode/` is untracked, which is not part of this change). Three foundation commits already exist on top of an empty OpenSpec directory:

| Commit    | Subject                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------- |
| `8de1be5` | `chore: bootstrap repository with planning and openspec config`                                    |
| `4c283e6` | `feat: bootstrap Expo 57 + React Native 0.86 + TypeScript strict`                                  |
| `0f5b9f0` | `feat: install complete stack (React Navigation, AsyncStorage, Zustand) and configure Jest + RNTL` |
| `9844e2a` | `merge: integrate Expo TypeScript setup`                                                           |

What is already in place and verified:

- `package.json` declares Expo `~57.0.25`, React `19.2.3`, React Native `0.86.3`, TypeScript `~6.0.3`, Jest `~29.7.0`, jest-expo `~57.0.5`, `@testing-library/react-native` `^14.0.1`, Zustand `^5.0.15`, AsyncStorage `2.2.0`, React Navigation 7.
- `tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`.
- `jest.setup.ts` registers RNTL matchers and silences noisy `console.warn`.
- `App.tsx` and `index.ts` are the Expo entry points.
- `__tests__/smoke.test.tsx` renders a `<Text>Hola, Laura</Text>` and asserts via `toBeOnTheScreen()`.
- `openspec/config.yaml` is fully populated with the project context (architecture, OOP rules, import rule, TDD cycle, blast radius, PRD §4 messages, timezone, persistence policy, commit policy).
- `openspec/specs/` is empty; `openspec/changes/` only has an empty `archive/` folder.

What is **missing** to satisfy RFC-001 §"Tareas de configuración y criterio de cierre":

- Lint scripts (ESLint + Prettier). The RFC explicitly asks for `scripts de pruebas, verificación de tipos y lint`.

What this design will not introduce (handled by RFC-002 / `class-booking`):

- Business logic, screens, hooks, store, adapters.
- PRD §4 functional messages and rules RN-01..RN-04 / FR-05/06.
- The `src/features/class-booking/**` skeleton is **explicitly NOT scaffolded** here (RFC-001 §"Regla de imports" — "no crear index.ts que haga export *"; folding empty stubs in early would create the very barrels the project forbids).

## Goals / Non-Goals

**Goals**

- Add ESLint v9 (flat config) and Prettier 3 wired to a single command each.
- Keep all Expo-aligned versions via `npx expo install` (no `pnpm add` for Expo-managed deps).
- Produce the four OpenSpec artifacts (`proposal`, `specs`, `design`, `tasks`) for the `project-foundation` capability.
- Pass `openspec validate initialize-project --strict`.
- Keep `pnpm test`, `pnpm typecheck`, and `npx expo-doctor` green.
- Save real CLI output for every command run in this change.

**Non-Goals**

- Implement business behavior. PRD §4 messages belong to `class-booking` (RFC-002).
- Modify `tsconfig.json`, `App.tsx`, `index.ts`, `jest.setup.ts`, `__tests__/smoke.test.tsx`, or `app.json`.
- Wire CI, Husky, lint-staged, or pre-commit hooks. Not in RFC-001's task list.
- Create the `src/features/class-booking/**` skeleton (deferred to RFC-002).
- Add Redux, a DI container, a router besides React Navigation, or any extra state library.

## Decisions

### D-1. ESLint v9 with `eslint-config-expo` flat config

- **Choice**: ESLint 9.x + `eslint-config-expo` (`^9.x`), configured via a single `eslint.config.js` at the repo root.
- **Why**: `eslint-config-expo` ships the Expo-recommended rule set tuned for SDK 57 and is the path of least resistance documented by Expo. ESLint 9 is the current major and what `eslint-config-expo` 9 targets.
- **Alternatives considered**:
  - ESLint 8 + legacy `.eslintrc` — rejected: legacy config is on the deprecation path in Expo's tooling and would force a future migration.
  - `typescript-eslint` standalone config without `eslint-config-expo` — rejected: re-deriving Expo's rule set invites drift and surprises on SDK bumps.
- **Concrete files**:
  - `eslint.config.js` (new) — flat config that extends `eslint-config-expo` and adds a no-barrels custom rule restricted to `src/features/**/index.ts` and `src/shared/ui/**/index.ts`.
  - `.eslintignore` (new) — covers `node_modules/`, `.expo/`, `dist/`, `android/`, `ios/`, `web-build/`.
  - `package.json` — adds `lint` / `lint:fix` scripts.

### D-2. Prettier 3 with project defaults

- **Choice**: Prettier `^3.x` with a `.prettierrc` setting `singleQuote: true`, `trailingComma: "all"`, `printWidth: 100`, `semi: true`.
- **Why**: Prettier 3 is current major; the chosen defaults match typical TypeScript + RN style and don't fight `eslint-config-expo`.
- **Alternatives considered**:
  - No formatter — rejected: RFC-001 asks for `lint`; formatting is the cheapest "lint" win and prevents style drift in PRs.
  - dprint — rejected: not standard for Expo/TS projects; brings a non-Node native binary.
- **Concrete files**: `.prettierrc`, `.prettierignore` (excludes `node_modules/`, `.expo/`, `dist/`, lockfiles, `*.png`, `*.jpg`).

### D-3. `npx expo install` for all tool deps

- **Choice**: Add ESLint, Prettier, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, and `eslint-config-expo` via `npx expo install -- --save-dev`.
- **Why**: Expo's CLI resolves versions against the SDK manifest. Even dev deps that touch TypeScript benefit from staying on Expo's matrix.
- **Alternative considered**: `pnpm add --save-dev` — rejected for anything that needs Expo coordination; accepted only as a final fallback if Expo does not recognize the package.

### D-4. OpenSpec capability name

- **Choice**: `project-foundation` (NOT `class-booking`, which is RFC-002).
- **Why**: matches the proposal's Capabilities section and the user's explicit instruction.

### D-5. Files explicitly NOT touched

- `tsconfig.json` — `strict: true` is already set; no change needed.
- `App.tsx`, `index.ts`, `jest.setup.ts`, `__tests__/smoke.test.tsx`, `app.json` — already RFC-001 conformant.
- `openspec/config.yaml` — already populated; not modified.
- `src/`, `src/shared/ui/`, `src/features/` — left absent. RFC-002 introduces the first feature folder.

## Layer boundaries (RFC-001 + RFC-002 preview)

This change introduces **no new layer files** because RFC-001 is a foundation change. The contract is:

```
App.tsx → registerRootComponent → expo entrypoint      (existing, untouched)
openspec/changes/initialize-project/{proposal,design,tasks,specs/**}   (new)
openspec/specs/project-foundation/spec.md                              (created at archive time)
eslint.config.js, .prettierrc, .prettierignore, .eslintignore          (new)
package.json scripts + devDependencies                                 (modified)
```

No `application/ports` are introduced — first ports arrive in RFC-002 with `BookingRepository`, `BookingStateStore`, `Clock`. Blast-radius rule is therefore trivially satisfied for this change.

## Affected ports / adapters

None. The first port (`Clock`) and adapters (`SystemClock`, `FixedClock`) land in RFC-002 / `class-booking`.

## TDD cycle per task

Every task in `tasks.md` follows RED → GREEN → REFACTOR. For a foundation change, "RED" is not a failing unit test but a failing CLI invocation:

| Task                    | RED signal                                                               | GREEN signal             | REFACTOR signal                          |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------ | ---------------------------------------- |
| Add ESLint deps         | `pnpm lint` exits non-zero                                               | exits 0 on current files | tighten rules; revisit ignore list       |
| Add Prettier deps       | `pnpm format:check` exits non-zero                                       | exits 0                  | adjust `.prettierrc`; verify ignore list |
| Write spec/design/tasks | `openspec validate` lists missing artifacts                              | validation passes        | tighten scenarios; link PRD/RFC          |
| Run verify              | any of `test`/`typecheck`/`expo-doctor`/`lint`/`openspec validate` fails | all five pass            | trim noise; archive                      |

## Risks / Trade-offs

- **`eslint-config-expo` version drift** → Mitigation: pin to a minor via `~` in `package.json`; check release notes on every Expo SDK bump.
- **Prettier fights ESLint on stylistic rules** → Mitigation: rely on `eslint-config-expo`'s disabling of stylistic rules; do not add `eslint-plugin-prettier`.
- **No barrel enforcement without code** → mitigation deferred: the rule is documented in `openspec/config.yaml` and verified in the spec by grep. RFC-002 introduces the first module that could host a barrel, so the rule gets mechanical enforcement on the next change.
- **Existing commits predate this change's scope** → mitigation: this change only adds lint; no commit rewriting is needed.

## Migration Plan

Not applicable. The change is purely additive: new scripts, new config files, new artifacts. No code paths are altered; no persistence or storage shape changes.

Rollback strategy: `git revert <merge-or-commit>` removes the lint stack and the OpenSpec change folder in one step. The bootstrap commits remain intact.

## Open Questions

- **Should `pnpm lint` fail on warnings?** Default decision: `eslint . --max-warnings 0` to keep parity with `eslint-config-expo`'s CI example. Revisit if `expo-doctor` introduces noisy advisories later.
- **When does the `src/features/class-booking/**` skeleton land?** Out of scope here; first commit of RFC-002.
