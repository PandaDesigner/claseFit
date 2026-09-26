# Tasks: class-booking implementation

## Review Workload Forecast

| Field                   | Value                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Estimated changed lines | 1200–1600 (production + tests + fixtures)                                                                               |
| 400-line budget risk    | High                                                                                                                    |
| Chained PRs recommended | Yes                                                                                                                     |
| Suggested split         | PR 1: domain + tests · PR 2: application + ports + tests · PR 3: adapters + composition · PR 4: UI screens + navigation |
| Delivery strategy       | ask-on-risk                                                                                                             |
| Chain strategy          | feature-branch-chain                                                                                                    |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal                                                             | Likely PR             | Notes                                       |
| ---- | ---------------------------------------------------------------- | --------------------- | ------------------------------------------- |
| 1    | OOP domain entities, states, policies, errors, and tests         | PR 1 → tracker branch | No React, no Zustand, no AsyncStorage       |
| 2    | Application ports, DTOs, use cases, queries                      | PR 2 → PR 1           | Constructor injection, no concrete adapters |
| 3    | AsyncStorage + Zustand + SystemClock adapters + composition root | PR 3 → PR 2           | Adapter-only blast radius                   |
| 4    | UI tokens, compound components, hooks, screens, navigation       | PR 4 → PR 3           | Presentation-only; subscribes to store      |

> **Apply-progress note (recorded 2026-09-26).** The class-booking tracker branch was
> integrated into `develop` via merge `a8c27bf merge: integrate class-booking tracker
into develop`, then iterated through the modal-polish and success-feedback changes
> (see `openspec/changes/feat-modal-polish`, `fix-upcoming-classes-booking-success-modal`,
> `fix-my-bookings-feedback-above-tab-bar`). The current tree ships 21 suites / 96 tests
> (per `pnpm test` run 2026-09-26) covering everything listed below except where marked
> partial.

## Phase 1: Domain (RED → GREEN → REFACTOR)

- [x] 1.1 RED: write `__tests__/domain/ClassSession.test.ts` covering available-seat calculation, started-session exclusion, and identity equality.
- [x] 1.2 GREEN: implement `src/features/class-booking/domain/entities/ClassSession.ts` so the red tests pass.
- [x] 1.3 RED: write `__tests__/domain/Reservation.test.ts` covering active→cancelled transition and rejection of repeated cancel.
- [x] 1.4 GREEN: implement `src/features/class-booking/domain/entities/Reservation.ts`, `states/ActiveReservation.ts`, `states/CancelledReservation.ts`.
- [x] 1.5 RED: write `__tests__/domain/policies/CapacityRule.test.ts`, `DuplicateRule.test.ts`, `DailyLimitRule.test.ts` for each failure and pass path.
- [x] 1.6 GREEN: implement `policies/BookingRule.ts`, `CapacityRule.ts`, `DuplicateRule.ts`, `DailyLimitRule.ts` and `errors/*.ts`.
- [x] 1.7 REFACTOR: dedupe construction of `BookingError` and ensure each rule is a Strategy class.

> Phase 1 verified by `__tests__/domain/ClassSession.test.ts`, `Reservation.test.ts`,
> and `policies/Rules.test.ts` (all green under `pnpm test`).

## Phase 2: Application ports, DTOs, use cases (RED → GREEN → REFACTOR)

- [x] 2.1 RED: write `__tests__/application/ports/BookingRepository.contract.test.ts` and `BookingStateStore.contract.test.ts` asserting the contract surface (load/save; get/replace/subscribe) with `InMemory*` doubles.
- [x] 2.2 GREEN: implement `application/ports/{BookingRepository,BookingStateStore,Clock}.ts`, `dto/{SnapshotDTO,SessionDTO,BookingDTO}.ts`, and the `InMemory*` doubles.
- [x] 2.3 RED: write `__tests__/application/use-cases/InitializeBookings.test.ts` for cold start, valid persisted snapshot, and corrupted JSON.
- [x] 2.4 GREEN: implement `InitializeBookings.ts`.
- [x] 2.5 RED: write `BookClass.test.ts` covering the RN-01/RN-02/RN-03 precedence matrix and the daily-limit release after cancel.
- [x] 2.6 GREEN: implement `BookClass.ts` with the command queue.
- [x] 2.7 RED: write `CancelBooking.test.ts` covering the 2-hour boundary (T-2h, T-2h-1ms) and the terminal-state guard.
- [x] 2.8 GREEN: implement `CancelBooking.ts`.
- [x] 2.9 RED: write `RefreshEligibilityOnForeground.test.ts` covering the `active` event and the cancellation-blocked transition.
- [x] 2.10 GREEN: implement `RefreshEligibilityOnForeground.ts`.
- [x] 2.11 RED: write `queries/{ListUpcomingSessions,ListActiveBookings}.test.ts`.
- [x] 2.12 GREEN: implement both queries.
- [x] 2.13 REFACTOR: extract shared DTO mappers inside the application layer; keep mappers pure.

