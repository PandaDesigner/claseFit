# Tasks: Entregar funcionalidad de reservas ClaseFit

## 1. Adaptadores
- [ ] 1.1 **RED** Crear pruebas contractuales de `BookingStateStore` con adapter en memoria.
- [ ] 1.2 **GREEN** Implementar `ZustandBookingStateAdapter` y pasar las mismas pruebas.
- [ ] 1.3 **RED** Crear pruebas de `BookingRepository` con escritura/lectura/fallo en memoria.
- [ ] 1.4 **GREEN** Implementar `AsyncStorageBookingRepository` y mappers DTO; repetir contrato.
- [ ] 1.5 **REFACTOR** Cablear adapters solo en `composition.ts`.

## 2. Casos de uso e integración
- [ ] 2.1 **RED** Probar hidratación sin escritura vacía y reserva/cancelación serializadas.
- [ ] 2.2 **GREEN** Implementar InitializeBookings, BookClass y CancelBooking.
- [ ] 2.3 **REFACTOR** Mantener snapshots inmutables y liberar la cola ante error.

## 3. Presentación
- [ ] 3.1 **RED** Probar Próximas clases: orden, llena, reserva y mensajes exactos.
- [ ] 3.2 **GREEN** Implementar pantallas, tabs, tarjetas y hooks con tokens de DESIGN.md.
- [ ] 3.3 **RED** Probar Mis reservas, vacío, sheet de confirmación y cancelación bloqueada.
- [ ] 3.4 **GREEN** Implementar estados pendientes/error/éxito y acciones accesibles.
- [ ] 3.5 **REFACTOR** Revisar áreas seguras, texto ampliado, focus y movimiento reducido.

## 4. Verificación
- [ ] 4.1 Ejecutar Jest, typecheck, lint y pruebas nativas; enlazar evidencia a escenarios.
- [ ] 4.2 Ejecutar `openspec validate 003-deliver-class-booking` antes del commit.
