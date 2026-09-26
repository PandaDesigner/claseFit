## Context

The Clases screen and the floating tab bar are the only two visible surfaces of the MVP. The current implementation on `develop` uses solid pastel cards, plain text headers, and the default React Navigation tab bar. The user-supplied mockup is the design target.

This change is **presentation + shared UI + navigation**. The `class-booking` domain, application, and infrastructure layers are untouched; the composition root is unchanged.

## Goals / Non-Goals

**Goals:**

- Brand identity surface (`ClaseFit` + sede + tagline + pixel decoration) on every screen.
- Image-led class cards with instructor headshot and sport-icon cutout.
- Three visible card states: `available` (Reservar →), `full` (Llena), `reserved` (Reservada, non-interactive).
- Pixel-pattern decoration on cards, brand header, and cancellation-sheet preview card.
- Floating pill bottom tab bar with safe-area handling.
- SectionList grouped by day (`Hoy`, `Mañana`, formatted date).
- Safe-area respected everywhere (top notch, bottom home indicator, bottom nav bar).
- ClassCard button driven by a discriminated-union state — same Pill component, different config per state.
- Cancellation is reachable only from Mis reservas; the Clases screen does not offer a Cancel action.

**Non-Goals:**

- No change to business rules, ports, adapters, fixtures, or persistence.
- No new feature flags, no design-system package extraction.
- No animation, no transitions, no gesture handling beyond `Pressable`.
- No SVG icon library (icons are View compositions for the tab bar; sport icons are PNG assets).

## Decisions

### Pill component with discriminated-union state and non-interactive fallback

The Pill has variants `primary | disabled | success | outline | reserved | destructive`. Each variant produces a deterministic color combo from `designTokens`. When the consumer does not pass `onPress`, the component renders as `View` (not `Pressable`) so screen readers announce it as `text` and tapping does nothing. This makes the same component reusable for both action buttons (Mantener reserva / Sí cancelar) and state indicators (Llena / Reservada).

### ClassCard: 2-column row flex, button at the bottom of the card

ClassCard.Root is a row flex with `leftColumn` (Header + Body) and `rightColumn` (Image, 175×150). The image is contained within `rightColumn` (no negative offsets, no overlap with text). The compound `ClassCardActions` child is rendered as a sibling of the columns, with `position: absolute, right: lg, bottom: lg` — the button sits at the bottom-right of the entire card, never overlapping the image center. Position is consistent across all three states.

The compound pattern (`Root` + `Header` + `Body` + `Actions`) is preserved because the existing test renders it as a compound and because it keeps the layout split (text vs. action) explicit. `Children.forEach` detects `ClassCardActions` and routes it to the absolute-positioned actions overlay.

### Reserved variant: dark green background, light green text

On the Spinning card (background `#D8F3E5`, light green), a transparent-bg + success-text variant disappears. The reserved variant therefore uses `successText` (`#1F5C2C`) as background and `successSurface` (`#DCEFE0`) as text color — a solid dark-green pill with light-green text, fully legible on every category color.

### Cancellation lives in Mis reservas only

The Clases screen never offers a Cancel action. The Clases ClassCard's reserved pill is a non-interactive state indicator. The Mis reservas BookingCard (separate component) keeps its Cancel flow. This matches the business rule that reservation-lifecycle operations happen on the user's own reservations, not on the public catalog.

### Floating pill tab bar

`RootTabs` replaces the default React Navigation bottom tabs with a custom `FloatingTabBar` (black rounded pill, `barbell` icon for Clases, `clipboard` icon for Mis reservas). The bar floats above content with `position: absolute`. Each tab is `flex: 1` inside the pill. The active tab gets a subtle `rgba(255,255,255,0.10)` highlight. Tab-bar height is exposed as `designTokens.tabBarHeight` (88) so screens can compute their list `paddingBottom` to clear the bar: `max(insets.bottom, spacing.md) + tabBarHeight + spacing.lg`.

### Safe-area handling

`App.tsx` wraps the tree in `SafeAreaProvider`. `BrandHeader` uses `SafeAreaView edges={['top']}` for the notch. `FloatingTabBar` uses `useSafeAreaInsets` for the bottom. Screen list `contentContainerStyle.paddingBottom` is computed dynamically. Tests wrap the screen in `<SafeAreaProvider initialMetrics={{ frame: {0,0,0,0}, insets: {0,0,0,0} }}>` so `useSafeAreaInsets` resolves without throwing.

### Pixel-pattern decoration

`PixelPattern` is a `View` with 4 absolutely-positioned small squares at low opacity, applied as the first child of the brand header (corner cluster), the class card (top-right cluster), and the cancellation-sheet preview card. No SVG library added — all composed from `View` with `position: absolute`.

