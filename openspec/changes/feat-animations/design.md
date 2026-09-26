## Context

PR #1 (Clases) and PR #3 (Mis reservas) introduced the visual identity: pastel category cards, pixel pattern, brand header, floating tab bar. The interactions are functionally correct but visually inert. PR #4 closes the loop by adding minimal motion that confirms each interaction.

Constraints:
- No new dependencies (the user has not requested reanimated, and the MVP does not need spring physics).
- Animation duration is short (≤ 220 ms) so motion never blocks the user.
- Single-shot animations (mount, scroll-into-view) rather than looping/attention-grabbing.

## Goals / Non-Goals

**Goals:**

- `Pill` compresses to `scale 0.97` on press (in addition to the existing `opacity 0.85`). Implemented via `Pressable`'s `style({ pressed })` callback — no `Animated` needed.
- `BrandHeader` fades + slides in on first paint: `opacity 0 → 1`, `translateY -8 → 0`, 320 ms `ease-out`.
- Day section headers in `UpcomingClassesScreen` and `MyBookingsScreen` fade in when they enter the viewport (180 ms `ease-out`). Implemented with the `Animated` API inside the section header renderer; threshold via `Animated.View onLayout` ratio (header is "in view" once its top crosses 80 % of the list height).

**Non-Goals:**

- No spring physics.
- No per-card entry animation. Cards mount instantly. The brand surface and the day headings carry all the motion; the cards stay still so the user can scan them.
- No skeleton loaders. The data is hydrated synchronously.
- No reduced-motion handling in this change.

## Decisions

### Pill press: scale + opacity

`Pressable`'s `style({ pressed })` is the right primitive — no animation library needed. Add `transform: [{ scale: pressed ? 0.97 : 1 }]` to the existing `pressed` style. The opacity 0.85 stays (existing). The combined effect is a tactile "press and release" without ever running an animation frame.

Cost: zero. Two extra lines in the Pill style.

### Brand header fade-in: one-shot `Animated.timing`

The header mounts before the screen has time to settle, so a synchronous opacity/translateY on first paint is the cleanest approach:

```
useEffect(() => {
  Animated.parallel([
    Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
    Animated.timing(translateY, { toValue: 0, duration: 320, useNativeDriver: true }),
  ]).start();
}, []);
```

Initial state: `opacity: 0`, `translateY: -8`. End state: `opacity: 1`, `translateY: 0`. Duration 320 ms with `useNativeDriver: true` (animation runs on the UI thread, no bridge hops).

`BrandHeader` is already a `SafeAreaView`. The `Animated.View` wraps the inner container; the `SafeAreaView` itself stays static so the notch inset still resolves correctly.

### Day section header fade-in: `Animated` on mount + layout threshold

`SectionList`'s `renderSectionHeader` is called for every section. Wrap the header `Text` in an `Animated.View` whose `opacity` animates from `0` to `1` once the header is on screen.

Detection: use the section's `onLayout` callback. When the section header is laid out, check whether its `y` position is within `0.8 * listHeight` of the list viewport. If yes, fire `Animated.timing(opacity, { toValue: 1, duration: 180 })`. If the section is already in view on first render, animate immediately on mount.

This stays simple: one `Animated.Value` per header, no scroll listener, no interaction with the SectionList internals.

### What we explicitly do NOT animate

- ClassCard / BookingCard entry. Mounting them with a fade-in would compete with the user's intent (they're scanning a list). The brand header and section heading carry the motion vocabulary; the cards stay still.
- The floating tab bar. Already animated by React Navigation.
- The cancellation sheet. The drag handle and the preview card animate via the `Modal` default; no extra motion needed.

## Files to be created or modified

```
openspec/changes/feat-animations/
├── proposal.md
├── design.md
├── tasks.md
└── specs/class-booking/spec.md

src/shared/ui/components/
└── Pill.tsx                                    (modified — add scale on press)

src/shared/ui/components/
└── BrandHeader.tsx                             (modified — wrap in Animated.View, fade + slide-in)

src/features/class-booking/presentation/components/
├── ClassCard.tsx                              (no change — but referenced for consistency)
└── BookingCard.tsx                            (no change — but referenced for consistency)

src/features/class-booking/presentation/screens/
├── UpcomingClassesScreen.tsx                  (modified — Animated.View section header)
└── MyBookingsScreen.tsx                       (modified — Animated.View section header)
```

No new tests required — the existing 76 tests assert text and accessibility labels, both unaffected by animation.

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## TDD cycle per task

This is a UX change with no new behavior. Existing tests must remain green at every step.

## Risks

- **Animation feels slow** — if the brand header fade-in feels sluggish on a real device, the duration is easy to tune (down to 200 ms) without affecting correctness.
- **Day header animation on SectionList** — SectionList re-renders headers as the user scrolls. We animate `opacity` only on first mount of each section header. If the SectionList unmounts off-screen headers, the animation will fire again on remount; this is acceptable (and rare on a 3-day window).

## Verification

- `pnpm typecheck` clean
- `pnpm lint` 0 warnings
- `pnpm test` 76/76 passing (animation does not affect text / a11y assertions)
- `npx expo export --platform android` bundles cleanly (no new assets)