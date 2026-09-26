# Tasks: Definir comportamiento y arquitectura de reservas

## 1. Especificación
- [ ] 1.1 Revisar PRD e insumo y validar escenarios RN-01…RN-04 contra el negocio.
- [ ] 1.2 Resolver explícitamente la frontera de exactamente dos horas y actualizar spec/PRD si se aprueba.

## 2. Diseño
- [ ] 2.1 Definir DTO, puertos `BookingRepository`, `BookingStateStore` y `Clock` en el diseño.
- [ ] 2.2 Definir entidades Reservation/ClassSession y políticas Strategy sin imports de framework.

## 3. TDD de contrato
- [ ] 3.1 **RED** Escribir pruebas de dominio para RN-01, RN-02, RN-03 y cancelación dentro/fuera/en la frontera.
- [ ] 3.2 **GREEN** Implementar únicamente las entidades, políticas y puertos mínimos para pasarlas.
- [ ] 3.3 **REFACTOR** Eliminar duplicación y comprobar que domain/application no dependen de infraestructura.

## 4. Verificación
- [ ] 4.1 Ejecutar pruebas de dominio y `openspec validate 002-define-class-booking`; guardar resultados reales.
