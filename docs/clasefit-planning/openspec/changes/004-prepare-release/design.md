# Design: Preparar archivo y release

## Enfoque técnico
La configuración de release se mantiene declarativa en app.json/eas.json. Archive preserva la trazabilidad de OpenSpec y checklist reporta hechos.

## Decisiones
| Decisión | Elección | Alternativa | Motivo |
|---|---|---|---|
| Credenciales | fuera del repo | archivos versionados | seguridad |
| Build cloud | opcional/autorizado | asumirlo terminado | evidencia honesta |
| Archive | después de verify | archivar por calendario | preservar fuente de verdad |

## Pruebas
Validar sintaxis de configuración y checklist; no se simula aprobación de tiendas. Sin migración.
