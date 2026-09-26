# Mapa SDD de ClaseFit

Cada RFC se convirtió en un cambio OpenSpec independiente. Cada cambio contiene `proposal.md`, `design.md`, `tasks.md` y una spec delta. `design.md` **no es una tarea**: por SDD se aprueba antes de `tasks.md`. Las tareas sí incorporan TDD RED → GREEN → REFACTOR.

| RFC | Cambio OpenSpec | Responsabilidad | Dependencia |
|---|---|---|---|
| 001 | `001-initialize-project` | Base de Expo, OpenSpec y pruebas | Ninguna |
| 002 | `002-define-class-booking` | Requisitos y arquitectura del dominio de reservas | 001 |
| 003 | `003-deliver-class-booking` | Adaptadores, interfaz y verificación de la funcionalidad | 002 |
| 004 | `004-prepare-release` | Archivo y preparación de release | 003 |
| 005 | `005-delivery-evidence` | Bitácora, reflexión y entrega | 004 |

## Orden obligatorio
Para cada cambio: `proposal → spec → design → tasks → apply → verify → archive`.

No iniciar el siguiente cambio mientras el anterior tenga escenarios críticos sin evidencia. El cambio 003 reutiliza la especificación establecida en 002: no redefine RN-01 a RN-04, sino que agrega requisitos de entrega/integración.

Este paquete prepara los artefactos. Ejecutar `openspec init` y `openspec validate <change>` dentro del repositorio Expo real antes de declarar una fase completa; no hay salidas de CLI fabricadas aquí.
