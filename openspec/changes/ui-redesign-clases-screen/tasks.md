# Tasks: ui-redesign-clases-screen

## Review Workload Forecast

| Field                   | Value                                               |
| ----------------------- | --------------------------------------------------- |
| Estimated changed lines | 700–900 (presentation + shared UI + tests + assets) |
| 400-line budget risk    | High (presentation-heavy)                           |
| Chained PRs recommended | No — single PR, well-scoped to presentation         |
| Delivery strategy       | presentational-only                                 |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: High

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                                                      | Commit              |
| ---- | ----------------------------------------------------------------------------------------- | ------------------- |
| 1    | Tooling: jest asset mock + tsconfig deprecation                                           | `chore(setup)`      |
| 2    | Design tokens (pixel palette, fonts, radii, instructor palette, tab bar height)           | `feat(shared-ui)`   |
| 3    | Pill component with variants (primary, disabled, success, outline, reserved, destructive) | `feat(shared-ui)`   |
| 4    | Category → asset mapping (sport icons + instructor avatars)                               | `feat(shared-ui)`   |
| 5    | BrandHeader, InstructorAvatar, PixelPattern                                               | `feat(shared-ui)`   |
| 6    | Floating tab bar (FloatingTabBar, TabBarIcons, RootTabs)                                  | `feat(navigation)`  |
| 7    | ClassCard with 2-col layout, state-driven button, image-led                               | `feat(classes)`     |
| 8    | UpcomingClassesScreen with day grouping + safe-area bottom                                | `feat(classes)`     |
| 9    | CancellationSheet with session preview card                                               | `feat(classes)`     |
| 10   | MyBookingsScreen with section heading + preview wiring                                    | `feat(my-bookings)` |
| 11   | App.tsx SafeAreaProvider                                                                  | `feat(app)`         |
| 12   | Test setup: SafeAreaProvider in screen tests                                              | `test`              |

## Phase 1: Tooling

- [x] 1.1 Add `__mocks__/fileMock.js` returning `'test-file-stub'`.
- [x] 1.2 Update `package.json` jest `moduleNameMapper` to map `png|jpg|jpeg|gif|webp` to the file mock.
- [x] 1.3 Bump `tsconfig.json` `ignoreDeprecations` from `5.0` to `6.0` for TypeScript 6.
- [x] 1.4 Add `android.package` field in `app.json`.

## Phase 2: Design tokens

- [x] 2.1 Add `pixelAccent`, `instructorPalette`, `radius.pill`, `radius.avatar`, `fontSize.eyebrow/label/caption/body/bodyLg/title/display/hero`, `spacing.xxxl`, `tabBarHeight`.

## Phase 3: Pill component

- [x] 3.1 Variants `primary | disabled | success | outline | reserved | destructive` with deterministic colors from `designTokens`.
- [x] 3.2 `disabled` flag forces `disabled` background and disables interaction.
- [x] 3.3 No `onPress` → render `View` (non-interactive) with `accessibilityRole="text"`.
- [x] 3.4 Optional `withArrow` (used by the `Reservar` button on the Clases screen).

## Phase 4: Category → asset mapping

- [x] 4.1 New file `src/shared/ui/categoryAssets.ts` with `categoryColor`, `categoryAsset`, `instructorGender`, `instructorAvatar`.
- [x] 4.2 Sport icons: `bici → Spinning`, `dance → Rumba`, `yoga → Yoga`, `example → Funcional`.
- [x] 4.3 Instructor avatars: Camila Ospina, Valentina Ríos, Julián Mejía, Andrés Restrepo (each mapped to a headshot JPEG).
- [x] 4.4 Asset `require()` paths use `../../../assets/...` (3 dots) — Metro bundle verified.
- [x] 4.5 Delete `src/shared/ui/categoryColor.ts` (consolidated).

## Phase 5: BrandHeader, InstructorAvatar, PixelPattern

