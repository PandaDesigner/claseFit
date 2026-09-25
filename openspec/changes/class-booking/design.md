## Context

`class-booking` introduces the first end-to-end feature on top of the Expo + TypeScript + Zustand + AsyncStorage baseline landed in RFC-001. The repository currently exposes only `App.tsx`, `index.ts`, `assets/`, the OpenSpec configuration, the `project-foundation` capability spec, and tooling (`eslint.config.js`, `.prettierrc`, `jest.setup.ts`, `__tests__/smoke.test.tsx`). The change must deliver Laura's reservation flow without coupling presentation to persistence, while keeping the strict dependency rule that presentation → application → domain with adapters outside that chain.

The user has approved (a) the full RFC-003 implementation, (b) the cancellation boundary at exactly 2 hours (`>= 2h OK; < 2h RN-04`), and (c) allowing re-reservation after cancellation when other rules still pass. The deterministic error precedence RN-01 → RN-02 → RN-03 is locked. The visual contract is `clasefit-planning-es/DESIGN.md` (pastel surfaces, dark controls, 12/24 radii).

## Goals / Non-Goals

**Goals:**

- One bounded context: `class-booking`, owned end-to-end.
- OOP domain (entity `ClassSession`, `Reservation` with active/cancelled states, strategy `BookingRule`, typed errors).
- Three ports and three named adapters (`BookingRepository`, `BookingStateStore`, `Clock`) with constructor injection from a single composition root.
- TDD-first: every task carries a failing red test before any production code is written.
- Pessimistic, serialized local persistence through AsyncStorage with safe hydration.
- Mobile UI: two tabs (`Clases`, `Mis reservas`), cancellation sheet, accessibility labels, exact PRD messages.

**Non-Goals:**

- Networking, auth, payments, push notifications, instructor administration, multi-member coordination.
- Expo Router, Redux Saga, DI containers, generic CRUD frameworks.
- Live native device verification (CLI gates must pass; native verification is logged as a blocker per RFC-004).
- Visual fidelity beyond the DESIGN.md contract (illustrative imagery is deferred).

## Decisions

### Feature-first hexagonal layout under `src/features/class-booking/`

- `domain/` holds pure entities, states, errors, and `policies/` strategies. No React, Zustand, or AsyncStorage imports.
- `application/` defines `use-cases/`, `ports/`, `dto/`, and `queries/`. No concrete adapters.
- `infrastructure/` provides `persistence/`, `state/`, `time/`, `fixtures/`, and `mappers/` named adapters plus their in-memory doubles.
- `presentation/` holds React functional components and hooks. Containers subscribe to the store; presentational components are pure.
- The composition root `src/features/class-booking/composition.ts` is the only file that imports concrete adapters.

Alternative considered: a global `src/shared/booking` tree. Rejected because it spreads ports across folders and breaks the blast-radius rule (changing an adapter should touch only the adapter + composition).

### Three ports, three adapters, no fourth

| Port | Contract | Production adapter | Test double |
|------|----------|--------------------|-------------|
| `BookingRepository` | `load(): Promise<SnapshotDTO \| null>` / `save(snapshot: SnapshotDTO): Promise<void>` with schema-version awareness and recoverable errors | `AsyncStorageBookingRepository` | `InMemoryBookingRepository` (fault-injectable) |
| `BookingStateStore` | Synchronous `getSnapshot()` / `replaceSnapshot(snapshot)` / `subscribe(listener)` returning an unsubscribe; snapshot is immutable | `ZustandBookingStateAdapter` (vanilla store internally) | `InMemoryBookingStateAdapter` |
| `Clock` | `now(): Date` returning the current instant | `SystemClock` | `FixedClock` |

Alternative considered: using the Zustand persist middleware instead of a custom `BookingRepository`. Rejected because it couples hydration to the store and prevents the spec requirement that hydration finish before any command is exposed. The split keeps state and persistence replaceable independently.

### Domain model: `ClassSession`, `Reservation`, `BookingRule`

- `ClassSession` encapsulates the catalog record and computes `available(activeReservationsForMember)` from `cupoTotal - ocupados - activeMemberCount`.
- `Reservation` is an entity with a `status` state machine: `ActiveReservation` allows cancellation; `CancelledReservation` rejects further transitions and is terminal. The class does not expose a `setCancelled` setter — transitions return a new `Reservation` instance.
- `BookingRule` is the Strategy contract. Implementations: `CapacityRule`, `DuplicateRule`, `DailyLimitRule`. `BookClass` evaluates them in order and surfaces the first failure.
- Errors live in `domain/errors/` with typed codes (`NoCapacityError`, `DuplicateBookingError`, `DailyLimitError`, `CancellationWindowError`, `SessionStartedError`, `BookingAlreadyCancelledError`, `SessionNotFoundError`, `ReservationNotFoundError`). Use cases map codes to PRD messages.

Alternative considered: putting rules as plain functions. Rejected because the user explicitly approved RFC-002's strategy requirement, which is also where the deterministic precedence lives.

### Use cases

- `InitializeBookings(Clock, BookingRepository, BookingStateStore)` loads persisted data (or resolves the catalog for the first run) and publishes a snapshot.
- `BookClass(Clock, BookingStateStore, BookingRepository, CommandQueue)` runs the rules, persists, publishes.
- `CancelBooking(Clock, BookingStateStore, BookingRepository, CommandQueue)` validates RN-04, transitions the reservation, persists, publishes.
- `RefreshEligibilityOnForeground(Clock, BookingStateStore)` re-evaluates eligibility on `AppState` `active`.

Alternative considered: a single `BookingService` orchestrator. Rejected because separate imperative-verb use cases keep each one independently testable and map cleanly to spec scenarios.

