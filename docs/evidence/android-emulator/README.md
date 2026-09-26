# Evidence: Android Emulator (2026-09-26)

Visual smoke-test reproducible desde un emulador Android. Captura el
flujo end-to-end de la app tras aplicar el pase de cierre.

## Cómo reproducir

1. `npx expo run:android` (o `eas build --profile preview --platform android`).
2. Esperar a que cargue `data/baseDateBogota` como "hoy" de la muestra.
3. Recorrer el flujo descrito abajo; cada paso tiene su captura.

> Las capturas de este directorio son **evidencia visual**, no
> reemplazan smoke-test en dispositivo físico Android ni en iOS real.

## Capturas

| Paso | Captura                                                 | Archivo (en este directorio)             |
| ---- | ------------------------------------------------------- | ---------------------------------------- |
| 1    | Clases — antes de reservar                              | `01-upcoming-classes-before-booking.png` |
| 2    | Gate de confirmación de reserva                         | `02-booking-confirmation-gate.png`       |
| 3    | Feedback visual posterior (overlay éxito)               | `03-booking-success-feedback.png`        |
| 4    | Mis reservas — sesión reservada, botón Cancelar visible | `04-my-bookings-list.png`                |

Las capturas originales del pase están en `assets/evidence/`
(`clases.png`, `modal-reser-confirmation.png`, `modal-reservar.png`,
`mis-reservas.png`). Los nombres de este directorio son los canónicos
para `closure-report.md` y `checklist_release.md`; cualquier duplicado
ahí es local al pase de evidencias (no se borra para no perder la
traza original).

## Asociar nuevas capturas

- Reemplazar los PNG arrastrándolos con el mismo nombre de archivo.
- Actualizar cualquier referencia a estas imágenes en
  `docs/closure-report.md` y `docs/checklist_release.md` si cambia
  el flujo o el nombre de la clase de prueba.
