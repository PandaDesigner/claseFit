# ClaseFit

Mobile MVP for gym class reservations (Medellín). Actor: Laura Gómez (S-0001). Browse upcoming classes, reserve, cancel.

**Stack**: Expo · React Native · TypeScript strict · Jest + RNTL · React Navigation · Zustand · AsyncStorage · EAS.

---

## Quick start

```bash
pnpm install
pnpm test          # 96 tests across 21 suites (domain/application/infrastructure/presentation)
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint, 0 warnings
pnpm format:check  # prettier
pnpm format        # prettier --write
pnpm start         # Expo dev server (QR + Expo Go)
pnpm android       # native build on the connected device (uses committed android/)
pnpm setup:review  # installs the GGA pre-commit hook
```

---

## Project structure

```
clasefit/
├── App.tsx                          Expo entry — wraps the tree in <SafeAreaProvider>
├── app.json                         Expo config — package, icons, plugins
├── package.json                     Scripts + deps + jest config
├── tsconfig.json                    TypeScript strict
├── AGENTS.md                        Code-review rules for GGA
├── .gga                             GGA config — provider, file patterns, strict mode
├── android/                         Expo-generated Android native project
├── openspec/
│   ├── config.yaml                  Architecture + workflow context (authoritative)
│   └── changes/                     Every change lives here with proposal/design/tasks/spec
├── src/
│   ├── features/class-booking/      The single bounded context (hexagonal)
│   │   ├── domain/                  Entities, states, policies, errors
│   │   ├── application/             Use cases, ports, DTOs, queries
│   │   ├── infrastructure/          Persistence, state adapters, clock, fixtures
│   │   ├── presentation/            Screens, components, hooks, copy
│   │   ├── composition.ts           The only file that imports concrete adapters
│   │   └── compositionProvider.tsx  React context that exposes the composition
│   └── shared/
│       └── ui/                      Brand-agnostic primitives (Pill, BrandHeader, ...)
└── __tests__/                       One file per component / query / use case
```

---

## Architecture (summary)

**Hexagonal / Ports & Adapters.** Strict dependency rule:

```
presentation → application → domain
infrastructure implements application/ports
shared/ui does NOT import features
composition.ts is the only file that imports concrete adapters
```

Business logic NEVER lives in components. Validation, capacity math, daily-limit checks, state transitions live in `domain/` or `application/use-cases/`. The full contract is in `openspec/config.yaml`.

---

## Scripts

| Script                              | What                                             |
| ----------------------------------- | ------------------------------------------------ |
| `pnpm start`                        | Expo dev server (QR + Expo Go)                   |
| `pnpm android` / `pnpm ios`         | Native build on the connected device / simulator |
| `pnpm web`                          | Web build (same JS bundle)                       |
| `pnpm test`                         | Jest, 21 suites / 96 tests                       |
| `pnpm test:watch`                   | Jest watch mode                                  |
| `pnpm test:coverage`                | Jest with coverage                               |
| `pnpm typecheck`                    | `tsc --noEmit`                                   |
| `pnpm lint` / `pnpm lint:fix`       | ESLint, 0 warnings enforced                      |
| `pnpm format` / `pnpm format:check` | Prettier                                         |
| `pnpm setup:review`                 | Installs the GGA pre-commit hook                 |

---

## Code review (GGA)

Every commit is reviewed by [Gentleman Guardian Angel](https://github.com/Gentleman-Programming/gentleman-guardian-angel) — a provider-agnostic code reviewer (Claude / Gemini / Codex / OpenCode / Ollama / etc).

- Rules live in `AGENTS.md` at the repo root.
- Provider default is `claude`. Override per-developer via `~/.config/gga/config`.
- Run once after cloning: `pnpm setup:review` (installs the pre-commit hook).
- The same review runs in CI on every PR and every push to `develop` (`.github/workflows/gga.yml`).
- `STRICT_MODE=true`: ambiguous AI responses fail the commit. No silent passes.

To run manually on staged files:

```bash
gga run
```

---

## OpenSpec workflow

Every change lives under `openspec/changes/<name>/` with:

- `proposal.md` — Why, What Changes, Impact, Non-goals
- `design.md` — Decisions, files, ports, TDD, risks, verification
- `tasks.md` — Phased checklist with verification gates
- `specs/<capability>/spec.md` — Delta spec (REQUIRED when behavior changes)

The architecture contract, commit conventions, and OpenSpec rules are in `openspec/config.yaml` — read it first.

PRs reference the OpenSpec change in their body. Archive the change (or leave it under `openspec/changes/` for traceability) once the PR is merged.

---

## Testing

```
pnpm test
```

21 suites, 96 tests (re-verified 2026-09-26 against the current commit). Domain and application tests run **without** React, Zustand, or AsyncStorage — they only exercise the business logic with in-memory doubles (`InMemoryBookingRepository`, `InMemoryBookingStateAdapter`, `FixedClock`).

The 96-test gate is the regression floor. Every PR must keep it green.

---

## Native build

The `android/` directory is committed (Expo's `prebuild` output) so a fresh clone builds locally without re-running prebuild:

```bash
pnpm android   # builds and runs on the connected Android device
```

EAS handles signed cloud builds for distribution. Profiles are defined in `eas.json`:

- `development` — dev client with `expo-dev-client`
- `preview` — signed APK for internal testing (see **Try it** below)
- `production` — auto-incrementing version for Play Store submission

```bash
eas build -p android --profile preview   # internal APK
eas build -p android --profile production
```

---

## Functional messages (PRD §4 — literal)

```
RN-01 (capacity):  "Esta clase ya no tiene cupos."
RN-02 (duplicate): "Ya reservaste esta clase."
RN-03 (daily):     "Solo puedes reservar 2 clases por día."
RN-04 (cancel):    "Ya no puedes cancelar: faltan menos de 2 horas."
FR-05 (success):   "¡Listo! Tu cupo está reservado"
FR-06 (empty):     "Aún no tienes reservas"
```

Deterministic precedence when multiple rules fail: RN-01 → RN-02 → RN-03.

---

## Try it

The latest signed `preview` APK (Android) is built via EAS. Scan the QR with your phone's camera to start the download, or use the direct link.

![Scan to download the ClaseFit preview APK](./assets/preview-apk-qr.png)

- **APK direct download**: <https://expo.dev/artifacts/eas/Sh-zQ0JQGsDoemTtfI-kN_FsUDVYPRcMhKQ9SnZUbU0.apk>
- **EAS build page** (with logs + alternate install options): <https://expo.dev/accounts/panda-designer/projects/clasefit/builds/2d84bc69-45a2-4b33-bb6b-c041f012cb5e>

Sideload onto a connected device:

```bash
adb install -r https://expo.dev/artifacts/eas/Sh-zQ0JQGsDoemTtfI-kN_FsUDVYPRcMhKQ9SnZUbU0.apk
```

You may need to enable **Install unknown apps** for your browser or `adb` source in Android settings. The bundle id is `com.pandadesigner.clasefit`.

> **Freshness note (2026-09-26)**: the URLs above point at the last signed
> `preview` APK produced by EAS for this project. EAS artifacts expire and
> rotate; before sharing externally, re-run `eas build -p android --profile preview`
> and update the links if needed. The remaining blockers for store
> publication (Play Console / Apple Developer / privacy / listing) are
> tracked in `docs/checklist_release.md`.