### Asset path correction (Metro vs Jest)

Asset `require()` calls were originally `../../../../assets/...` (4 dots) which is **invalid** — that resolves above the project root and Metro fails to bundle. Jest masked the bug because `moduleNameMapper` matched by file extension before resolving the path. The fix uses `../../../assets/...` (3 dots) from `src/shared/ui/categoryAssets.ts`. A `__mocks__/fileMock.js` (returning `'test-file-stub'`) is added to `jest.moduleNameMapper` so tests don't need real image files. Metro bundles verified via `npx expo export --platform android`.

### TypeScript module declaration not needed

A `declare module '*.png'` declaration was attempted first, then removed — the wildcard `import default` pattern does not trigger TypeScript to look up the ambient declaration, but `require()` with explicit `ImageSourcePropType` annotation works without declarations. The simpler path won.

## Files to be created or modified

```
openspec/changes/ui-redesign-clases-screen/
├── proposal.md
├── design.md
├── tasks.md
└── specs/class-booking/spec.md

src/shared/ui/
├── tokens.ts                          (modified — pixel, fonts, radii, palette, tabBarHeight)
├── categoryColor.ts                   (deleted — merged into categoryAssets)
├── categoryAssets.ts                  (new — categoryColor, categoryAsset, instructorGender, instructorAvatar)
└── components/
    ├── BrandHeader.tsx                (new)
    ├── InstructorAvatar.tsx           (new)
    ├── PixelPattern.tsx               (new)
    └── Pill.tsx                       (new)

src/navigation/
├── RootTabs.tsx                       (modified — custom FloatingTabBar)
└── components/
    ├── FloatingTabBar.tsx             (new)
    └── TabBarIcons.tsx                (new — BarbellIcon, ClipboardIcon)

src/features/class-booking/presentation/
├── copy/messages.ts                   (modified — brand, greeting, day, instructor labels)
├── components/
│   ├── ClassCard.tsx                  (rewritten — 2-col, state-driven, image-led)
│   └── CancellationSheet.tsx          (rewritten — drag handle, preview card, Pill buttons)
├── screens/
│   ├── UpcomingClassesScreen.tsx      (rewritten — day-grouped SectionList)
│   └── MyBookingsScreen.tsx           (modified — section heading, safe-area, preview)

App.tsx                                (modified — SafeAreaProvider wrapper)
index.ts                               (unchanged)

__mocks__/
└── fileMock.js                        (new — jest asset stub)

assets/
├── bici.png, dance.png, yoga.png, example.png  (new — sport icons, from planning folder)
└── avatar/
    ├── 24dceb8b-8f0d-40ce-a579-b3bd05b13d8a.jpeg  (Andrés Restrepo — Spinning)
    ├── 4f644e0e-da23-4f58-8c22-06a2a5ad65e6.jpeg  (Valentina Ríos — Yoga)
    ├── c90435a0-013a-41e6-bafc-6120ea7cd2a8.jpeg  (Julián Mejía — Rumba)
    └── e9ae0ba8-9040-4a7f-b0c1-395cc5785d01.jpeg  (Camila Ospina — Funcional)

__tests__/
├── presentation/ClassCard.test.tsx               (modified — reserved no cancel)
└── presentation/screens/
    ├── UpcomingClassesScreen.test.tsx           (modified — SafeAreaProvider)
    └── MyBookingsScreen.test.tsx                (modified — SafeAreaProvider)

package.json                            (modified — asset moduleNameMapper)
tsconfig.json                           (modified — ignoreDeprecations 6.0)
app.json                                (modified — adds `android.package` field)
```

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## TDD cycle per task

This is a presentational change with no new business behavior. Existing tests are updated to remain green (no new business scenarios). The 75 existing tests must remain green at every step.

## Risks

- **Asset path** — 4-dot path bug masked by jest moduleNameMapper. Fixed and verified by Metro bundle.
- **Reserved state on green card** — handled by swapping success/surface colors in the Pill variant.
- **Safe-area on iOS notch + Android nav bar** — handled with `useSafeAreaInsets` and dynamic padding in list `contentContainerStyle`.
- **Compound children split** — `Children.forEach` + `child.type === ClassCardActions` is explicit in tests.
- **Pill non-interactive mode** — Pressable → View when no `onPress`. Verified that screen reader announces as `text` and tapping does nothing.

## Verification

- `pnpm typecheck` clean
- `pnpm lint` 0 warnings
- `pnpm test` 75/75 passing
- `npx expo export --platform android` bundles, all 8 image assets resolved