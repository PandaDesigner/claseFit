# RFC-001 — Fase 1: base técnica y estructura por funcionalidades
Estado: propuesto. Depende de revisar el alcance del PRD. No se ha ejecutado la configuración.

## Decisión
Utilizar una aplicación y una funcionalidad de negocio inicial, `class-booking`, responsable de ambas pantallas. Una pantalla no constituye automáticamente un contexto de negocio independiente. No separar clases y reservas en funcionalidades mutuamente dependientes. Agregar otras carpetas de funcionalidades solamente cuando exista una capacidad independiente real.

## Estructura propuesta del repositorio
```text
clasefit/
├── App.tsx
├── PRODUCT.md
├── DESIGN.md
├── README.md
├── app.json
├── eas.json
├── package.json
├── tasks/prd-clasefit.md
├── docs/rfcs/
├── docs/design/references/
├── insumo-funcional/mock-data/clases.json
├── openspec/
│   ├── config.yaml                 # O el contexto requerido por la versión instalada
│   ├── specs/                      # Especificaciones vigentes después de archivar
│   └── changes/add-class-booking/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/class-booking/spec.md
├── src/
│   ├── app/
│   │   ├── composition.ts          # Conecta dependencias; sin reglas de negocio
│   │   ├── providers.tsx
│   │   └── navigation/RootTabs.tsx
│   ├── features/class-booking/
│   │   ├── composition.ts          # Puerta pública: construye casos de uso y store
│   │   ├── domain/
│   │   │   ├── entities/           # Reservation, ClassSession
│   │   │   ├── policies/           # Reglas de cupos, duplicados y límite diario
│   │   │   ├── states/             # ActiveReservation, CancelledReservation
│   │   │   ├── services/           # BookingPolicy coordina validaciones
│   │   │   └── errors/             # Códigos tipados de errores de negocio
│   │   ├── application/
│   │   │   ├── use-cases/          # InitializeBookings, BookClass, CancelBooking
│   │   │   ├── ports/              # BookingRepository, BookingStateStore, Clock
│   │   │   ├── queries/            # Próximas clases y reservas activas
│   │   │   └── dto/                # Instantáneas inmutables y serializables
│   │   ├── infrastructure/
│   │   │   ├── persistence/        # AsyncStorageBookingRepository
│   │   │   ├── state/              # ZustandBookingStateAdapter
│   │   │   ├── time/               # SystemClock y resolución de fechas de Bogotá
│   │   │   ├── fixtures/           # Carga y validación de datos iniciales
│   │   │   └── mappers/            # Dominio ↔ DTO persistidos
│   │   ├── presentation/
│   │   │   ├── screens/            # UpcomingClassesScreen, MyBookingsScreen
│   │   │   ├── components/         # ClassCard, BookingCard, CancellationSheet
│   │   │   ├── hooks/              # Suscripciones y delegación a casos de uso
│   │   │   └── copy/               # Mensajes de error y estado en español
│   │   └── __tests__/
│   │       ├── domain/
│   │       ├── application/
│   │       ├── contracts/
│   │       ├── infrastructure/
│   │       └── presentation/
│   └── shared/ui/
│       ├── tokens/
│       └── components/            # Solo primitivas realmente reutilizables
├── bitacora_ia.md
├── respuestas_reflexion.md
└── checklist_release.md
```
Es un plan, no una solicitud de generar carpetas o clases vacías. Mantener la lógica específica dentro de su funcionalidad. El JSON del insumo tiene una única fuente de verdad; un cargador puede importarlo sin mantener una copia duplicada de los datos.

## Reglas de dependencia
Presentación → aplicación → dominio. Infraestructura implementa puertos definidos por aplicación y puede depender de dominio. Solamente la composición conoce implementaciones concretas. Dominio no importa React, Zustand, AsyncStorage, navegación ni API nativas. Aplicación no importa infraestructura. La interfaz compartida no importa funcionalidades.