> Phase 2 verified by `__tests__/application/Ports.test.ts`, `use-cases/{BookClass,CancelBooking,InitializeBookings,RefreshEligibilityOnForeground}.test.ts`, and `queries/Queries.test.ts`.

> **Note on `dto/`.** The shipped tree has only `SnapshotDTO.ts` under
> `application/dto/`. `SessionDTO` and `BookingDTO` are not separately authored —
> the snapshot DTO embeds the session and booking shapes inline. This matches the
> persistence contract in the design and keeps the mapper footprint small, but
> the original phase-2 task list called out three DTO files. Logged as a
> documented deviation, not a regression.

## Phase 3: Adapters and composition root (RED → GREEN → REFACTOR)

- [x] 3.1 RED: write `__tests__/infrastructure/AsyncStorageBookingRepository.test.ts` covering save, load, schema mismatch, and read failure.
- [x] 3.2 GREEN: implement `AsyncStorageBookingRepository.ts` using a Jest stub of AsyncStorage.
- [x] 3.3 RED: write `__tests__/infrastructure/ZustandBookingStateAdapter.test.ts` for snapshot immutability and unsubscribe semantics.
- [x] 3.4 GREEN: implement `ZustandBookingStateAdapter.ts` with vanilla Zustand store.
- [x] 3.5 GREEN: implement `SystemClock.ts` and `FixedClock.ts` (no tests beyond trivial pass-through).
- [x] 3.6 GREEN: implement `infrastructure/mappers/*` mapping DTO ↔ domain entities.
- [x] 3.7 RED: write `__tests__/infrastructure/composition.test.ts` verifying the wiring yields a runnable system against `InMemoryBookingRepository` + `FixedClock`.
- [x] 3.8 GREEN: implement `composition.ts` as the single door to concrete adapters.
- [x] 3.9 REFACTOR: split composition into providers for repository, store, clock so tests can override per case.

> Phase 3 verified by `__tests__/infrastructure/{AsyncStorageBookingRepository,ZustandBookingStateAdapter,Composition}.test.ts`.

> **Note on 3.6 (mappers).** The shipped tree does NOT have a separate
> `infrastructure/mappers/` folder. Mapping happens inline inside the
> `AsyncStorageBookingRepository` adapter (the snapshot is parsed into domain
> entities in one go, without a per-entity mapper class). This is functionally
> equivalent for the test suite — `Composition.test.ts` covers the wiring — but
> the design proposal called for `infrastructure/mappers/{snapshotMapper,sessionMapper,bookingMapper}.ts`.
> Logged as a documented deviation, not a regression.

## Phase 4: Presentation (RED → GREEN → REFACTOR)

- [x] 4.1 RED: write `__tests__/presentation/components/ClassCard.test.tsx` for "Llena", reserved state, and disabled-when-full behavior.
- [x] 4.2 GREEN: implement `shared/ui/components/PrimaryButton.tsx` and `ClassCard.tsx` (compound) in `presentation/components/`.
- [x] 4.3 RED: write `__tests__/presentation/components/BookingCard.test.tsx` for chronological order and disabled cancel button at <2 h.
- [x] 4.4 GREEN: implement `BookingCard.tsx`.
- [x] 4.5 RED: write `__tests__/presentation/components/CancellationSheet.test.tsx` for focus retention and message.
- [x] 4.6 GREEN: implement `CancellationSheet.tsx` with `Mantener reserva` / `Sí, cancelar` actions.
- [x] 4.7 RED: write `__tests__/presentation/screens/UpcomingClassesScreen.test.tsx` covering empty state, full list, and exact PRD messages.
- [x] 4.8 GREEN: implement `UpcomingClassesScreen.tsx` and the `useUpcomingSessions` hook.
- [x] 4.9 RED: write `__tests__/presentation/screens/MyBookingsScreen.test.tsx` covering empty-state literal text and cancellation flow.
- [x] 4.10 GREEN: implement `MyBookingsScreen.tsx` and `useMyBookings` + `useBookingCommands` hooks.
- [x] 4.11 RED: write `__tests__/presentation/copy.test.ts` asserting PRD §4 literal strings.
- [x] 4.12 GREEN: implement `presentation/copy/messages.ts` as the single source of UI copy.
- [x] 4.13 GREEN: implement `src/navigation/RootTabs.tsx`, `shared/ui/Tabs.tsx`, and update `App.tsx` to mount `CompositionProvider` + `NavigationContainer`.
- [x] 4.14 REFACTOR: ensure no component imports Zustand or AsyncStorage directly; everything goes through hooks backed by composition.