- [x] 5.1 `BrandHeader` — `ClaseFit` wordmark (italic Fit) + sede + 3-line tagline + 3-square pixel decoration (top-right). `SafeAreaView edges={['top']}`.
- [x] 5.2 `InstructorAvatar` — renders the real photo from `instructorAvatar(name)`; falls back to colored initials circle (deterministic hash → palette).
- [x] 5.3 `PixelPattern` — 4 absolutely-positioned small squares at low opacity.

## Phase 6: Floating tab bar

- [x] 6.1 `TabBarIcons` — `BarbellIcon` and `ClipboardIcon` composed from `View` (no SVG).
- [x] 6.2 `FloatingTabBar` — black pill, `useSafeAreaInsets` for bottom padding, active tab gets `rgba(255,255,255,0.10)` highlight.
- [x] 6.3 Wire `RootTabs` to use `FloatingTabBar` as the `tabBar`.

## Phase 7: ClassCard

- [x] 7.1 Convert to 2-column row flex (`leftColumn` + `rightColumn`).
- [x] 7.2 Image is contained in `rightColumn` (`width: 175, height: 150`).
- [x] 7.3 Button is rendered as a direct child of the card, `position: absolute, right: lg, bottom: lg` (consistent position for all states).
- [x] 7.4 `deriveActionState` discriminated union (`available | full | reserved`).
- [x] 7.5 `buildPillProps` builds the Pill config per state — `reserved` is non-interactive, label = "Reservada".
- [x] 7.6 `ClassCardActions` returns a single Pill wrapped in an `actionsOverlay`.
- [x] 7.7 `Children.forEach` split routes `ClassCardActions` to the absolute overlay.

## Phase 8: UpcomingClassesScreen

- [x] 8.1 Add `BrandHeader` at the top of the screen.
- [x] 8.2 Add greeting block (`Hola, Laura / Próximas clases / Hasta 2 reservas por día`).
- [x] 8.3 Replace `FlatList` with `SectionList` grouped by `diaOffset` (`Hoy`, `Mañana`, formatted date).
- [x] 8.4 `useSafeAreaInsets` to compute `contentContainerStyle.paddingBottom` so the last card clears the floating tab bar.
- [x] 8.5 Remove `onCancel` prop from `ClassCard.Root` (cancellation lives in Mis reservas).

## Phase 9: CancellationSheet

- [x] 9.1 Drag handle indicator at the top of the sheet.
- [x] 9.2 Optional `sessionPreview` prop (`SessionPreview` type: `name, categoryColor, dateLabel, timeLabel, durationMinutes, instructor`).
- [x] 9.3 Preview card with `PixelPattern` and class info when `sessionPreview` is provided.
- [x] 9.4 Replace `PrimaryButton` with `Pill` — `Mantener reserva` (primary) and `Sí, cancelar` (destructive).
- [x] 9.5 Title style bumped to large/bolder (matches mockup).

## Phase 10: MyBookingsScreen

- [x] 10.1 Section heading ("Mis reservas").
- [x] 10.2 `useSafeAreaInsets` for list bottom padding (clear the floating tab bar).
- [x] 10.3 Compute `sessionPreview` from selected booking (find by id, build categoryColor + dayLabel + formatTime).
- [x] 10.4 Wrap empty state in `<SafeAreaView edges={['top']}>`.
- [x] 10.5 Wrap content in `<SafeAreaView edges={['top']}>`.

## Phase 11: App.tsx

- [x] 11.1 Wrap tree in `<SafeAreaProvider>` (also wrap the loading state).

## Phase 12: Test setup

- [x] 12.1 `UpcomingClassesScreen.test.tsx` — wrap render with `SafeAreaProvider initialMetrics={{ frame: {0,0,0,0}, insets: {0,0,0,0} }}>`.
- [x] 12.2 `MyBookingsScreen.test.tsx` — same.
- [x] 12.3 `ClassCard.test.tsx` — remove `onCancel` from `baseProps`; reserved test expects `Reservada` text and asserts that `Cancelar` is NOT present.

## Verification (must pass before archive)

- [x] `pnpm typecheck` clean
- [x] `pnpm lint` 0 warnings
- [x] `pnpm test` 75/75 passing
- [x] `npx expo export --platform android` bundles all 8 image assets
