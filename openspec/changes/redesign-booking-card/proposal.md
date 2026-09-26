## Why

The `feat(ui): redesign Clases screen` change brought the Clases surface up to the design model — image-led cards, pixel pattern, brand header, instructor avatar. The Mis reservas surface is the visual twin (same card archetype, same pixel pattern, same instructor identity) but it still uses the legacy plain-white `BookingCard` with a `PrimaryButton`. Two surfaces that should read as one product today read as two unrelated ones.

This change brings Mis reservas to parity with Clases:

- `BookingCard` becomes the same card archetype as `ClassCard` (2-col layout, pastel category background, pixel pattern, instructor avatar, sport-icon cutout).
- The only visible button state is **Cancel** (this is the manage surface — cancellation lives here, never in Clases).
- `MyBookingsScreen` gets the BrandHeader + greeting block + day-grouped SectionList that Clases already has, so the two tabs feel like one product.

No change to domain, application, infrastructure, or the cancellation use case. The session-preview card inside `CancellationSheet` (built in the previous change) is reused as-is.

## What Changes

### New Capabilities

- `class-booking-ui-mis-reservas`: redesigned BookingCard matching ClassCard archetype, redesigned MyBookingsScreen with BrandHeader + day-grouped SectionList.

### Modified Capabilities

- `class-booking` (delta): the presentation of an active reservation is now spec'd (card archetype + day grouping). Business rules (RN-04, FR-05, FR-06) are unchanged.

## Impact

- **Presentation**: rewritten `BookingCard` (Root/Body/Actions compound, same archetype as `ClassCard`), updated `MyBookingsScreen` (BrandHeader + greeting + SectionList by day + safe-area padding).
- **Shared UI**: no new shared components. `PixelPattern`, `InstructorAvatar`, `Pill` (destructive variant), `categoryColor`, `instructorGender`, `formatTime` are reused.
- **Tests**: existing `BookingCard.test.tsx` and `MyBookingsScreen.test.tsx` stay green; no new behavior tests required.
- **Domain/application/infrastructure**: untouched.

## Non-goals

- No new bounded context.
- No change to `domain/`, `application/`, `infrastructure/` layers.
- No new feature flags, no design-system package extraction.
- No CI integration, no GGA rule changes (those are separate PRs).
- No animation, micro-interactions, or gesture handling.
- No new assets (sport icons and instructor headshots already landed in the Clases PR).
