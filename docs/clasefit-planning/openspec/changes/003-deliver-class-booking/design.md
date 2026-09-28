# Design: Entregar funcionalidad de reservas ClaseFit

## Enfoque técnico

Composition crea los adapters y los inyecta en casos de uso. La UI funcional consume snapshots inmutables mediante hooks; nunca instancia adapters ni contiene reglas.

## Decisiones

| Decisión   | Elección                      | Alternativa                    | Motivo                                  |
| ---------- | ----------------------------- | ------------------------------ | --------------------------------------- |
| Estado     | ZustandBookingStateAdapter    | Zustand directo en UI          | permite reemplazo sin tocar UI          |
| Datos      | AsyncStorageBookingRepository | persist middleware             | separa runtime e IO                     |
| Escrituras | cola serializada              | escrituras paralelas           | evita validar snapshots obsoletos       |
| UI         | dos tabs + sheet              | pantallas con reglas embebidas | flujo nativo y responsabilidades claras |

## Flujo

`tap → use case → domain → repository → state adapter → selector hook → pantalla`.

## Archivos previstos

`infrastructure/{state,persistence,time,mappers}`, hooks, pantallas, tarjetas, sheet y `composition.ts`.

## Pruebas

Contratos de adapters, integración repo→use case→store, componentes y flujos nativos. Sin migración remota.
