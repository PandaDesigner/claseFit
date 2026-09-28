# Checklist de release · ClaseFit

> **Estado (refresh 2026-09-26)**: código fuente shipped y verificado
> (`pnpm test` 21 suites / 96 tests, `pnpm typecheck` 0 errors,
> `pnpm lint` 0 warnings, `npx expo export --platform android` bundle
> OK, `npx expo-doctor` 21/21 checks). Pendiente: verificación nativa
> en dispositivo real y publicación en stores.

## Listo en el proyecto

- [x] Nombre, `slug` y versión en `app.json` (ClaseFit / clasefit / 1.0.0).
- [x] `android.package` (`com.pandadesigner.clasefit`) e `ios.supportsTablet`.
- [x] `eas.json` con perfiles `development`, `preview` y `production`
      (`autoIncrement: true` en production).
- [x] Directorio `android/` commited (commit `57e3a3e chore(setup):
commit the Expo-generated Android native project`).
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `npx expo export
--platform android` todos exit 0 (verificado 2026-09-26).
- [x] `npx expo-doctor` reporta 21/21 checks passed (verificado 2026-09-26).
- [x] APK preview firmado via EAS disponible — referencia viva
      (`README.md` § Try it):
      `https://expo.dev/artifacts/eas/Sh-zQ0JQGsDoemTtfI-kN_FsUDVYPRcMhKQ9SnZUbU0.apk`
      (URL vigente al commitar; re-confirmar antes de cualquier
      publicación externa, los artefactos EAS expiran / rotan).

## Falta para Google Play

- [ ] Cuenta de Google Play Console a nombre del editor (no provista).
- [ ] Identidad legal y datos fiscales del editor.
- [ ] Ficha de Play Store: descripción corta y completa, screenshots
      por categoría de dispositivo, gráfico de características, icono
      high-res.
- [ ] Clasificación de contenido (cuestionario IARC).
- [ ] Declaración de privacidad (URL pública) + Data safety form
      (qué datos recoge, si los comparte, si son cifrados, etc.).
- [ ] Target API level declarado en `app.json` / Gradle (Play Store
      exige API level actualizado cada año).
- [ ] Firma de release (keystore de producción) cargada vía EAS
      secret / Play App Signing.
- [ ] Verificación de instalación real en un dispositivo físico con
      Android 14+ (no automatizada en este pase — bloqueada por falta
      de hardware; `npx expo export --platform android` sólo prueba
      el bundle Metro).
- [ ] Re-confirmar que el enlace del APK preview siga vigente antes
      de pasar a producción.

## Falta para App Store

- [ ] Cuenta Apple Developer Program a nombre del editor (no provista).
- [ ] Directorio `ios/` generado y commited (`expo prebuild --platform ios`
      no se ejecutó en este pase).
- [ ] App Store Connect: bundle id, listing, etiquetas de privacidad,
      clasificación, in-app purchases si aplica.
- [ ] TestFlight interno + externo antes de sumisión.
- [ ] Verificación de instalación en dispositivo iOS físico (idem Android).

## Riesgos o bloqueos para publicar

- **Verificación en dispositivo físico bloqueada por falta de hardware.**
  La evidencia shipped hoy es: bundle Metro exporta OK; `expo-doctor`
  21/21 checks passed; `pnpm test` 21/96 verdes. Esto NO equivale a
  smoke-test en hardware real. Antes de cualquier publicación, ejecutar
  el APK preview firmado en un dispositivo físico y capturar evidencia
  del flujo end-to-end (clase → reservar → cancelar → cancelar a <2h).
- **Sin cuenta de store ni datos de listing.** No se puede generar la
  ficha de Play Store / App Store Connect sin identidad legal del editor
  - screenshots + declaración de privacidad.
- **Reduced-motion no implementado** en `Pill`, `BrandHeader`,
  `FadeInOnView` y `SuccessCheckmark` (registrado como pendiente en
  `docs/clasefit-planning/openspec/changes/003-deliver-class-booking/tasks.md`
  § 3.5). No bloquea la publicación, pero es deuda de accesibilidad.
- **`docs/bitacora_ia.md` SÍ existe** (reescrito en este pase con hechos
  auditados y la cronología de errores/corregidos). `respuestas_reflexion.md`
  sigue sin existir por convención del proyecto (autor-propietario, no
  generado por opencode; ver `docs/clasefit-planning/rfcs/005-evidence-and-handoff.md`).
- **Sin pruebas E2E automatizadas** (no Detox, no Maestro). Los 96 tests
  son unit / integration; el comportamiento end-to-end se valida sólo en
  dispositivo físico.
- **Evidencia visual en emulador Android** capturada y archivada en
  `docs/evidence/android-emulator/` (4 PNG del flujo prereserva → gate →
  feedback → Mis reservas; ver README del directorio). No reemplaza
  smoke-test en hardware físico ni en iOS.

## Evidencia viva

- `pnpm test` → 21 suites, 96 tests, 0 failures (verbatim en
  `openspec/changes/archive/2026-09-26-class-booking/apply-progress.md`).
- `pnpm typecheck` → 0 errors (`tsc --noEmit` exit 0).
- `pnpm lint` → 0 warnings (`eslint . --max-warnings 0` exit 0).
- `pnpm format:check` → 0 archivos pendientes de reformat (tras el
  `pnpm format` del paquete de cierre).
- `npx expo-doctor` → 21/21 checks passed.
- `npx expo export --platform android` → bundle OK.
- `openspec validate --all` → 12/12 items pass (re-ejecutado en este pase
  contra `openspec` v1.3.1). Los 5 deltas que en su momento cerraron el
  pase de cierre con spec faltante ya incluyen su `specs/<capability>/spec.md`
  archivado: ver
  `openspec/changes/archive/2026-09-26-chore-add-android-native-project/specs/android-native-project/spec.md`,
  `…/2026-09-26-docs-add-readme/specs/project-readme/spec.md`,
  `…/2026-09-26-fix-upcoming-classes-booking-success-modal/specs/class-booking/spec.md`,
  `…/2026-09-26-gga-ci/specs/code-review-ci/spec.md`,
  `…/2026-09-26-setup-code-review-with-gga/specs/code-review-tooling/spec.md`.
- `openspec view` → 8 specs, 34 requirements; 0 changes in-progress;
  4 completed (`feat-animations`, `feat-modal-polish`, `redesign-booking-card`,
  `ui-redesign-clases-screen`).
- Evidencia visual emulador Android (recorrido end-to-end de reserva):
  ver [evidence/android-emulator/](evidence/android-emulator/README.md).
  Capturas originales equivalentes también disponibles en
  `assets/evidence/` (`clases.png`, `modal-reser-confirmation.png`,
  `modal-reservar.png`, `mis-reservas.png`).
