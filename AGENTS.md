# ClaseFit — Code Review Standards

These rules are read by `gga` during automated pre-commit and PR reviews.

## Architecture (Strict Hexagonal — non-negotiable)

- **Dependency rule**: `presentation → application → domain`. Infrastructure implements `application/ports`; only `composition.ts` knows concrete adapters.
- **No business logic in components**. Validation, capacity math, daily-limit checks, state transitions → `domain/` or `application/use-cases/`.
- **No direct store mutation from hooks/screens**. Components call use cases, which publish through the port.
- **`shared/ui` does NOT import features**. UI primitives are domain-agnostic.

## Domain Model

- `ClassSession` and `Reservation` are entities with encapsulated invariants — expose behavior (`available`, `isFull`, `hasStartedAt`), not raw getters.
- `Reservation` is a state machine (`ActiveReservation` / `CancelledReservation`). The terminal state rejects further transitions. Return a new instance, don't mutate.
- `BookingRule` is a Strategy contract. Evaluation order is deterministic (RN-01 → RN-02 → RN-03).

## Use Cases

- Imperative verb names: `InitializeBookings`, `BookClass`, `CancelBooking`, `RefreshEligibilityOnForeground`.
- Constructor injection from `composition.ts`. No service locator, no DI container.
- Command queue serializes same-session writes (`BookClass`, `CancelBooking`).

## Presentation

- **React functional components only**. No classes.
- **Compound components** for widgets with multiple parts sharing context (`ClassCard.Root/Header/Body/Actions`, `CancellationSheet.Root/...`).
  - Shared state via internal Context, never via boolean-prop proliferation.
- **Hooks** only subscribe to the store and delegate to use cases.
- **No `Date.now()` leaks**. Time comes from the injected `Clock`.
- **Imports by concrete path**, never via barrels.
- **Conventional Commits only** (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`). No AI attribution, no `Co-Authored-By:`.

## OpenSpec Workflow

- Every change lives under `openspec/changes/<name>/` with `proposal.md`, `design.md`, `tasks.md`, and `specs/<capability>/spec.md` (delta).
- Each task carries a RED → GREEN → REFACTOR cycle when applicable.
- Domain and application tests run **without** React, Zustand, or AsyncStorage.

## Persistence

- Snapshot is versioned JSON (`schemaVersion`, `datasetVersion`, `baseDateBogota`).
- Single command queue per feature. Pessimistic serialized writes.
- Do not write default empty state before hydration finishes.

## Functional Messages (PRD §4 — literal, no paraphrasing)

```
RN-01 (capacity):  "Esta clase ya no tiene cupos."
RN-02 (duplicate): "Ya reservaste esta clase."
RN-03 (daily):     "Solo puedes reservar 2 clases por día."
RN-04 (cancel):    "Ya no puedes cancelar: faltan menos de 2 horas."
FR-05 (success):   "¡Listo! Tu cupo está reservado"
FR-06 (empty):     "Aún no tienes reservas"
```

## Reject If

- A presentation component or hook computes availability, validates eligibility, or mutates state.
- A new use case is added without explicit constructor injection.
- A test relies on `Date.now()` instead of an injected Clock.
- An import uses a barrel (`@features/...` without the full path, or `src/shared/...` barrel).
- A commit message includes `Co-Authored-By:` or other AI attribution.
- A change touches domain / application / infrastructure without updating `openspec/changes/`.
- A new boolean prop (`isLoading`, `hasIcon`, …) is added to a shared component instead of restructuring it as compound.

## Style

- TypeScript strict. No `any`, no `as` casts except at asset-require boundaries.
- Tests: 21 suites, 96 tests. Every change must keep them green.
- `pnpm typecheck`, `pnpm lint` (0 warnings), `pnpm test`, `npx expo export --platform android` must all pass.
