## Context

`MyBookingsScreen` is the second tab of the app and the only place where a member cancels a reservation (cancellation lives in Mis reservas only — see `openspec/changes/ui-redesign-clases-screen/design.md` and the Clases ClassCard reserved-state decision). The current `BookingCard` is the legacy plain-white card with a `PrimaryButton`, and the screen wraps it in `SafeAreaView` with tab-bar-aware padding but uses `FlatList` (no day grouping, no brand header, no greeting block).

The Clases redesign (PR #1) introduced the card archetype (2-col, pastel category bg, pixel pattern, instructor avatar, sport-icon cutout, single state-driven `Pill` at the bottom-right of the card). Mis reservas needs to use the same archetype so the two surfaces read as one product.

## Goals / Non-Goals

**Goals:**

- `BookingCard` uses the same archetype as `ClassCard` (2-col layout, pastel category bg, `PixelPattern`, instructor avatar, sport-icon cutout, single `Pill` at the bottom-right).
- The card exposes the same compound API (`Root` / `Body` / `Actions`) so `MyBookingsScreen` keeps the same composition surface.
- `MyBookingsScreen` gains the BrandHeader, greeting block, and day-grouped SectionList — same visual rhythm as the Clases screen.
- The cancellation flow (`CancellationSheet.Root` with session preview) keeps working unchanged.
- Safe-area bottom padding accounts for the floating tab bar (re-uses the same formula as Clases: `max(insets.bottom, spacing.md) + tabBarHeight + spacing.lg`).

**Non-Goals:**

- No change to business rules. The `cancelBooking` use case is untouched.
- No animation, no transitions, no micro-interactions.
- No new shared components. Everything re-uses what `ClassCard` and `Clases` already build on.

## Decisions

### `BookingCard` matches `ClassCard`'s archetype

- 2-col row flex: `leftColumn` (Header + Body) + `rightColumn` (Image, 175×150).
- `PixelPattern` decoration as the first child of the card, low opacity.
- `categoryColor(sessionName)` for the background so each booking card is tinted by its class category.
- `instructorGender(instructor)` + `instructorAvatar(instructor)` for the instructor avatar with fallback to initials.
- `categoryAsset(sessionName)` for the sport-icon cutout on the right.
- Header row: time (HH:MM, large bold) · duration divider · duration (e.g., "60 min") · `gap: 2` to class name.
- Body: avatar + instructor name + "INSTRUCTOR/A" eyebrow.
- `ClassCard.Actions` analogue — `BookingCard.Actions` returns a single `Pill` wrapped in the same `actionsOverlay` (absolute bottom-right of the card).
- Cancellation is the only visible state — pill label `messages.cancelAction`, variant `destructive` (light red bg, dark red text), full-width-or-right-aligned, non-disabled.
- Compound children split: `Children.forEach` routes `BookingCardActions` to the absolute overlay (same pattern as `ClassCard`).

### `MyBookingsScreen` mirrors the Clases rhythm

- Wrap in `SafeAreaView edges={['top']}` (already done).
- `BrandHeader` at the top.
- Greeting block (placeholder title since we don't show "Mis reservas" here anymore — the BrandHeader already carries the brand).
- `FlatList` → `SectionList` grouped by `diaOffset` (0 → `Hoy`, 1 → `Mañana`, 2+ → formatted `es-CO` date) using the injected Clock.
- `useSafeAreaInsets` to compute the list `paddingBottom` (same formula as Clases).
- The empty state (`bookings.length === 0`) keeps its centered message but also gets the BrandHeader + safe-area wrapping so it stays visually consistent with the populated state.

### Cancellation stays exactly the same

`CancellationSheet` already accepts a `sessionPreview` prop (built in the Clases PR). `MyBookingsScreen` keeps building that preview from the selected booking and passes it through. No changes to the sheet.

### No new shared components

Everything `BookingCard` needs (`PixelPattern`, `InstructorAvatar`, `Pill`, `categoryColor`, `categoryAsset`, `instructorGender`) already exists. No new exports from `shared/ui/`.

## Files to be created or modified

```
openspec/changes/redesign-booking-card/
├── proposal.md
├── design.md
├── tasks.md
└── specs/class-booking/spec.md

src/features/class-booking/presentation/
├── components/
│   └── BookingCard.tsx               (rewritten — same archetype as ClassCard)
└── screens/
    └── MyBookingsScreen.tsx           (modified — BrandHeader, SectionList by day, drop inner heading)

__tests__/presentation/
└── BookingCard.test.tsx               (unchanged — existing assertions stay green)

__tests__/presentation/screens/
└── MyBookingsScreen.test.tsx          (unchanged — SafeAreaProvider already in place from the Clases PR)
```

No `App.tsx`, no `package.json`, no `tsconfig.json` change. No new assets.

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## TDD cycle per task

This is a presentational change with no new business behavior. Existing tests must remain green at every step. The 75-test suite is the regression gate.

## Risks

- **BookingCard without a category name** — if `selectedBooking.sessionName` is something other than the four mapped categories (Spinning, Yoga, Rumba, Funcional), `categoryColor` falls back to the Functional pastel and `categoryAsset` returns `null` (no image). Same fallback as `ClassCard`; documented there.
- **Empty state visual** — switching from a centered text to a screen with a `BrandHeader` plus centered text means the empty state is taller. Acceptable on first paint; the `BrandHeader` itself communicates the product.

## Verification

- `pnpm typecheck` clean
- `pnpm lint` 0 warnings
- `pnpm test` 75/75 passing
- `npx expo export --platform android` bundles cleanly (no new assets)