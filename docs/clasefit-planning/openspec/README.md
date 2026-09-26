# Mapas SDD — borrador para revisión

Este documento refleja el ordenamiento original 001→005 RFC→cambio OpenSpec.
**En la entrega real** los cambios se ejecutaron de forma fragmentada
(ver `../README.md` para el mapeo draft ↔ real). Conserva el mapa draft
como referencia histórica.

Para el estado vivo consultar `openspec list --changes`/`openspec view`
desde la raíz del repositorio.

| RFC draft | Cambio OpenSpec (borrador)  | Cambio operativo real                                                        |
| --------- | --------------------------- | ---------------------------------------------------------------------------- |
| 001       | `001-initialize-project`    | `archive/2026-09-25-initialize-project/`                                     |
| 002       | `002-define-class-booking`  | subsumido en `archive/2026-09-26-class-booking/`                             |
| 003       | `003-deliver-class-booking` | fragmentado (PR #1–#9)                                                       |
| 004       | `004-prepare-release`       | commits cross-cutting + archive tooling changes                              |
| 005       | `005-delivery-evidence`     | docs vivos (`README.md`, `docs/checklist_release.md`, `docs/bitacora_ia.md`) |
