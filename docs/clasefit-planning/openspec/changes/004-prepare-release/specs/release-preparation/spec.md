## ADDED Requirements

### Requirement: Preparación honesta de release
El proyecto MUST diferenciar configuración completada de requisitos externos pendientes para Google Play y App Store.

#### Scenario: Bloqueo externo
- **GIVEN** que falta una cuenta, firma o requisito de tienda
- **WHEN** se completa la checklist de release
- **THEN** el bloqueo queda marcado como pendiente
- **AND** no se declara publicada la aplicación

### Requirement: Archivo trazable
El proyecto SHALL archivar solamente cambios con escenarios verificados y tareas reconciliadas.

#### Scenario: Cambio sin evidencia
- **GIVEN** una tarea crítica sin evidencia de verificación
- **WHEN** se intenta archivar el cambio
- **THEN** el archivo se pospone y se informa el faltante
