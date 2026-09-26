# ClaseFit — paquete de planificación (borrador para revisión)

Estado: **BORRADOR** conservado como referencia histórica. No se ejecutó dentro
de este repositorio. Para conocer la entrega real consultar `openspec view`,
`openspec/specs/`, `docs/clasefit-planning/rfc…` (antecedentes) y el árbol
de cambios archivados en `openspec/changes/archive/`.

> Mapeo draft ↔ entrega real (actualizado tras auditoría 2026-09-26):
>
> | RFC draft                           | Cambio OpenSpec real                                                                                                                                                                                                                   | Estado   |
> | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
> | 001-foundation                      | `archive/2026-09-25-initialize-project/` + specs `project-foundation`                                                                                                                                                                  | archived |
> | 002-specification-and-architecture  | subsumido en `archive/2026-09-26-class-booking/` (spec `class-booking`)                                                                                                                                                                | archived |
> | 003-implementation-and-verification | descompuesto en `ui-redesign-clases-screen`, `redesign-booking-card`, `feat-animations`, `feat-modal-polish`, `fix-my-bookings-feedback-above-tab-bar`, `fix-upcoming-classes-booking-success-modal`, `feat-booking-confirmation-gate` | archived |
> | 004-archive-and-release             | commits cross-cutting (EAS, dev-client, Android) + `archive/2026-09-26-{docs-add-readme,chore-add-android-native-project,gga-ci,setup-code-review-with-gga}`                                                                           | archived |
> | 005-evidence-and-handoff            | evidencia consolidada en `README.md`, `docs/checklist_release.md`, `docs/bitacora_ia.md`. `respuestas_reflexion.md` **no fue creado por diseño** (draft prohíbe generarlo por IA).                                                     | parcial  |

## Orden de lectura histórica

1. `tasks/prd-clasefit.md` — alcance, requisitos y criterios de aceptación.
2. `rfcs/001-foundation.md` — fase 1, configuración y estructura.
3. `rfcs/002-specification-and-architecture.md` — fase 2, OpenSpec y decisiones.
4. `DESIGN.md` — contrato visual propuesto para Impeccable.
5. `rfcs/003-implementation-and-verification.md` — fase 3, implementación y pruebas.
6. `rfcs/004-archive-and-release.md` — fase 4, archivo y release.
7. `rfcs/005-evidence-and-handoff.md` — fase 5, bitácora de IA y reflexión.

## Diferencias estructurales draft ↔ entrega real

- `src/app/` no existe en la entrega real — el entry vive en raíz
  (`App.tsx` + `index.ts`) siguiendo convención Expo.
- `infrastructure/mappers/` no existe como carpeta propia — los mappers
  viven inline dentro de `BookClass.ts` e `InitializeBookings.ts`.
- El feedback post-reserva es `SuccessCheckmark` (`Animated.View`),
  no `<Modal>` ni notificación nativa (commits `2d2c0ae`,
  `02d5022`, `79dab8e`, `1d0a59b`).
- Los cambios `004-prepare-release` y `005-delivery-evidence`
  nunca se abrieron como changes vivos formales en el OpenSpec
  operativo; su contenido se ejecutó como commits de tooling.

## Estado de los checklists 001–005

Los checklist originales están actualizados según la auditoría de
evidencia y mantienen los `[ ]` restantes con anotaciones. Nadie debe
interpretar este borrador como un deliverable verificado del repositorio
real — usar `openspec view` y `openspec/specs/` como fuente de verdad.
