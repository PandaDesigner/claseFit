# Design: Definir comportamiento y arquitectura de reservas

## Enfoque técnico

`class-booking` usa entidades y políticas puras; los casos de uso dependen de puertos. Zustand y AsyncStorage permanecen fuera del dominio.

## Decisiones

| Decisión      | Elección                    | Alternativa             | Motivo                                |
| ------------- | --------------------------- | ----------------------- | ------------------------------------- |
| Reglas        | objetos Strategy compuestos | validaciones en UI      | independientes y testeables           |
| Ciclo reserva | State Active→Cancelled      | flags mutables          | transición terminal explícita         |
| Tiempo        | Clock inyectado/Bogotá      | Date global             | pruebas deterministas                 |
| Persistencia  | DTO versionados             | instancias serializadas | preserva comportamiento y migraciones |

## Flujo

`BookClass/CancelBooking → políticas/entidad → snapshot candidato → puerto`.

## Contratos

`BookingRepository`, `BookingStateStore` y `Clock` se definen en application. La implementación concreta se entrega en cambio 003.

## Pruebas

Cada escenario de la spec genera primero una prueba roja en domain/application. Sin migración en esta fase.