## Regla de imports (sin barrels)
Todos los imports apuntan a la ruta del módulo concreto, nunca a un barrel que re-exporte varios archivos. No crear `index.ts` que haga `export *` ni re-exports nombrados dentro de `src/`. Razones: los barrels rompen tree-shaking, ejecutan efectos de módulo (inicialización de store Zustand, registro de AsyncStorage, carga de fixtures) al importar tipos o DTOs pasivos, crean instancias singleton no deseadas y dificultan el aislamiento de pruebas.

- ✅ `import { BookClass } from '@features/class-booking/application/use-cases/BookClass'`
- ✅ `import { PrimaryButton } from '@shared/ui/components/PrimaryButton'`
- ✅ `import { spacing } from '@shared/ui/tokens/spacing'`
- ❌ `import { BookClass } from '@features/class-booking'` (no existe un barrel público)
- ❌ `import { PrimaryButton } from '@shared/ui/components'` (consumir siempre por archivo)

La única "puerta pública" de la feature es `composition.ts`, que expone un constructor de casos de uso ya cableados con sus puertos. Quien consuma `class-booking` desde otra parte importa `composition.ts` o el módulo concreto que necesite. `shared/ui/tokens/` y `shared/ui/components/` se importan archivo por archivo; está prohibido añadir un `index.ts` re-exportador en esas carpetas. Si una librería externa exige un barrel, se acepta únicamente `export type *` y solo si no arrastra valores con efectos.

## Blast radius al cambiar un adaptador
Las dos reglas anteriores (dependencias hacia adentro + imports por ruta) tienen una consecuencia operativa explícita: **cambiar o añadir un adaptador solo toca el archivo del adaptador y `composition.ts`.** Dominio, casos de uso, queries, DTOs, hooks y pantallas permanecen idénticos.

| Cambio que se quiere hacer | Archivos que se modifican | Lo que NO se toca |
|---|---|---|
| Sustituir Zustand por otro store | `infrastructure/state/*Adapter.ts` + `composition.ts` | dominio, casos de uso, queries, hooks, UI |
| Sustituir AsyncStorage por otra persistencia | `infrastructure/persistence/*Repository.ts` + `composition.ts` | dominio, casos de uso, queries, hooks, UI |
| Fijar el reloj en una prueba | `composition.ts` recibe un `FixedClock` | ni siquiera el adapter de tiempo |
| Añadir logging/observabilidad transversal | nuevo `LoggingBookingRepository` (envuelve al real) + `composition.ts` | dominio, casos de uso, queries, hooks, UI |
| Cambiar el límite diario (RN-03) | `domain/policies/DailyLimitRule.ts` | ningún adapter, ningún caso de uso, ningún componente |

El contrato del puerto define la frontera. Si una acción nueva necesita algo que el puerto actual no expone, se amplía el puerto y su adapter concreto, no los casos de uso ni el dominio. Si romper un caso de uso obliga a tocar un componente, hay un fallo de contrato que se resuelve rediseñando el puerto, no añadiendo condicionales en la presentación.

## Tareas de configuración y criterio de cierre
Registrar versiones de Node, gestor de paquetes, Expo y OpenSpec; elegir dependencias compatibles entre sí. Crear la aplicación Expo TypeScript y configurar Jest; inicializar OpenSpec siguiendo la ayuda del CLI instalado; escribir contexto y scripts de pruebas, verificación de tipos y lint. Comprobar inicio de la aplicación y una prueba básica. Guardar resultados reales. Realizar un commit convencional de fase, por ejemplo `chore: initialize Expo and OpenSpec`, sin líneas de atribución.

## Alternativas y compromisos
Las carpetas globales por capa son más breves inicialmente, pero dispersan una funcionalidad por el repositorio. Feature-first agrega niveles de carpetas y conserva la responsabilidad de cada funcionalidad. Un monorepo o paquete de arquitectura reutilizable es innecesario para una sola aplicación móvil. No migrar ni eliminar automáticamente el repositorio anterior.
