# Tasks: 001 Inicializar proyecto — borrador auditoría 2026-09-26

> Estado: BORRADOR. Conservado como referencia histórica.
> Realidad ejecutada bajo `archive/2026-09-25-initialize-project/`.

## Notas de auditoría

- `src/app/` no existe en la entrega real; el entry vive en raíz
  (`App.tsx` + `index.ts`). Las tareas 1.2 y 2.2 reflejan esta
  desviación.
- Las tareas marcadas `[x]` tienen evidencia en código, commits
  (`8de1be5`, `4c283e6`, `0f5b9f0`, `13e9f7f`) o specs vivos.

## 1. Configuración inicial

- [x] 1.1 RED smoke test verificando que la app renderiza sin crashes.
      → `__tests__/smoke.test.tsx` asserts `getByText('Hola, Laura')`.
- [ ] 1.2 GREEN Expo TS con entry bajo `src/app/`.
      → entry real en raíz (`App.tsx` + `index.ts`).
- [x] 1.3 REFACTOR scripts Jest/types/lint en `package.json`.
      → scripts `test`, `typecheck`, `lint`, `format`, `format:check`;
      `eslint.config.js` flat config.

## 2. OpenSpec y árbol inicial

- [x] 2.1 `openspec init` real + `openspec/config.yaml` poblado.
      → `openspec/config.yaml` 13.5 KB (186 líneas).
- [ ] 2.2 `src/app/` con providers y `src/features/class-booking/` sin stubs.
      → `src/features/class-booking/*` implementado completo (no stubs);
      sin `src/app/`.
- [x] 2.3 Rutas concretas (sin barrels), versiones reales.
      → ESLint bloquea barrels; versiones reales en `package.json`.

## 3. Validación

- [x] 3.1 `pnpm test/typecheck/lint` con salida real capturada.
      → 21 suites / 96 tests pass.
- [x] 3.2 `openspec validate 001-initialize-project` + commit del cambio.
      → archivado en `openspec/changes/archive/2026-09-25-initialize-project/`.
