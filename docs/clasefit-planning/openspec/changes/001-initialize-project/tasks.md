# Tasks: Inicializar base técnica

## 1. Foundation
- [ ] 1.1 **RED** Crear `__tests__/app-smoke.test.ts` que falle porque aún no existe el punto de entrada.
- [ ] 1.2 **GREEN** Crear Expo TypeScript y el punto de entrada mínimo para pasar la smoke test.
- [ ] 1.3 **REFACTOR** Configurar scripts de Jest, tipos y lint en `package.json`.

## 2. SDD y estructura
- [ ] 2.1 Ejecutar `openspec init` en el repositorio real y contrastar/actualizar `openspec/project.md` y `config.yaml`.
- [ ] 2.2 Crear `src/app/` y la raíz de `src/features/class-booking/` sin stubs de negocio.
- [ ] 2.3 Verificar rutas concretas sin barrels y registrar las versiones reales.

## 3. Verificación
- [ ] 3.1 Ejecutar prueba, typecheck y lint; guardar la salida real.
- [ ] 3.2 Ejecutar `openspec validate 001-initialize-project`; corregir resultados antes del commit.
