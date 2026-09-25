# class-booking apply-progress

## Real CLI output

### pnpm test

PASS **tests**/application/use-cases/CancelBooking.test.ts
PASS **tests**/application/use-cases/RefreshEligibilityOnForeground.test.ts
PASS **tests**/domain/Reservation.test.ts
PASS **tests**/domain/ClassSession.test.ts
PASS **tests**/infrastructure/ZustandBookingStateAdapter.test.ts
PASS **tests**/application/queries/Queries.test.ts

Test Suites: 19 passed, 19 total
Tests: 75 passed, 75 total
Snapshots: 0 total
Time: 1.953 s
Ran all test suites.

### pnpm typecheck

> clasefit@1.0.0 typecheck /Volumes/Disco Mac/Develop/KEPPRI/claseFit
> tsc --noEmit

### pnpm lint

> clasefit@1.0.0 lint /Volumes/Disco Mac/Develop/KEPPRI/claseFit
> eslint . --max-warnings 0

### pnpm format:check

[warn] openspec/changes/class-booking/apply-progress.md
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
 ELIFECYCLE  Command failed with exit code 1.

### npx expo-doctor

Running 21 checks on your project...
21/21 checks passed. No issues detected!

### openspec validate (strict)

Change 'class-booking' is valid
