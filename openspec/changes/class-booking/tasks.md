# Tasks: class-booking implementation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1200–1600 (production + tests + fixtures) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: domain + tests · PR 2: application + ports + tests · PR 3: adapters + composition · PR 4: UI screens + navigation |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | OOP domain entities, states, policies, errors, and tests | PR 1 → tracker branch | No React, no Zustand, no AsyncStorage |
| 2 | Application ports, DTOs, use cases, queries | PR 2 → PR 1 | Constructor injection, no concrete adapters |
| 3 | AsyncStorage + Zustand + SystemClock adapters + composition root | PR 3 → PR 2 | Adapter-only blast radius |
| 4 | UI tokens, compound components, hooks, screens, navigation | PR 4 → PR 3 | Presentation-only; subscribes to store |

## Phase 1: Domain (RED → GREEN → REFACTOR)

- [ ] 1.1 RED: write `__tests__/domain/ClassSession.test.ts` covering available-seat calculation, started-session exclusion, and identity equality.
- [ ] 1.2 GREEN: implement `src/features/class-booking/domain/entities/ClassSession.ts` so the red tests pass.
- [ ] 1.3 RED: write `__tests__/domain/Reservation.test.ts` covering active→cancelled transition and rejection of repeated cancel.
- [ ] 1.4 GREEN: implement `src/features/class-booking/domain/entities/Reservation.ts`, `states/ActiveReservation.ts`, `states/CancelledReservation.ts`.
- [ ] 1.5 RED: write `__tests__/domain/policies/CapacityRule.test.ts`, `DuplicateRule.test.ts`, `DailyLimitRule.test.ts` for each failure and pass path.
- [ ] 1.6 GREEN: implement `policies/BookingRule.ts`, `CapacityRule.ts`, `DuplicateRule.ts`, `DailyLimitRule.ts` and `errors/*.ts`.
- [ ] 1.7 REFACTOR: dedupe construction of `BookingError` and ensure each rule is a Strategy class.

## Phase 2: Application ports, DTOs, use cases (RED → GREEN → REFACTOR)

- [ ] 2.1 RED: write `__tests__/application/ports/BookingRepository.contract.test.ts` and `BookingStateStore.contract.test.ts` asserting the contract surface (load/save; get/replace/subscribe) with `InMemory*` doubles.
- [ ] 2.2 GREEN: implement `application/ports/{BookingRepository,BookingStateStore,Clock}.ts`, `dto/{SnapshotDTO,SessionDTO,BookingDTO}.ts`, and the `InMemory*` doubles.
- [ ] 2.3 RED: write `__tests__/application/use-cases/InitializeBookings.test.ts` for cold start, valid persisted snapshot, and corrupted JSON.
- [ ] 2.4 GREEN: implement `InitializeBookings.ts`.
- [ ] 2.5 RED: write `BookClass.test.ts` covering the RN-01/RN-02/RN-03 precedence matrix and the daily-limit release after cancel.
- [ ] 2.6 GREEN: implement `BookClass.ts` with the command queue.
- [ ] 2.7 RED: write `CancelBooking.test.ts` covering the 2-hour boundary (T-2h, T-2h-1ms) and the terminal-state guard.
- [ ] 2.8 GREEN: implement `CancelBooking.ts`.
- [ ] 2.9 RED: write `RefreshEligibilityOnForeground.test.ts` covering the `active` event and the cancellation-blocked transition.
- [ ] 2.10 GREEN: implement `RefreshEligibilityOnForeground.ts`.
- [ ] 2.11 RED: write `queries/{ListUpcomingSessions,ListActiveBookings}.test.ts`.
- [ ] 2.12 GREEN: implement both queries.
- [ ] 2.13 REFACTOR: extract shared DTO mappers inside the application layer; keep mappers pure.

## Phase 3: Adapters and composition root (RED → GREEN → REFACTOR)

- [ ] 3.1 RED: write `__tests__/infrastructure/AsyncStorageBookingRepository.test.ts` covering save, load, schema mismatch, and read failure.
- [ ] 3.2 GREEN: implement `AsyncStorageBookingRepository.ts` using a Jest stub of AsyncStorage.
- [ ] 3.3 RED: write `__tests__/infrastructure/ZustandBookingStateAdapter.test.ts` for snapshot immutability and unsubscribe semantics.
- [ ] 3.4 GREEN: implement `ZustandBookingStateAdapter.ts` with vanilla Zustand store.
- [ ] 3.5 GREEN: implement `SystemClock.ts` and `FixedClock.ts` (no tests beyond trivial pass-through).
- [ ] 3.6 GREEN: implement `infrastructure/mappers/*` mapping DTO ↔ domain entities.
- [ ] 3.7 RED: write `__tests__/infrastructure/composition.test.ts` verifying the wiring yields a runnable system against `InMemoryBookingRepository` + `FixedClock`.
- [ ] 3.8 GREEN: implement `composition.ts` as the single door to concrete adapters.
- [ ] 3.9 REFACTOR: split composition into providers for repository, store, clock so tests can override per case.

## Phase 4: Presentation (RED → GREEN → REFACTOR)

- [ ] 4.1 RED: write `__tests__/presentation/components/ClassCard.test.tsx` for "Llena", reserved state, and disabled-when-full behavior.
- [ ] 4.2 GREEN: implement `shared/ui/components/PrimaryButton.tsx` and `ClassCard.tsx` (compound) in `presentation/components/`.
- [ ] 4.3 RED: write `__tests__/presentation/components/BookingCard.test.tsx` for chronological order and disabled cancel button at <2 h.
- [ ] 4.4 GREEN: implement `BookingCard.tsx`.
- [ ] 4.5 RED: write `__tests__/presentation/components/CancellationSheet.test.tsx` for focus retention and message.
- [ ] 4.6 GREEN: implement `CancellationSheet.tsx` with `Mantener reserva` / `Sí, cancelar` actions.
- [ ] 4.7 RED: write `__tests__/presentation/screens/UpcomingClassesScreen.test.tsx` covering empty state, full list, and exact PRD messages.
- [ ] 4.8 GREEN: implement `UpcomingClassesScreen.tsx` and the `useUpcomingSessions` hook.
- [ ] 4.9 RED: write `__tests__/presentation/screens/MyBookingsScreen.test.tsx` covering empty-state literal text and cancellation flow.
- [ ] 4.10 GREEN: implement `MyBookingsScreen.tsx` and `useMyBookings` + `useBookingCommands` hooks.
- [ ] 4.11 RED: write `__tests__/presentation/copy.test.ts` asserting PRD §4 literal strings.
- [ ] 4.12 GREEN: implement `presentation/copy/messages.ts` as the single source of UI copy.
- [ ] 4.13 GREEN: implement `src/navigation/RootTabs.tsx`, `shared/ui/Tabs.tsx`, and update `App.tsx` to mount `CompositionProvider` + `NavigationContainer`.
- [ ] 4.14 REFACTOR: ensure no component imports Zustand or AsyncStorage directly; everything goes through hooks backed by composition.

## Phase 5: Verification

- [ ] 5.1 Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, and `npx expo-doctor`; capture output in `openspec/changes/class-booking/apply-progress.md`.
- [ ] 5.2 Run `openspec validate class-booking --strict` and reconcile evidence with each scenario.
- [ ] 5.3 Update `docs/checklist_release.md` declaring the native-verification gap (RFC-004).
- [ ] 5.4 Open a merge request from `feature/class-booking-tracker` once unit and typecheck gates are green; native verification remains a blocker.
