# Tasks: 002 Definir class-booking — borrador auditoría 2026-09-26

> Estado: BORRADOR. Conservado como referencia histórica.
> Implementación real subsumida en
> `openspec/changes/archive/2026-09-26-class-booking/`.

## Notas de auditoría

- Toda la entrega está consolidada bajo el nombre vivo `class-booking`,
  no como `002-define-class-booking`.
- Las tareas marcadas `[x]` están justificadas por
  `domain/{entities,policies,states}`, `application/{ports,dto,use-cases}`,
  tests en `__tests__/{domain,application,infrastructure,presentation}`,
  y los specs vivos `openspec/specs/class-booking/spec.md`.

## 1. Revisión y alineación

- [x] 1.1 Revisar PRD y validar RN-01…RN-04.
- [x] 1.2 Validar frontera de exactamente 2 horas para cancelación.

## 2. Arquitectura

- [x] 2.1 Contratos DTO + puertos `BookingRepository`,
      `BookingStateStore`, `Clock`.
- [x] 2.2 Entidades + Strategy sin imports de framework.

## 3. Casos de uso y dominio

- [x] 3.1 RED pruebas RN-01/RN-02/RN-03 + boundary 2h.
- [x] 3.2 GREEN implementaciones mínimas.
- [x] 3.3 REFACTOR dedupe + cero acoplamiento a infra.

## 4. Validación

- [x] 4.1 Pruebas de dominio + `openspec validate 002`.
