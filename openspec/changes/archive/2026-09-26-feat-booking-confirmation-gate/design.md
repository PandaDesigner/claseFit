## Context

`UpcomingClassesScreen.tsx` currently renders `<BookingSuccessSheet>` immediately after a successful `BookClass` — the booking fires on tap without confirmation, and the resulting modal says "¡Listo!" (title) and "¡Listo! Tu cupo está reservado" (body) so the word "¡Listo!" appears twice in the same modal. Users perceive this as duplication and want a gate that asks "do you want to book this class?" followed by a transient checkmark that confirms the booking actually happened and disappears on its own.

`MyBookingsScreen.tsx` renders `<SuccessSheet.Root>` (platform `<Modal>`) with title `"Reserva cancelada"` after a successful cancellation. React Navigation's `Tab.Navigator` keeps both `UpcomingClassesScreen` and `MyBookingsScreen` mounted simultaneously (no `lazy` / `detachInactiveScreens` configured in `RootTabs.tsx`). Platform `<Modal>`s render in a native window above the navigator, so when the user cancels in `Mis reservas` and then reserves in `Clases`, the cancellation modal from the (still-mounted) inactive screen stacks over the booking modal from the active screen — visible as two modals at once.

`CancellationSheet.tsx` (shared/ui) is the canonical pattern for a gate modal on this app: a platform `<Modal>` primitive, a compound API (`Root` + `Title` + `Description` + `Actions`), an exported `*Content` for tests, an internal Context for callbacks, and an optional `SessionPreview` card. The new booking gate must mirror this shape exactly.

`FadeInOnView.tsx` (shared/ui) is the existing pattern for native-driver `Animated` work in the codebase. The checkmark should reuse the same primitive style (RN `Animated` only — no `react-native-reanimated`, per `feat-animations` Non-goals).

## Goals / Non-Goals

**Goals:**

1. Booking requires an explicit confirmation tap before `BookClass` is invoked.
2. The gate, backdrop, and Android hardware back all dismiss without persisting.
3. After confirm, an animated checkmark with the FR-05 literal appears above the floating tab bar and self-dismisses after 2.5 s.
4. The "duplicated ¡Listo!" copy is gone: the gate prompt is "Reservar esta clase?"; the checkmark shows only the FR-05 literal.
5. The cancellation feedback surface on `MyBookingsScreen` is migrated from a platform `<Modal>` to the same `SuccessCheckmark` overlay, eliminating the cross-tab native-modal stacking.

**Non-Goals:**

- No celebration animation beyond the checkmark (no confetti, haptics, sound).
- No swipe-to-dismiss on the gate (no `react-native-gesture-handler` / `react-native-reanimated`).
- No new buttons inside the checkmark (auto-dismiss only).
- No light/dark mode split.
- No changes to React Navigation's tab behaviour (`lazy` / `detachInactiveScreens` etc.) — the feedback surface migration is the fix, not the navigator config.
- No domain, application, or infrastructure code changes — this is presentation-only.

## Decisions

### Decision 1 — `BookingGateSheet` mirrors `CancellationSheet` exactly

