# project-readme Specification

## Purpose

TBD - created by archiving change docs-add-readme. Update Purpose after archive.

## Requirements

### Requirement: A top-level README.md covers the day-one contributor surface

The repository MUST contain a `README.md` at the repo root that covers, in this order:

1. Title and one-line tagline (what the app is, the gym, the actor).
2. **Quick start** — `pnpm install`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm start` (Expo dev server), `pnpm android` (native build), `pnpm setup:review` (GGA hook).
3. **Project structure** — annotated tree covering `App.tsx`, `index.ts`, `app.json`, `package.json`, `tsconfig.json`, `AGENTS.md`, `.gga`, `android/`, `openspec/`, `src/features/class-booking/`, `src/shared/ui/`, `src/navigation/`, `__tests__/`.
4. **Architecture** — short summary of the hexagonal dependency rule (presentation → application → domain; infrastructure implements `application/ports`; only `composition.ts` knows concrete adapters) and a pointer to `openspec/config.yaml` for the authoritative contract.
5. **Scripts** — table from `package.json` with one-line descriptions.
6. **Code review (GGA)** — `pnpm setup:review`, where rules live (`AGENTS.md`), where provider config lives (`.gga`), the CI workflow (`.github/workflows/gga.yml`).
7. **OpenSpec workflow** — every change lives under `openspec/changes/<name>/` with `proposal.md`, `design.md`, `tasks.md`, and `specs/<capability>/spec.md` (delta); the authoritative context is `openspec/config.yaml`.
8. **Testing** — `pnpm test`, what the suites cover (domain / application / infrastructure / presentation), and the rule that domain and application tests run WITHOUT React, Zustand, or AsyncStorage.
9. **Native build** — `pnpm android` uses the committed `android/`; EAS Build (`eas.json`) handles signed cloud builds.
10. **Try it** — link to the latest signed preview APK and the EAS build page (when one exists).

The README MUST be in English. It MUST NOT include marketing fluff, badges, "built with love" lines, or AI attribution.

#### Scenario: A fresh contributor can follow the README end-to-end

- **WHEN** a developer runs `git clone` and follows the README in order (install → test → run → review setup)
- **THEN** they reach a running Expo dev server without asking any questions.

#### Scenario: The README points at authoritative docs for everything that might drift

- **WHEN** a reviewer checks sections 4 (architecture), 6 (code review), and 7 (OpenSpec workflow)
- **THEN** each section links to `openspec/config.yaml`, `AGENTS.md`, or `.gga` for the full contract — the README is the index, not the source of truth.
