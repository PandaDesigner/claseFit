## ADDED Requirements

### Requirement: Reserva con reglas de negocio

El sistema MUST validar cupos, duplicados y máximo dos reservas activas por fecha de clase en Bogotá antes de confirmar una reserva.

#### Scenario: Clase sin cupos

- **GIVEN** una sesión sin cupos disponibles
- **WHEN** Laura intenta reservarla
- **THEN** la reserva se rechaza con “Esta clase ya no tiene cupos.”

#### Scenario: Reserva duplicada

- **GIVEN** una reserva activa de Laura para la misma sesión concreta
- **WHEN** Laura intenta reservarla nuevamente
- **THEN** la reserva se rechaza con “Ya reservaste esta clase.”

#### Scenario: Límite de dos reservas diarias

- **GIVEN** dos reservas activas de Laura para una fecha Bogotá
- **WHEN** intenta crear una tercera para la misma fecha
- **THEN** se rechaza con “Solo puedes reservar 2 clases por día.”

### Requirement: Cancelación dentro de plazo

El sistema SHALL cancelar una reserva activa solo cuando queden al menos dos horas antes de su inicio.

#### Scenario: Cancelación a tiempo

- **GIVEN** una reserva activa cuya sesión inicia en dos horas o más
- **WHEN** Laura confirma cancelar
- **THEN** la reserva pasa a cancelada y se libera un cupo

#### Scenario: Cancelación tardía

- **GIVEN** una reserva activa cuya sesión inicia en menos de dos horas
- **WHEN** Laura confirma cancelar
- **THEN** se rechaza con “Ya no puedes cancelar: faltan menos de 2 horas.”

### Requirement: Identidad temporal de sesiones

El sistema MUST resolver `diaOffset` y `hora` en una fecha Bogotá concreta antes de persistir una reserva.

#### Scenario: Reinicio posterior a medianoche

- **GIVEN** una reserva confirmada para una sesión concreta
- **WHEN** se reinicia la aplicación después de medianoche
- **THEN** la reserva conserva su fecha original y no se desplaza por `diaOffset`
