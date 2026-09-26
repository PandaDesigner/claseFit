## Why

The booking success confirmation modal does not appear after booking a class on the Clases screen. The user reports this in production testing: tap "Reservar →" → nothing visible appears (the old toast was invisible / covered / removed).

The commit `54126a8 feat(classes): use BookingSuccessSheet instead of feedback toast on Clases` (PR #8) **only added the new file `BookingSuccessSheet.tsx`** but did NOT modify `UpcomingClassesScreen.tsx` to use it. The screen still renders the old absolute toast (`{feedback ? <View accessibilityRole="alert" style={styles.feedback}>...</View> : null}`) that should have been replaced.

The file was created in a separate commit without the screen update, so the migration was half-done. The toast is rendered as a small `<View>` at `bottom: 24px` on a screen that also has the `FloatingTabBar` at the bottom — and on most devices the toast is rendered correctly but is small and visually weak (it was designed as a temporary fallback during the modal polish work).

This change finishes the migration that PR #8 left half-done: replaces the toast with `<BookingSuccessSheet>` (Modal). Now the modal renders above the floating tab bar (consistent with the rest of the modal layer).

## What Changes

### New Capabilities

None. `BookingSuccessSheet` already exists from PR #8.

### Modified Capabilities

- `class-booking` (delta): the post-booking feedback in `UpcomingClassesScreen` SHALL be a modal (FR-05 literal: "¡Listo! Tu cupo está reservado"). The toast is removed.

## Impact

- **`UpcomingClassesScreen.tsx`** — replaces the `<View>` toast with `<BookingSuccessSheet visible onDismiss={...}>`. Removes the unused `feedback` / `feedbackText` styles. Same import path the file already uses (no new imports needed besides `BookingSuccessSheet`).
- **Tests**: existing 81 tests stay green.

## Non-goals

- No change to the booking use case. No change to the messages.
- No change to the cancellation feedback (already fixed in PR #8).
- No change to the BookingSuccessSheet component.