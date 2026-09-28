# Design: Inicializar base técnica

## Enfoque técnico

Crear el mínimo proyecto Expo compatible con TypeScript strict y Jest. Preparar rutas feature-first sin crear implementaciones vacías de dominio.

## Decisiones

| Decisión     | Elección                     | Alternativa           | Motivo                                            |
| ------------ | ---------------------------- | --------------------- | ------------------------------------------------- |
| Organización | feature-first                | capas globales        | preserva ownership de class-booking               |
| Imports      | rutas concretas, sin barrels | index.ts reexportador | evita inicializaciones y acoplamientos implícitos |
| Pruebas      | Jest desde el inicio         | agregarlas al final   | habilita TDD real                                 |

## Flujo

`script de prueba → Jest → smoke test`; `OpenSpec → cambios versionados`.

## Archivos previstos

`package.json`, `tsconfig.json`, configuración Jest, `openspec/`, `src/app/` y la raíz de `src/features/class-booking/`.

## Pruebas

Una smoke test debe fallar antes de configurar el entorno y pasar después. No hay migración.
