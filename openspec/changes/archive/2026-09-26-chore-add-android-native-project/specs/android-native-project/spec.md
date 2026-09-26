# android-native-project Specification (delta)

## Purpose

This delta introduces the `android-native-project` capability that captures the Expo-generated Android native directory as a tracked artifact. It does NOT introduce runtime behavior — the `android/` directory was previously regenerated on demand by `expo prebuild`; this change commits it for reproducibility, auditability, and offline builds.

## ADDED Requirements

### Requirement: The Expo-generated Android native project is committed

The repository MUST contain the `android/` directory produced by `expo prebuild --platform android --clean` on the current toolchain (Expo SDK 57, React Native 0.86, TypeScript 6). The directory MUST contain the Gradle wrapper (`gradlew`, `gradlew.bat`, `gradle/wrapper/`), root `build.gradle`, `settings.gradle`, `gradle.properties`, and `app/` module sources (`build.gradle`, `proguard-rules.pro`, `src/main/AndroidManifest.xml`, `src/main/java/.../MainActivity.kt`, `src/main/java/.../MainApplication.kt`, resources).

#### Scenario: A fresh clone builds locally without invoking expo prebuild

- **WHEN** a contributor runs `git clone` and then `pnpm android` (or `./gradlew assembleDebug`)
- **THEN** the build resolves the wrapper and compiles without `expo prebuild` having to regenerate the `android/` tree.

#### Scenario: The committed android directory is byte-identical to prebuild output

- **WHEN** the contributor runs `npx expo prebuild --platform android --clean --no-install` on the current commit
- **THEN** `git status` reports no unintended diff inside `android/` (sanity check that the tracked tree matches what prebuild would produce today).

### Requirement: Debug keystore and build outputs are excluded

The `.gitignore` at the repo root MUST exclude `*.keystore` (in addition to the existing `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision`) so the Android Studio debug signing key never leaves a contributor's machine. The directory MUST also remain absent of any tracked `debug.keystore`. Build outputs (`android/build`, `android/app/build`, `android/.gradle`, `android/local.properties`) MUST stay ignored.

#### Scenario: debug.keystore is not tracked

- **WHEN** a reviewer runs `git ls-files android/`
- **THEN** zero entries match `**/debug.keystore` or `**/*.keystore`.

#### Scenario: Build outputs remain ignored

- **WHEN** a contributor builds locally
- **THEN** running `git status` does NOT list `android/build/`, `android/app/build/`, `android/.gradle/`, or `android/local.properties` as modified.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.
