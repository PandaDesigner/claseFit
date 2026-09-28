## Why

The current Clases screen and bottom tab bar are functional but generic: solid pastel cards, basic typography, no brand surface, default React Navigation tab bar. The user-supplied design mockup (`docs/design/DESIGN.md` and the planning reference at `clasefit-planning-es`) is the visual target:

- Brand identity on every screen (logo + sede + tagline + decoration).
- Image-led class cards with instructor headshot and sport-icon cutout.
- Three clearly distinguishable card states: `Reservar →`, `Llena`, `Reservada`.
- Floating pill bottom tab bar.
- Day-grouped session list (`Hoy` / `Mañana` / formatted date).
- Safe-area respected everywhere (top notch + bottom home indicator + tab bar).

This change delivers the redesign. It is **presentation + shared UI + navigation only.** No change to the `class-booking` domain, application, or infrastructure layers; the composition root is unchanged.

## What Changes

### New Capabilities

- `class-booking-ui`: redesigned Clases screen, redesigned cancellation sheet, floating pill tab bar, brand header, instructor avatar, sport-icon cutouts, pixel-pattern decoration, day-grouped SectionList, safe-area handling, state-driven ClassCard button.

### Modified Capabilities

- None. The `class-booking` capability spec is extended (see `specs/class-booking/spec.md`) but its domain contracts are untouched.

## Impact

- **Presentation**: rewritten `ClassCard`, `UpcomingClassesScreen`, `MyBookingsScreen`, `CancellationSheet`. New compound structure for the ClassCard that splits the absolute-positioned button from the in-flow text/image columns.
- **Shared UI**: new tokens (`pixelAccent`, `instructorPalette`, `radius.pill`, `fontSize.*`, `spacing.xxxl`, `tabBarHeight`), new components (`BrandHeader`, `InstructorAvatar`, `PixelPattern`, `Pill`), and the consolidation of `categoryColor` into `categoryAssets`.
- **Navigation**: `RootTabs` replaces the default React Navigation tab bar with a custom `FloatingTabBar`.
- **App bootstrap**: `App.tsx` wraps the tree in `SafeAreaProvider`.
- **Assets**: 4 new sport icon PNGs in `/assets/` and 4 instructor headshot JPEGs in `/assets/avatar/` (reused from the planning folder).
- **Tests**: 19/19 suites pass (75/75 tests). Test setup adds `SafeAreaProvider` around screen tests and a `__mocks__/fileMock.js` for image imports.
- **Tooling**: `tsconfig.json` bumps `ignoreDeprecations` from `5.0` to `6.0` for TypeScript 6; `package.json` adds an asset `moduleNameMapper` for jest.
- **Behavior**: in the Clases screen, the `reserved` card state is non-interactive (no Cancel action); cancellation is reachable only from Mis reservas.

## Non-goals

- No new bounded context.
- No change to `domain/`, `application/`, or `infrastructure/` layers.
- No networking, auth, push notifications, payments, or multi-member coordination.
- No animation, transitions, micro-interactions, or gesture handling beyond `Pressable`.
- No SVG icon library added (tab bar icons are View compositions; sport icons are PNG assets).
- No Live native device verification beyond Metro bundle (`npx expo export --platform android`).
- No extraction of a separate design-system package (changes stay inside `shared/ui/`).
