# Tasks: feat-modal-polish

## Review Workload Forecast

| Field                   | Value                                              |
| ----------------------- | -------------------------------------------------- |
| Estimated changed lines | 250–400 (2 modal components + 1 wrapper + tests + screen wiring) |
| 400-line budget risk    | Low                                                |
| Chained PRs recommended | No                                                 |
| Delivery strategy       | UX + refactor                                      |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: Low

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                                              | Commit              |
| ---- | --------------------------------------------------------------------------------- | ------------------- |
| 1    | New `SuccessSheet` primitive in `shared/ui` (with tests)                          | `feat(modal)`       |
| 2    | Move `CancellationSheet` to `shared/ui` + use `<Modal>` (with tests)              | `refactor(modal)`    |
| 3    | `BookingSuccessSheet` wrapper in `features/class-booking/presentation/components/` | `feat(modal)`       |
| 4    | Wire `UpcomingClassesScreen` to use `BookingSuccessSheet`, remove the toast       | `feat(classes)`      |
| 5    | OpenSpec change artifacts                                                          | `docs(openspec)`    |

## Phase 1: `SuccessSheet` (RED → GREEN)

- [x] 1.1 RED: write `__tests__/presentation/SuccessSheet.test.tsx` covering: renders message, `Listo` dismisses, backdrop tap dismisses, hidden when `visible={false}`.
- [x] 1.2 GREEN: create `src/shared/ui/components/SuccessSheet.tsx` using `<Modal>`, drag handle, `<Pressable>` backdrop calling `onDismiss`, single `Pill` action.
- [x] 1.3 Add copy keys to `src/features/class-booking/presentation/copy/messages.ts`: `successTitle`, `successDefaultMessage`, `successCta`.

## Phase 2: `CancellationSheet` → shared/ui + `<Modal>` (RED → GREEN)

- [x] 2.1 RED: update `__tests__/presentation/CancellationSheet.test.tsx`:
  - backdrop tap calls `onKeep`
  - back button calls `onKeep` (via `onRequestClose`)
  - the tree contains a Modal host (assert via `testID="cancellation-modal"`).
- [x] 2.2 GREEN: rewrite `CancellationSheet.tsx` to use `<Modal transparent animationType="slide" onRequestClose={onKeep}>`. Wrap content in a backdrop `Pressable` (testID). Bump title to `fontSize.hero (36)`.
- [x] 2.3 Move the file from `src/features/class-booking/presentation/components/CancellationSheet.tsx` to `src/shared/ui/components/CancellationSheet.tsx`. Update the import in `MyBookingsScreen.tsx` and in the test.

## Phase 3: `BookingSuccessSheet` wrapper

- [x] 3.1 Create `src/features/class-booking/presentation/components/BookingSuccessSheet.tsx`. Compound API: `Root` (visible, onDismiss) + `Message` (children, optional override) + `Actions`. Uses `SuccessSheet` + the booking-specific copy keys.

## Phase 4: Wire `UpcomingClassesScreen`

- [x] 4.1 Remove the toast rendering (`{feedback ? <View>...{feedback}</View> : null}`).
- [x] 4.2 Render `<BookingSuccessSheet.Root visible={Boolean(feedback)} onDismiss={() => setFeedback(null)}>...</BookingSuccessSheet.Root>` after the `<SectionList>`.
- [x] 4.3 Update the `MyBookingsScreen` import path for `CancellationSheet` (moved to shared/ui).

## Phase 5: OpenSpec change artifacts

- [x] 5.1 `proposal.md`, `design.md`, `tasks.md`, `specs/class-booking/spec.md`.

## Verification (must pass before archive)

- [x] `pnpm typecheck` clean
- [x] `pnpm lint` 0 warnings
- [x] `pnpm test` 80/80 passing (76 baseline + new SuccessSheet / CancellationSheet / screen tests)
- [x] `npx expo export --platform android` bundles cleanly

## Follow-up (not in this PR)

- "Ver mi reserva" navigation action in the success modal.
- Celebration animation (confetti / checkmark drawing).
- Swipe-down-to-dismiss gesture (needs `react-native-gesture-handler`).
- iOS native directory (`ios/`) committed.
- EAS Build configuration.