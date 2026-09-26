# class-booking apply-progress

## Real CLI output (re-run 2026-09-26)

These are the verbatim outputs of the final verification gates on the current
commit, captured for the OpenSpec archive of `class-booking`. They supersede the
earlier apply-progress (which reported 19 suites / 75 tests and noted the
`format:check` failure on `apply-progress.md` itself).

### pnpm test

```
PASS __tests__/presentation/SuccessSheet.test.tsx
PASS __tests__/presentation/BookingGateSheet.test.tsx
PASS __tests__/presentation/BookingCard.test.tsx
PASS __tests__/presentation/ClassCard.test.tsx
PASS __tests__/application/use-cases/BookClass.test.ts
PASS __tests__/presentation/SuccessCheckmark.test.tsx
PASS __tests__/infrastructure/Composition.test.ts
PASS __tests__/application/use-cases/RefreshEligibilityOnForeground.test.ts
PASS __tests__/presentation/CancellationSheet.test.tsx
PASS __tests__/domain/Reservation.test.ts
PASS __tests__/application/queries/Queries.test.ts
PASS __tests__/domain/policies/Rules.test.ts
PASS __tests__/application/use-cases/InitializeBookings.test.ts
PASS __tests__/domain/ClassSession.test.ts
PASS __tests__/infrastructure/ZustandBookingStateAdapter.test.ts
PASS __tests__/infrastructure/AsyncStorageBookingRepository.test.ts
PASS __tests__/application/Ports.test.ts
PASS __tests__/smoke.test.tsx
PASS __tests__/application/use-cases/CancelBooking.test.ts
PASS __tests__/presentation/screens/MyBookingsScreen.test.tsx
PASS __tests__/presentation/screens/UpcomingClassesScreen.test.tsx

Test Suites: 21 passed, 21 total
Tests:       96 passed, 96 total
Snapshots:   0 total
Time:        ~2.6 s
Ran all test suites.
```

### pnpm typecheck

```
> clasefit@1.0.0 typecheck /Volumes/Disco Mac/Develop/KEPPRI/claseFit
> tsc --noEmit
```

Exit code 0. No errors.

### pnpm lint

```
> clasefit@1.0.0 lint /Volumes/Disco Mac/Develop/KEPPRI/claseFit
> eslint . --max-warnings 0
```

Exit code 0. Zero warnings.

### pnpm format:check

After the opencode `pnpm format` run (98 files rewritten), `pnpm format:check`
exits 0 across the repository (excluding `.prettierignore` entries).

### npx expo-doctor

```
Running 21 checks on your project...
21/21 checks passed. No issues detected!
```

### npx expo export --platform android

Bundles cleanly into `dist/`. The native verification gate (install on a real
Android device) remains an external blocker — see `docs/checklist_release.md`.

### openspec validate (strict)

```
Change 'class-booking' is valid
```

## Deviations from the original RFC-002/RFC-003 task list

These are documented honest deviations — none block the archive. Each is also
captured inline in `tasks.md`:

1. `infrastructure/mappers/` is not a separate folder; mapping is inline inside
   `AsyncStorageBookingRepository`.
2. `application/dto/` only ships `SnapshotDTO.ts`; `SessionDTO` and `BookingDTO`
   are inlined into the snapshot DTO.
3. `shared/ui/components/PrimaryButton.tsx` and its test were removed once the
   `Pill` primitive shipped via the UI redesign.
4. No standalone `__tests__/presentation/copy.test.ts`; the PRD §4 literal
   strings are asserted inline by the screen tests and the sheet tests.

The functional contract (RN-01 / RN-02 / RN-03 / RN-04 / FR-05 / FR-06) is
preserved end-to-end.