### Command queue

`BookClass` and `CancelBooking` go through a single per-feature queue that serializes same-session writes. The queue releases on success, on rejection, and on error. The queue is implementation-detail of the use case and is exposed only for tests.

Alternative considered: relying on React's render-once-per-tap. Rejected because RFC-002 requires the queue to be authoritative regardless of UI behavior.

### Persistence contract (`SnapshotDTO`)

Versioned JSON under a single AsyncStorage key:

```
{
  schemaVersion: 1,
  datasetVersion: 1,
  baseDateBogota: "2026-03-02",
  resolvedSessions: [{ id, name, instructor, startISO, durationMin, cupoTotal, ocupados }],
  bookings: [{ id, sessionId, sessionStartISO, status: "active" | "cancelled", createdAtISO, cancelledAtISO? }]
}
```

`InitializeBookings` resolves `diaOffset + hora` against `baseDateBogota` and persists concrete instants. `SessionId` is the original catalog id; identity of a booking is `(sessionId, sessionStartISO)`.

### Files to be created or modified

```
src/features/class-booking/
├── domain/
│   ├── entities/ClassSession.ts
│   ├── entities/Reservation.ts
│   ├── states/ActiveReservation.ts
│   ├── states/CancelledReservation.ts
│   ├── policies/BookingRule.ts
│   ├── policies/CapacityRule.ts
│   ├── policies/DuplicateRule.ts
│   ├── policies/DailyLimitRule.ts
│   └── errors/{NoCapacityError,DuplicateBookingError,DailyLimitError,CancellationWindowError,SessionStartedError,BookingAlreadyCancelledError,SessionNotFoundError,ReservationNotFoundError}.ts
├── application/
│   ├── ports/BookingRepository.ts
│   ├── ports/BookingStateStore.ts
│   ├── ports/Clock.ts
│   ├── dto/{SnapshotDTO,SessionDTO,BookingDTO}.ts
│   ├── use-cases/InitializeBookings.ts
│   ├── use-cases/BookClass.ts
│   ├── use-cases/CancelBooking.ts
│   ├── use-cases/RefreshEligibilityOnForeground.ts
│   └── queries/{ListUpcomingSessions.ts,ListActiveBookings.ts}.ts
├── infrastructure/
│   ├── persistence/AsyncStorageBookingRepository.ts
│   ├── persistence/InMemoryBookingRepository.ts
│   ├── state/ZustandBookingStateAdapter.ts
│   ├── state/InMemoryBookingStateAdapter.ts
│   ├── time/SystemClock.ts
│   ├── time/FixedClock.ts
│   ├── fixtures/clases.json
│   └── mappers/{snapshotMapper,sessionMapper,bookingMapper}.ts
├── presentation/
│   ├── screens/UpcomingClassesScreen.tsx
│   ├── screens/MyBookingsScreen.tsx
│   ├── components/ClassCard.tsx (compound)
│   ├── components/BookingCard.tsx (compound)
│   ├── components/CancellationSheet.tsx (compound)
│   ├── hooks/useUpcomingSessions.ts
│   ├── hooks/useMyBookings.ts
│   ├── hooks/useBookingCommands.ts
│   └── copy/messages.ts (PRD §4 literal strings)
└── composition.ts
src/features/class-booking/compositionProvider.tsx (React context that exposes composition root)
src/shared/ui/{tokens.ts,components/PrimaryButton.tsx,components/Tabs.tsx}
src/navigation/RootTabs.tsx
App.tsx (replace placeholder with CompositionProvider + NavigationContainer)
__tests__/domain/*.test.ts
__tests__/application/*.test.ts
__tests__/infrastructure/*.test.ts
__tests__/presentation/*.test.tsx
```

### Affected ports and adapter swap surface

- Replace `BookingRepository` → touch `infrastructure/persistence/*` + `composition.ts`.
- Replace `BookingStateStore` → touch `infrastructure/state/*` + `composition.ts`.
- Replace `Clock` → touch `infrastructure/time/*` + `composition.ts`.
- Change `CapacityRule` → touch `domain/policies/CapacityRule.ts` and its test only.

## Risks / Trade-offs

- **RN-04 boundary ambiguity**: Spec accepts cancellation at exactly 2 hours (`>= 2h`). Tests pin both the accepted and the rejected case one millisecond apart to prevent regressions. Mitigation: fixed-clock tests at `T-2h` and `T-2h-1ms`.
- **Hydration race**: The UI must not render empty state before persistence finishes. Mitigation: composition initializes the store before the React tree mounts; tests assert `getSnapshot()` is populated before any component receives data.
- **Command queue starvation**: A failing command could block subsequent ones. Mitigation: queue releases on every outcome (success/rejection/error) and is verified by a test that interleaves valid and invalid commands.
- **Session identity drift**: Bookings tied to `(sessionId, sessionStartISO)` survive midnight; tests reset the clock to the next day and re-load.
- **Test runtime**: Avoid bringing AsyncStorage into unit tests. Use `InMemoryBookingRepository` and a native-storage stub only for the AsyncStorage adapter integration test.
- **Native verification gap**: No iOS/Android device is available in this environment. Documented as a blocker in `docs/checklist_release.md` per RFC-004.

## Migration Plan

- Greenfield: no prior data. `InitializeBookings` creates a fresh snapshot from the fixture on first launch.
- Schema version is `1`. Any future migration is explicit and tested.
- Rollback: deleting the AsyncStorage key returns the app to a clean state with a one-time reinitialization on next launch.

## Open Questions

None blocking the implementation. Tabs structure and sheet focus management are addressed in `docs/design.md` updates referenced from `tasks.md`.
