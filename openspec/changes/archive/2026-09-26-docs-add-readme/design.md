## Context

The repository has reached the post-redesign state. Six PRs have landed (or are open): visual redesign of Clases + Mis reservas, GGA pre-commit setup, motion vocabulary, GGA in CI, and the Android native project. None of them added a `README.md` because the OpenSpec artifacts under `openspec/changes/` were enough for the team and the design references lived in `docs/design/`.

For an external contributor (or for the team three months from now) the entry point is missing. The OpenSpec workflow is well documented in `openspec/config.yaml`, but you have to know that file exists to find it. The GGA workflow is well documented in `.gga` and `AGENTS.md`, but you have to know those exist. The quick start (install, test, run) lives in `package.json` scripts but isn't surfaced anywhere prose.

A single `README.md` at the repo root is the smallest change that makes the project legible.

## Goals / Non-Goals

**Goals:**

- One file: `README.md` at the repo root.
- Cover the day-one contributor surface: what is it, how to install, how to run, how to test, how the architecture is laid out, where the OpenSpec workflow lives, where the GGA review setup lives.
- Pointer-style references to the authoritative docs (`openspec/config.yaml`, `openspec/changes/`, `AGENTS.md`, `.gga`). The README is the index; the detailed docs are the body.

**Non-Goals:**

- No CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE — separate changes.
- No CHANGELOG.md. OpenSpec changes archive is the changelog.
- No website or extended docs.
- No translation. README is in English (matches the OpenSpec config language and the PRD).

## Decisions

### README structure

1. **Title + tagline** — one-liner: what the app is, what gym, what stack.
2. **Quick start** — `pnpm install`, `pnpm test`, `pnpm start`, `pnpm android`.
3. **Project structure** — short tree of `src/`, `openspec/`, `.gga`, `AGENTS.md`, `android/`. Two levels deep, with one-line annotations.
4. **Architecture** — links to `openspec/config.yaml` for the full architecture contract; summary of the dependency rule (presentation → application → domain, infrastructure implements application/ports, only `composition.ts` knows concrete adapters).
5. **Scripts** — list from `package.json` with one-line descriptions.
6. **Code review (GGA)** — `pnpm setup:review`, what GGA checks, where rules live (`AGENTS.md`), how CI runs it.
7. **OpenSpec workflow** — every change lives under `openspec/changes/<name>/` with proposal/design/tasks/specs. Commands: read `openspec/config.yaml`.
8. **Testing** — `pnpm test`, what the 19 suites cover, where the architecture tests live.
9. **Native build** — `pnpm android` (uses committed `android/` directory) + the EAS Build follow-up.

### Keep it scannable, not exhaustive

The README points at the existing docs for depth. No copy-paste from `openspec/config.yaml`. Every section is 5–10 lines max.

### No emojis / no AI attribution / no AI-generated fluff

Conventional style: bold headers, code blocks for commands, short paragraphs. No marketing language. No "built with love by". No badges (status badge is a follow-up if the team wants one).

## Files to be created or modified

```
openspec/changes/docs-add-readme/
├── proposal.md
├── design.md
└── tasks.md

README.md                                       (new — the README)
```

No production code change. No test changes. No domain / application / infrastructure touches.

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## TDD cycle per task

This is documentation, not behavior. No RED test required. Verification gates:

- `pnpm typecheck`, `pnpm lint`, `pnpm test` still 76/76 (no code change).
- A fresh contributor can `git clone` and follow the README end-to-end without asking questions.

## Risks

- **Drift** — the README can drift from reality as the project evolves. Mitigated by linking to the authoritative docs (`openspec/config.yaml`, `AGENTS.md`) for anything that might change.
- **Scope creep** — README can grow unbounded. Mitigated by keeping the structure flat and the section count bounded.

## Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm test` 76/76
- A fresh-clone dry run follows the README end-to-end: `pnpm install` → `pnpm test` → `pnpm start`

## Follow-up (not in this PR)

- Status badge (CI status, code coverage, version).
- CONTRIBUTING.md (issue templates, branch conventions, OpenSpec change template).
- LICENSE (MIT if the team agrees).
- GitHub Pages site with extended architecture diagrams.
- Spanish translation of the README (the team uses Rioplatense in PR comments; the README is in English for now).
