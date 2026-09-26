# Tasks: 004 Prepare release — borrador auditoría 2026-09-26

> Estado: BORRADOR. Conservado como referencia histórica.
> Realidad ejecutada como commits cross-cutting + archive tooling.

## Notas de auditoría

- El change `004-prepare-release` nunca se abrió como OpenSpec vivo;
  su contenido se ejecutó en commits `b9f158d`, `0984460`,
  `4d1315c`, `79dab8e`, `1d0a59b` y archivados
  `docs-add-readme`, `chore-add-android-native-project`,
  `gga-ci`, `setup-code-review-with-gga`.
- `docs/checklist_release.md` quedó como esqueleto; el APK preview
  real está documentado en `README.md` línea 171.

## 1. Configuración y validación previa

- [ ] 1.1 Reconciliar evidencia 001–003 en un único reporte.
      → la trazabilidad está dispersa entre `openspec/changes/*/specs/`
      y los commits; no hay reporte consolidado.
- [ ] 1.2 Validación automatizada de `app.json`/`eas.json` con campos obligatorios.
      → no implementada; se confía a review manual.
- [x] 1.3 `app.json` y `eas.json` con datos aprobados.
- [x] 1.4 Identificadores/secretos fuera del repo.

## 2. Archivo y checklist

- [x] 2.1 Validaciones OpenSpec reales antes de archivar.
- [ ] 2.2 Completar `checklist_release.md` con evidencia/pendientes/bloqueos.
      → esqueleto; tiendas externas sin verificar.
- [ ] 2.3 `openspec validate 004-prepare-release`; archivar solo cambios verificados.
      → change nunca abierto formalmente.
