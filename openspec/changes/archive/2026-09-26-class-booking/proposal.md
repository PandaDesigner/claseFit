## Why

ClaseFit dispone de una base técnica, pero Laura todavía no puede consultar clases, reservar cupos ni administrar sus reservas. RFC-002 incorpora ese primer flujo de producto con reglas de negocio deterministas y una arquitectura que pueda evolucionar sin acoplar la UI a la persistencia.

## What Changes

- Crear el bounded context único `class-booking` para listar próximas clases, reservar y cancelar reservas.
- Aplicar reglas de capacidad, reserva duplicada, límite diario y ventana de cancelación con mensajes literales del PRD y precedencia determinista.
- Modelar el dominio con entidades encapsuladas, estrategias de reglas y estados de reserva; exponer casos de uso mediante ports y adapters inyectados.
- Persistir estado local de forma serializada y recuperable, separando infraestructura, aplicación y presentación.
- Entregar las pantallas de Clases y Mis reservas con el contrato visual del proyecto.
- Implementar cada comportamiento mediante TDD: prueba roja comprobada, implementación mínima y refactorización en verde.

## Capabilities

### New Capabilities

- `class-booking`: Consulta de clases, reserva, cancelación, reglas de disponibilidad, estado local y presentación móvil asociada.

### Modified Capabilities

- Ninguna.

## Impact

- Nuevo código bajo `src/features/class-booking/` y composición de dependencias para sus adapters.
- Nuevas pruebas unitarias de dominio/aplicación y pruebas de presentación para los flujos visibles.
- Sin API remota ni cambio de dependencias de runtime previstos; usa AsyncStorage, Zustand y React Navigation ya instalados.
- La capacidad `project-foundation` no cambia: esta propuesta construye sobre su baseline y convenciones.

## Non-goals

- Sin autenticación, sincronización cloud, pagos, notificaciones push ni soporte multiusuario.
- Sin nuevos bounded contexts ni lógica de reservas en componentes de React.
