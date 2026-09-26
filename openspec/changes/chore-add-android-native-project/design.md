## Context

ClaseFit targets Android (per `app.json`: `android.package = "com.pandadesigner.clasefit"`, `android.adaptiveIcon: { foregroundImage, backgroundImage, monochromeImage }`). The native build is wired but the native project itself is not in source control.

`npx expo export --platform android` only produces the JS bundle for distribution; it does NOT generate the native project. To build a real APK / AAB you need the `android/` directory, which is what `expo prebuild` creates from `app.json`.

Today every contributor regenerates it locally on demand. CI (`.github/workflows/gga.yml`) only runs `gga run`, not native builds, so the gap is invisible there. The cost shows up the moment someone:
- Tries to run `expo run:android` on a fresh clone (it works, but it spins up `expo prebuild` first).
- Wants to add a native module (e.g., `expo-notifications`, `expo-haptics`).
- Needs to tweak the gradle config (e.g., a custom ProGuard rule, a Hermes flag).
- Wants to audit a release-build diff (the gradle / manifest changes are the diff you'd review).

## Goals / Non-Goals

**Goals:**

- One change: commit the `android/` directory produced by `expo prebuild --platform android --clean` on the current Expo SDK 57 + React Native 0.86 + TypeScript 6 baseline.
- Add `*.keystore` to `.gitignore` so debug signing keys never leave the developer's machine.
- Keep build outputs ignored (`android/build`, `android/app/build`, `android/.gradle`, `android/local.properties`) — already in `.gitignore` per the Expo template.

**Non-Goals:**

- No native source modifications. The committed `android/` is exactly what prebuild produces.
- No iOS native directory yet (separate change when iOS becomes a target).
- No production keystore setup. Production signing is handled via EAS / Gradle secrets (out of scope here).
- No CI that builds the APK. CI today only runs GGA code review.

## Decisions

### Commit the prebuild output verbatim

We commit whatever `expo prebuild --platform android --clean` produces on the current toolchain. No hand-edits to `build.gradle`, no Gradle plugin upgrades, no manifest tweaks. If a future change needs to add a native module, it will regenerate via `expo prebuild --clean` and re-commit the diff.

### `*.keystore` in `.gitignore`

Android Studio's debug keystore is generated locally and signed into the build. It is fine for development (it is well-known and not used for production), but should never be in source control — the standard React Native / Expo template already excludes it under the signing block. Adding the explicit `*.keystore` line makes the intent obvious.

### Don't bump the Expo SDK / RN version

The prebuild runs against the current `package.json` (Expo SDK 57, RN 0.86). If the team wants to upgrade later, that is a separate change with its own OpenSpec artifacts.

## Files to be created or modified

```
openspec/changes/chore-add-android-native-project/
├── proposal.md
├── design.md
└── tasks.md

.gitignore                                  (modified — adds *.keystore)

android/
├── .gitignore                               (new — Expo template, excludes build outputs)
├── build.gradle                             (new — Expo template)
├── settings.gradle                          (new — Expo template)
├── gradle.properties                        (new — Expo template)
├── gradlew                                  (new — Expo template)
├── gradlew.bat                              (new — Expo template)
├── gradle/                                  (new — wrapper jar + properties)
└── app/
    ├── build.gradle                         (new — Expo template)
    ├── proguard-rules.pro                   (new — Expo template)
    ├── debug.keystore                       (NOT committed — see .gitignore)
    └── src/
        ├── debug/AndroidManifest.xml        (new)
        ├── debugOptimized/AndroidManifest.xml
        └── main/
            ├── AndroidManifest.xml          (new — package, MainActivity, MainApplication)
            ├── java/com/pandadesigner/clasefit/
            │   ├── MainActivity.kt          (new)
            │   └── MainApplication.kt       (new)
            └── res/                         (new — splashscreen, mipmaps, drawables)
```

No production code change. No test changes. No domain / application / infrastructure touches.

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## TDD cycle per task

This is a tooling change, not behavior. No RED test required. Verification gates:
- `pnpm typecheck`, `pnpm lint`, `pnpm test` still 76/76 (no code touched).
- `npx expo export --platform android` still bundles cleanly.

## Risks

- **Large commit** — the `android/` directory is hundreds of files (gradle wrapper jar alone is ~60 KB). The first commit on this PR will be big. Mitigated by isolating it to its own branch + PR so the diff is reviewable on its own.
- **Future drift** — every `expo prebuild` could regenerate the directory differently (e.g., when the Expo SDK is upgraded). The contract is: a prebuild-regenerated `android/` is a separate change with its own OpenSpec artifacts, not an inline edit.
- **Native modules added later** — adding `expo-notifications` etc. triggers a new prebuild. Same contract: regenerate, commit as a focused change.

## Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm test` 76/76
- `npx expo export --platform android` bundles cleanly
- `git status` shows no unintended diff in `android/` after a fresh `expo prebuild --clean` (sanity check; documented in PR body)

## Follow-up (not in this PR)

- iOS native directory (`ios/` via `expo prebuild --platform ios`).
- EAS Build configuration (`.eas/build.json`) for cloud native builds.
- ProGuard / R8 tuning for release builds.
- Migration to Expo Modules API v2 (when the project upgrades past SDK 50).