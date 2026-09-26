## Why

The redesigned screens (PR #1 Clases, PR #3 Mis reservas) ship with crisp visual hierarchy but no tactile feedback. CTAs feel flat — pressing a `Reservar` or `Cancelar` Pill produces only an opacity change (0.85) that the eye barely registers on a bright pastel card. The brand header pops in instantly on cold start with no transition.

Small motion lifts the product from "looks designed" to "feels designed":

- Pills compress slightly on press (scale 0.97) — universal affordance for tappable surfaces.
- The brand header fades + slides in on first paint — sets the brand surface, not the screen body.
- Day section headers ease in as the user scrolls past them — reinforces the day grouping introduced in the Clases and Mis reservas redesigns.

These are the only motion changes. The product stays calm — no flashy entry animations on every card, no parallax, no skeleton loaders. This matches the brand voice (disciplina también es bienestar): motion that confirms an action, never competes with it.

## What Changes

### New Capabilities

- `motion-and-micro-interactions`: pill press scale, brand header fade-in, day section header fade-in.

### Modified Capabilities

- `class-booking` (delta): the Pill component (shared/ui) gains a tactile press affordance. Cancellation and reservation CTAs feel responsive without changing their visual identity.

## Impact

- **Shared UI**: `Pill` gains a `transform: scale(0.97)` on press in its existing `pressed` style. `BrandHeader` gains a one-time fade + slide-in via the `Animated` API.
- **Presentation**: `UpcomingClassesScreen` and `MyBookingsScreen` get a one-time fade on their section headers (via `Animated`, triggered when the section appears).
- **No new dependencies**. `Animated` ships with React Native.
- **Tests**: existing 76 tests stay green (no behavior assertions on animation; only structural / text queries).

## Non-goals

- No spring physics, no `react-native-reanimated` dependency.
- No per-card stagger animation (every ClassCard / BookingCard mounting its own animation would compete with the user).
- No skeleton loaders — the screens have no async loading because the data is hydrated synchronously through `useUpcomingSessions` / `useMyBookings`.
- No reduced-motion handling — this is an MVP, the user has not requested accessibility-aware motion.