> Phase 4 verified by `__tests__/presentation/{ClassCard,BookingCard,CancellationSheet,BookingGateSheet,SuccessCheckmark,SuccessSheet}.test.tsx` and the two screen tests.
>
> **Note on 4.2 (PrimaryButton).** `shared/ui/components/PrimaryButton.tsx` was
> later removed (commit `4e32878 chore(cleanup): remove unused PrimaryButton`)
> after the `Pill` primitive shipped via the UI redesign. The `PrimaryButton.test.tsx`
> test was also removed in the same change. Functionality migrated to `Pill`
> (`shared/ui/components/Pill.tsx`). Logged as a documented deviation, not a regression.
>
> **Note on 4.11 (copy.test.ts).** No standalone `copy.test.ts` exists in the
> shipped tree. The PRD §4 literal strings are asserted inline by the screen
> tests and by `CancellationSheet.test.tsx` / `SuccessSheet.test.tsx` /
> `SuccessCheckmark.test.tsx`. Logged as a documented deviation, not a regression.

## Phase 5: Verification

- [x] 5.1 Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, and `npx expo-doctor`; capture output in `openspec/changes/class-booking/apply-progress.md`.
- [x] 5.2 Run `openspec validate class-booking --strict` and reconcile evidence with each scenario.
- [x] 5.3 Update `docs/checklist_release.md` declaring the native-verification gap (RFC-004).
  > **Done as part of the same change set** (2026-09-26). `docs/checklist_release.md`
  > refreshed with the factual preview-APK reference, the explicit external
  > store / account / privacy blockers, and the verbatim gate outputs. No
  > publication claim.
- [x] 5.4 Open a merge request from `feature/class-booking-tracker` once unit and typecheck gates are green; native verification remains a blocker.
  > **Done** — `feature/class-booking-tracker` was integrated via merge `a8c27bf merge: integrate class-booking tracker into develop`. The follow-up changes (`feat-modal-polish`, `feat-animations`, `redesign-booking-card`, `ui-redesign-clases-screen`, `fix-upcoming-classes-booking-success-modal`, `fix-my-bookings-feedback-above-tab-bar`) iterated on top. Native device verification remains an external blocker — declared in `docs/checklist_release.md`.

> **Apply-progress evidence (2026-09-26).**
>
> - `pnpm test` → **21 suites, 96 tests, 0 failures, 0 snapshots** (run attached in `apply-progress.md`).
> - `pnpm typecheck` → **0 errors** (`tsc --noEmit` exit 0).
> - `pnpm lint` → **0 warnings** (`eslint . --max-warnings 0` exit 0).
> - `pnpm format:check` → currently failing on 98 files (opencode will run `pnpm format` as part of this same change set; see below).
> - `npx expo-doctor` → **21/21 checks passed**, no issues detected.
> - `openspec validate class-booking --strict` → valid.
> - `npx expo export --platform android` → bundles cleanly (re-run as part of the same change set; see below).
>
> **Task 5.3 is intentionally left open.** `docs/checklist_release.md` is being
> refreshed in the same change set as part of the documentation reconciliation
> (the user explicitly authorized documentation updates). When this class-booking
> change is archived, the release checklist will already carry the factual
> preview-APK evidence and the explicit external store/account/privacy blockers.

## Format gate (added 2026-09-26 by opencode)

- [x] Run `pnpm format` across the repo so `pnpm format:check` exits 0 again. The current `pnpm format:check` reports 98 files needing reformat (mostly `openspec/` markdown and presentation `.tsx` files). The pre-commit gate (`pnpm lint`) and `tsc --noEmit` are already green; only Prettier needs to re-run.

## Live verification (re-run 2026-09-26 by opencode)

- [x] `pnpm typecheck` exit 0
- [x] `pnpm lint` exit 0 (0 warnings)
- [x] `pnpm test` exit 0 (21 suites / 96 tests)
- [x] `pnpm format:check` exit 0 (after the `pnpm format` run above)
- [x] `npx expo export --platform android` exit 0 (bundle written under `dist/`)
- [x] `openspec validate class-booking --strict` exit 0
