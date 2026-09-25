# Bitácora de uso de IA

## Herramientas que usé

- cobowprompts.ai: es la herramienta que use para estructurar los prompts.
- Trae y opencode: es el editor que use para para escribir el código.
- OpenAI: es la IA que use para generar el propose y levantar diseño.
- MiniMax y Kimi 3: es la IA que use para realizar codigo.
- Openspec y engram: es la herramienta que use para validar el código.
- sdd y tdd: son los métodos de desarrollo que use para escribir el código.
- git: es el sistema de control de versiones que use para gestionar el código.

## Prompts clave (3 a 5)

| #   | Fase               | Prompt                                                                                                                                                                                                                  | Qué obtuve                                                                                                                          |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | propose / PRD      | Tomar el insumo funcional de ClaseFit y convertirlo en un PRD ejecutable para el reinicio del proyecto, definiendo alcance, RN-01 a RN-04, criterios de aceptación, fuera de alcance y plan por fases.                  | `tasks/prd-clasefit.md` con problema, alcance, reglas de negocio, trazabilidad y definición de terminado.                           |
| 2   | foundation         | Definir la base técnica del proyecto Expo + React Native + TypeScript con estructura feature-first, separación domain/application/infrastructure/presentation, reglas de dependencia y política de imports sin barrels. | `rfcs/001-foundation.md` con estructura propuesta del repositorio, contratos de capas y criterio de cierre de la fase 1.            |
| 3   | spec / design      | Convertir el PRD en artefactos de OpenSpec para `class-booking`, detallando proposal, spec, design y tasks; además aclarar patrones, puertos, persistencia, reloj y reglas RN-01 a RN-04.                               | `rfcs/002-specification-and-architecture.md` y la estructura `openspec/` con el flujo `proposal -> spec -> design -> tasks`.        |
| 4   | apply / verify     | Implementar el flujo de reservas con TDD, pruebas de dominio, contratos de adaptadores, persistencia local, Zustand, interfaz nativa y evidencia de verificación en iOS/Android.                                        | `rfcs/003-implementation-and-verification.md` con secuencia de implementación, matriz obligatoria de pruebas y criterios de cierre. |
| 5   | evidence / handoff | Preparar la evidencia final sin inventar resultados: bitácora de IA, reflexión, checklist de release, validaciones reales de OpenSpec y trazabilidad entre requisitos, pruebas y entrega.                               | `rfcs/005-evidence-and-handoff.md` con los entregables documentales y el criterio de cierre para la fase final.                     |

## Errores de la IA que detecté

| #   | Qué hizo mal | Cómo lo detecté | Cómo lo resolví |
| --- | ------------ | --------------- | --------------- |
| 1   |              |                 |                 |

## Resultado de `openspec validate`

```
(pega aquí la salida)
```
