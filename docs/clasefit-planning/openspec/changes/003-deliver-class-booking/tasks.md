# Tasks: 003 Entregar class-booking — borrador auditoría 2026-09-26

> Estado: BORRADOR. Conservado como referencia histórica.
> Realidad ejecutada como PR #1–#9 (cambios archivados:
> `ui-redesign-clases-screen`, `redesign-booking-card`,
> `feat-animations`, `feat-modal-polish`,
> `fix-my-bookings-feedback-above-tab-bar`,
> `fix-upcoming-classes-booking-success-modal`,
> `feat-booking-confirmation-gate`).

## Notas de auditoría

- `infrastructure/mappers/` no existe; mappers viven inline en
  `BookClass.ts` e `InitializeBookings.ts`.
- No hay gating explícito de
  `AccessibilityInfo.isReduceMotionEnabled`.
- `apply-progress.md` (clase-booking original) está obsoleto
  (declaraba 75 tests vs 96 reales); la realidad está en
  `README.md` y `openspec/changes/*/tasks.md`.
- Feedback post-reserva: `SuccessCheckmark` (Animated.View),
  no `<Modal>` ni notificación nativa.

## 1. Adaptadores

- [x] 1.1 RED `BookingStateStore` con adapter en memoria.
- [x] 1.2 GREEN `ZustandBookingStateAdapter`.
- [x] 1.3 RED `BookingRepository` in-memory.
- [ ] 1.4 GREEN `AsyncStorageBookingRepository` + mappers DTO en archivos separados.
      → mappers inline en `BookClass.ts` / `InitializeBookings.ts`.
- [x] 1.5 REFACTOR cablear adapters solo en `composition.ts`.

## 2. Casos de uso e integración

- [x] 2.1 RED hidratación sin escritura vacía + book/cancel serializados.
- [x] 2.2 GREEN `InitializeBookings`, `BookClass`, `CancelBooking`.
- [x] 2.3 REFACTOR snapshots inmutables + liberar cola en error.

## 3. Presentación

- [x] 3.1 RED Próximas clases: orden, llena, reserva, mensajes exactos.
- [x] 3.2 GREEN pantallas, tabs, tarjetas, hooks, tokens.
- [x] 3.3 RED Mis reservas: vacío, sheet, cancelación bloqueada.
- [x] 3.4 GREEN estados pending/error/success accesibles.
- [ ] 3.5 REFACTOR safe areas, foco, **gating reduced-motion**.
      → sin `AccessibilityInfo.isReduceMotionEnabled` explícito.

## 4. Verificación

- [ ] 4.1 Jest/typecheck/lint/native + enlazar evidencia a escenarios.
      → `apply-progress.md` desactualizado; realidad en `README.md`.
- [x] 4.2 `openspec validate 003-deliver-class-booking` antes del commit.
      → `archive/2026-09-26-class-booking/` consolidado.
