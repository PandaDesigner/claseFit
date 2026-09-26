# Tasks: redesign-booking-card

## Review Workload Forecast

| Field                   | Value                                                        |
| ----------------------- | ------------------------------------------------------------ |
| Estimated changed lines | 250–350 (presentation only — 1 component + 1 screen rewrite) |
| 400-line budget risk    | Low                                                          |
| Chained PRs recommended | No — single PR, well-scoped                                  |
| Delivery strategy       | presentational-only                                          |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: Low

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                                                                                                                         | Commit              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| 1    | Rewrite `BookingCard` to match `ClassCard` archetype (2-col, pastel bg, PixelPattern, InstructorAvatar, sport-icon cutout, destructive Pill at bottom-right) | `feat(my-bookings)` |
| 2    | Update `MyBookingsScreen` (drop inner heading, add BrandHeader + greeting, SectionList grouped by day, safe-area bottom padding)                             | `feat(my-bookings)` |
| 3    | OpenSpec change artifacts for traceability                                                                                                                   | `docs(openspec)`    |

## Phase 1: BookingCard

- [x] 1.1 Convert to 2-column row flex (`leftColumn` + `rightColumn`).
- [x] 1.2 Background = `categoryColor(sessionName)`; first child = `PixelPattern`.
- [x] 1.3 Image (sport-icon cutout) is contained in `rightColumn` (175×150, no negative offsets).
- [x] 1.4 Header: time + duration divider + duration + class name (gap: 2 to name).
- [x] 1.5 Body: `InstructorAvatar` + instructor name + INSTRUCTOR/A eyebrow.
- [x] 1.6 `BookingCardActions` returns a single `Pill` (destructive variant, label `messages.cancelAction`, `onPress` = onCancel) wrapped in an `actionsOverlay` (position: absolute, right: lg, bottom: lg).
- [x] 1.7 `Children.forEach` split routes `BookingCardActions` to the absolute overlay (same pattern as ClassCard).

## Phase 2: MyBookingsScreen

- [x] 2.1 Add `BrandHeader` at the top.
- [x] 2.2 Drop the inner "Mis reservas" heading (the BrandHeader already carries the brand identity).
- [x] 2.3 Replace `FlatList` with `SectionList` grouped by `diaOffset` (`Hoy`, `Mañana`, formatted date). Use the injected Clock to compute diaOffset.
- [x] 2.4 `useSafeAreaInsets` to compute list `contentContainerStyle.paddingBottom` so the last card clears the floating tab bar.
- [x] 2.5 Wrap empty state in `SafeAreaView edges={['top']}` with a `BrandHeader` (consistent with populated state).

## Phase 3: OpenSpec change artifacts

- [x] 3.1 `proposal.md` — Why, What Changes, Impact, Non-goals.
- [x] 3.2 `design.md` — decisions, files, ports (none), TDD, risks, verification.
- [x] 3.3 `tasks.md` — this file.
- [x] 3.4 `specs/class-booking/spec.md` — delta spec for the active-reservation card archetype and day-grouped SectionList.

## Verification (must pass before archive)

- [x] `pnpm typecheck` clean
- [x] `pnpm lint` 0 warnings
- [x] `pnpm test` 75/75 passing
- [x] `npx expo export --platform android` bundles cleanly (no new assets)

## Follow-up (not in this PR)

- Animations / micro-interactions on the destructive Pill press (scale 0.97).
- Optional: filter chip on the day heading (e.g., "Hoy · 2 reservas") when the count is meaningful.
- Optional: empty-state illustration (current state uses text only).
