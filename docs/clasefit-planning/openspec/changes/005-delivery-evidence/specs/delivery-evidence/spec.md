## ADDED Requirements

### Requirement: Evidencia trazable de entrega

La entrega MUST permitir rastrear cada RN desde el insumo hasta escenario, tarea, prueba y resultado real.

#### Scenario: Revisión de una regla de negocio

- **GIVEN** una persona revisora que inspecciona RN-01 a RN-04
- **WHEN** consulta la documentación de entrega
- **THEN** encuentra enlaces a escenarios, pruebas y resultados reales

### Requirement: Registro honesto de IA

La bitácora SHALL registrar herramientas, prompts significativos y errores detectados sin fabricar resultados o decisiones personales.

#### Scenario: Respuesta de reflexión

- **GIVEN** preguntas de reflexión de la prueba
- **WHEN** se entrega `respuestas_reflexion.md`
- **THEN** contiene respuestas propias y no afirma experiencia no demostrada
