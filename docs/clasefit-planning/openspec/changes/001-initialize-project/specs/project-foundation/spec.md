## ADDED Requirements

### Requirement: Base reproducible de desarrollo
El proyecto SHALL iniciar la aplicación Expo y ejecutar pruebas, verificación de tipos y lint mediante scripts documentados.

#### Scenario: Comprobación básica de la base
- **GIVEN** una instalación limpia con versiones documentadas
- **WHEN** se ejecutan los comandos definidos del proyecto
- **THEN** la aplicación inicia y la prueba smoke pasa

### Requirement: Límites de arquitectura por funcionalidad
El proyecto MUST preparar la funcionalidad `class-booking` con capas domain, application, infrastructure y presentation.

#### Scenario: Dirección de dependencias
- **WHEN** se revisan imports de la funcionalidad
- **THEN** domain no depende de React, Zustand, AsyncStorage ni APIs nativas
- **AND** application no depende de infrastructure
