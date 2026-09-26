## ADDED Requirements

### Requirement: Estado y persistencia independientes

El sistema MUST publicar cambios confirmados al estado observable solamente después de que la persistencia local los guarde correctamente.

#### Scenario: Error de escritura

- **GIVEN** una reserva candidata válida
- **AND** el repositorio falla al guardarla
- **WHEN** se ejecuta la reserva
- **THEN** el snapshot observable anterior se conserva
- **AND** no se muestra confirmación de éxito

#### Scenario: Restauración válida

- **GIVEN** un DTO versionado válido guardado localmente
- **WHEN** se inicializa la funcionalidad
- **THEN** reconstruye reservas con su fecha concreta y habilita acciones

### Requirement: Flujo visible de reservas

La interfaz SHALL permitir consultar clases próximas, reservar una disponible, ver reservas activas y confirmar una cancelación.

#### Scenario: Reserva confirmada

- **GIVEN** una clase reservable
- **WHEN** Laura la reserva
- **THEN** la disponibilidad baja en uno
- **AND** Mis reservas muestra la reserva
- **AND** se muestra “¡Listo! Tu cupo está reservado”

#### Scenario: Confirmación descartada

- **GIVEN** el panel de cancelación abierto
- **WHEN** Laura lo cierra o mantiene la reserva
- **THEN** no cambian la reserva ni los cupos