**Rationale.** `CancellationSheet` is already proven in the codebase (PR #1, PR #4 polish) and was the model for PR #5/6's modal migration. Reusing the exact shape — compound API, exported `Content`, internal `Context`, optional preview card, platform `<Modal>` with `transparent` + `animationType="slide"` + `onRequestClose` wired to the safe "cancel" callback — keeps the codebase consistent and the test shape parallel.

**Alternative considered.** A bespoke inline modal in `UpcomingClassesScreen`. Rejected because it would diverge from `CancellationSheet`, and we already paid the price for inconsistency once (PR #8 left the screen half-wired).

**Alternative considered.** Reusing `CancellationSheet` directly with renamed copy. Rejected because the booking gate has different actions (confirm + dismiss-back-to-list) and a different tone (positive, not destructive); sharing the component would force boolean-prop proliferation on `CancellationSheet`, violating the project's "no boolean-prop proliferation, use compound components" rule.

### Decision 2 — `SuccessCheckmark` is a NEW shared/ui primitive, NOT a presentation-only component

**Rationale.** The checkmark is a transient animated overlay with no domain knowledge — it accepts `label`, `visible`, `onDismiss`, `durationMs`. It is the visual equivalent of `Pill` but for post-action feedback, and it has no coupling to class-booking. Both the booking flow (FR-05) and the cancellation flow reuse it.

**Alternative considered.** Embedding the checkmark inside `BookingGateSheet`'s siblings. Rejected because (a) the checkmark should be reusable, (b) the gate and checkmark have mutually exclusive visibility lifecycles (gate visible → user decides → gate closes → checkmark appears), making them awkward to render from one wrapper.

**Alternative considered.** Embedding the checkmark inside the screen (no shared primitive). Rejected — would duplicate the animation + auto-dismiss logic in two screens and re-introduce the inconsistency that this change is trying to remove.

### Decision 3 — `SuccessCheckmark` is an Animated overlay, NOT a platform `<Modal>`

**Rationale.** This is the actual fix for the cross-tab modal stacking. An `Animated.View` is part of the screen's render tree — when React Navigation hides a tab, the screen is still mounted but its `Animated.View` children render into the screen's offscreen region, NOT into the native modal window above the navigator. So even if both `feedback` states are set, only the visible screen's checkmark shows.

**Alternative considered.** Keep `<SuccessSheet>` (platform `<Modal>`) and configure React Navigation with `detachInactiveScreens: true`. Rejected because:

- It is a behavioural change to the navigator that affects everything (not just this feedback), and the project's `RootTabs.tsx` does not opt into it for other reasons.
- It does not solve the case where the user has both modals set on the SAME tab (impossible today, but the new gate flow makes it possible: pending gate + confirmed checkmark on Clases during the brief animation).
- The shared/ui Animated overlay is a stricter, more local fix.

### Decision 4 — `Animated` (RN built-in), no `react-native-reanimated`

**Rationale.** Consistent with `FadeInOnView` and the explicit Non-goals in `feat-animations/proposal.md`. `Animated.spring` + `Animated.timing` with `useNativeDriver: true` is enough for opacity + scale.

**Alternative considered.** `react-native-reanimated` for spring physics. Rejected — out of scope, would inflate the dependency surface.

### Decision 5 — Auto-dismiss uses `setTimeout`, exposed as `durationMs` (default 2500)

**Rationale.** `durationMs` is injectable so the test can use `jest.useFakeTimers()` + a small value (e.g. 100 ms) and assert deterministically. Default 2500 ms matches Apple HIG and Material Design guidance for transient confirmations.

**Alternative considered.** `Animated.loop` with a fixed duration — couples visibility to animation timing. Rejected because we want dismissal to be a clean side-effect, not coupled to the animation's `finished` callback.

### Decision 6 — Two independent state slots per screen

**Rationale.** Each screen replaces `feedback: string | null` (dead) with two states:

- `UpcomingClassesScreen`: `pendingSessionId: string | null` (drives the gate) + `confirmedSessionId: string | null` (drives the checkmark).
- `MyBookingsScreen`: keeps `selectedBookingId: string | null` (drives the cancellation gate, unchanged) and replaces `feedback: string | null` with `cancelledBookingId: string | null` (drives the checkmark).

This mirrors `MyBookingsScreen`'s existing `selectedBookingId` pattern for the booking screen. The two slots per screen are mutually exclusive in time (gate closes before checkmark opens), so the screen never renders both at once.

**Alternative considered.** A single state with a discriminated union (`{ kind: 'gate' } | { kind: 'success' } | { kind: 'idle' }`). Cleaner types but more code; the two-slot approach keeps the diff minimal.

### Decision 7 — Remove `feedback` state from both screens, delete `BookingSuccessSheet.tsx`, delete dead styles

**Rationale.** `feedback` was set from `result.message` but never read. `BookingSuccessSheet` is no longer rendered anywhere. The `feedback` / `feedbackText` styles in `UpcomingClassesScreen.tsx` are already gone (PR #9); the equivalent styles in `MyBookingsScreen.tsx:236-245` (`feedback: { position: 'absolute', bottom: designTokens.spacing.xl, ... }`) are dead after this change — remove them too.

## Risks / Trade-offs

- **[Risk] The auto-dismiss timer fires after the user has navigated away from `Clases` to `Mis reservas`.** → Mitigation: only set `confirmedSessionId` after `commands.book` resolves and the screen is still mounted. If the screen unmounts, the timer reference is GC'd with the state. No global timers.
- **[Risk] User double-taps "Sí, reservar" and creates two bookings.** → Mitigation: the existing `BookClass` queue (`CommandQueue` in `BookClass.ts:33-57`) serializes same-session writes, so a duplicate tap is coalesced. The screen also disables `pendingSessionId` updates while `commands.book` is in flight (use a `useMemo` for `confirmBook` keyed off the id; the queue handles the rest).
- **[Risk] User double-taps "Sí, cancelar" and the cancellation succeeds twice.** → Already handled by `CancelBooking`'s `CommandQueue` (`CancelBooking.ts:28-30`). No new mitigation needed.
- **[Risk] Test for `SuccessCheckmark` auto-dismiss is flaky because of real timers.** → Mitigation: `jest.useFakeTimers()` in the test; advance with `jest.advanceTimersByTime(durationMs)`; assert `onDismiss` was called.
- **[Risk] `shared/ui` does NOT import features (AGENTS.md) — `BookingGateSheet` must not import from `features/class-booking`.** → Mitigation: copy/strings live in `shared/ui` as exported constants from `BookingGateSheet.tsx` itself (mirroring `CancellationSheet`'s hardcoded copy). The chosen approach: define the gate copy as a `gateMessages` constant inside `BookingGateSheet.tsx` to keep `shared/ui` self-contained.
- **[Risk] The PR #8 split-commit pattern (component added without wiring) recurs.** → Mitigation: this PR has a single commit per logical batch and verifies the screen render in tests (not just "the literal appears somewhere").
- **[Risk] The cancellation feedback message body changes from `{feedback}` (the CancelBooking result message) to the FR-05 literal — users lose the specific cancellation outcome (e.g., "Cancelada correctamente").** → Mitigation: `SuccessCheckmark` accepts an arbitrary `label` prop. The cancellation screen passes the cancellation message as the label (or the FR-05 literal if success-only). Keep both flows expressive.
- **[Risk] Migration of the cancellation feedback changes UX from "tap Listo to close" to "auto-dismiss in 2.5 s".** → Accepted. The user explicitly asked for the animated checkmark pattern on booking, and the same UX consistency applies to cancellation. Auto-dismiss is the intended post-action feedback pattern.

## Files to create / modify

### Create

| File                                                                                      | Purpose                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/ui/components/BookingGateSheet.tsx`                                           | Platform `<Modal>` primitive, compound API (`Root` + `Title` + `Description` + `Actions`), exported `BookingGateSheetContent`, internal `Context`, optional `SessionPreview`-style card. Two pills: "Elegir otra" (primary, onCancel) + "Sí, reservar" (success, onConfirm). Hardcoded copy inside. |
| `src/shared/ui/components/SuccessCheckmark.tsx`                                           | Animated overlay with `visible`, `onDismiss`, `label`, `durationMs` (default 2500). Uses RN `Animated` (spring on mount, fade-out on dismiss). `position: absolute` + `top` so it floats above the screen content but BELOW any open `<Modal>` (the gate, when present, hides it).                  |
| `__tests__/presentation/BookingGateSheet.test.tsx`                                        | Mirror `CancellationSheet.test.tsx`: render prompt + description, "Elegir otra" calls `onCancel`, "Sí, reservar" calls `onConfirm`, backdrop calls `onCancel`, preview card renders.                                                                                                                |
| `__tests__/presentation/SuccessCheckmark.test.tsx`                                        | (a) renders label when visible; (b) auto-calls `onDismiss` after `durationMs` via fake timers; (c) does NOT render when not visible; (d) checkmark animation runs (assert `Animated.View` exists with non-zero opacity/scale).                                                                      |
| `openspec/changes/feat-booking-confirmation-gate/specs/booking-confirmation-gate/spec.md` | New capability spec.                                                                                                                                                                                                                                                                                |
| `openspec/changes/feat-booking-confirmation-gate/specs/booking-success-checkmark/spec.md` | New capability spec.                                                                                                                                                                                                                                                                                |
| `openspec/changes/feat-booking-confirmation-gate/specs/class-booking/spec.md`             | Modified capability delta spec.                                                                                                                                                                                                                                                                     |

### Modify

| File                                                                        | Change                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/features/class-booking/presentation/screens/UpcomingClassesScreen.tsx` | Replace `feedback` state with `pendingSessionId` + `confirmedSessionId`. Replace `<BookingSuccessSheet>` render with `<BookingGateSheet>` (gate) + `<SuccessCheckmark>` (success). Build `SessionPreview`-shaped object from the selected `UpcomingSessionView`. Map `result.message` from `commands.book` to set `confirmedSessionId` on success.                                                                                               |
| `src/features/class-booking/presentation/screens/MyBookingsScreen.tsx`      | Replace `<SuccessSheet.Root>` cancellation feedback with `<SuccessCheckmark>`. Drop the `feedback: string \| null` state; replace with `cancelledBookingId: string \| null` driven by `commands.cancel` result. Remove unused `feedback` style (lines 236-245). Keep the cancellation gate (`CancellationSheet`) unchanged.                                                                                                                      |
| `src/features/class-booking/presentation/copy/messages.ts`                  | Add `bookGatePrompt`, `bookGateDescription`, `bookGateConfirm`, `bookGateCancel`. Reuse existing `success` for the FR-05 literal.                                                                                                                                                                                                                                                                                                                |
| `__tests__/presentation/screens/UpcomingClassesScreen.test.tsx`             | Replace the too-weak `findByText('¡Listo! Tu cupo está reservado')` with: (1) after pressing "Reservar", assert the gate prompt renders; (2) after pressing "Sí, reservar", assert the checkmark renders + `store.bookings.length === 1`; (3) assert that pressing "Elegir otra" or backdrop dismisses the gate WITHOUT a booking; (4) assert `getAllByText('¡Listo! Tu cupo está reservado').toHaveLength(1)` to catch duplication regressions. |
| `__tests__/presentation/screens/MyBookingsScreen.test.tsx`                  | Tighten assertions: after a successful cancel, assert the cancellation checkmark renders (via mock or label match) and the cancellation gate is gone; assert NO platform `<Modal>` is open from `MyBookingsScreen` (the test can use the same mock-based pattern as the strengthened `UpcomingClassesScreen` test).                                                                                                                              |

### Delete (cleanup)

- `src/features/class-booking/presentation/components/BookingSuccessSheet.tsx` — replaced by `SuccessCheckmark`. Verify with `grep -rn "BookingSuccessSheet" src/` before deletion; if anything else imports it, leave it and add a JSDoc `@deprecated` instead.

## TDD cycle per task

1. **RED** `__tests__/presentation/BookingGateSheet.test.tsx` — render test fails because component doesn't exist.
2. **GREEN** Create `BookingGateSheet.tsx` with minimal compound API that passes the tests.
3. **REFACTOR** Add `SessionPreview`-style optional card; copy hardcoded.
4. **RED** `__tests__/presentation/SuccessCheckmark.test.tsx` — auto-dismiss + visibility tests fail.
5. **GREEN** Create `SuccessCheckmark.tsx` with `Animated` + `setTimeout`.
6. **REFACTOR** Polish spring physics, accessibility labels.
7. **RED** Strengthen `UpcomingClassesScreen.test.tsx` — gate + confirm + dismiss tests fail against the current screen (which still renders the old `<BookingSuccessSheet>`).
8. **GREEN** Replace state + render in `UpcomingClassesScreen.tsx`.
9. **RED** Strengthen `MyBookingsScreen.test.tsx` — cancellation feedback uses `SuccessSheet` (current), test should fail demanding `SuccessCheckmark`.
10. **GREEN** Replace state + render in `MyBookingsScreen.tsx`.
11. **REFACTOR** Cleanup dead `feedback` state and styles in both screens. Delete `BookingSuccessSheet.tsx` if unused.

## Open Questions

- None. All decisions above are reversible and follow existing patterns. If the user wants a different `durationMs` default, the value is a single-line change in `SuccessCheckmark.tsx`.
