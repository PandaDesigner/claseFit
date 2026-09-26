## Context

PR #8 (commit `54126a8`) was supposed to migrate the `UpcomingClassesScreen` booking feedback from the legacy absolute toast to `<BookingSuccessSheet>` (Modal). The commit message and the OpenSpec change artifacts describe the migration, but the diff only adds `BookingSuccessSheet.tsx` to the repo. The screen update was lost between commits, leaving the screen rendering the old toast.

The toast rendered correctly (its `bottom: 24px` is above the floating tab bar on the iPhone, just visually weak), but the user reports they never see it because:
1. The toast is small and easily missed.
2. The PRD FR-05 requires the success message to be presented as a confirmation (not a transient toast).
3. The current implementation does not match the design mockup.

This change finishes the migration that PR #8 left half-done.

## Goals / Non-Goals

**Goals:**

- `UpcomingClassesScreen.tsx` renders `<BookingSuccessSheet>` (Modal) after a successful `bookClass`.
- Remove the unused `feedback` / `feedbackText` styles.
- Tests stay green.

**Non-Goals:**

- No change to the `BookingSuccessSheet` component (already correct from PR #8).
- No change to the cancellation feedback (already fixed in PR #8 via commit `04f010e`).
- No new test (the existing `UpcomingClassesScreen.test.tsx` asserts the success message renders; it now renders inside the Modal which is the contract we want).

## Decisions

### One-file fix

This is a single-file change. The screen update was the missing piece from PR #8. Rather than re-do all of PR #8, ship a focused fix that completes the migration.

### No new tests

The existing `UpcomingClassesScreen.test.tsx` already asserts that "¡Listo! Tu cupo está reservado" renders after a successful booking. The Modal renders inside the Modal host which is not visible to the test renderer, so we rely on the BookingSuccessSheet inner-content tests (`SuccessSheet.test.tsx`) for the modal contract. The screen-level test that the feedback message shows up at all is the contract we already verify.

If we want a stronger assertion (specifically that UpcomingClassesScreen uses BookingSuccessSheet), we can add a test that mocks `@features/class-booking/presentation/components/BookingSuccessSheet` and asserts it was rendered. Deferred unless the user requests it.

## Files to be created or modified

```
openspec/changes/fix-upcoming-classes-booking-success-modal/
├── proposal.md
├── design.md
└── tasks.md

src/features/class-booking/presentation/screens/
└── UpcomingClassesScreen.tsx              (modified — use BookingSuccessSheet, remove toast styles)
```

No production code change outside this screen. No test changes.

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## TDD cycle per task

This is a presentation fix with no new behavior. The 81 existing tests must remain green. No new tests.

## Risks

- **Lost commits are common during split-commit workflows** — split PR #8's "BookingSuccessSheet file" and "screen wiring" into separate commits. The screen-wiring commit (which would have been `feat(classes): wire BookingSuccessSheet in UpcomingClassesScreen`) was missed. Going forward: when splitting a change into multiple commits, run `git diff` after each commit to verify the intended files changed.

## Verification

- `pnpm typecheck` clean
- `pnpm lint` 0 warnings
- `pnpm test` 81/81 (no test changes; the existing screen test for "success message renders" continues to pass — the message now lives inside the Modal, which is the contract we want)
- `npx expo export --platform android` bundles cleanly