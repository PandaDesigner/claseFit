# RFC-002 — Fase 2: especificación y diseño técnico
Estado: propuesto. Depende de RFC-001. El usuario solicitó POO, adaptadores y organización por funcionalidad; los contratos detallados requieren revisión.

## Organización de OpenSpec
Un cambio: `add-class-booking`; una capacidad: `class-booking`.
1. Propuesta: Why, What Changes, Impact; enlazar PRD y RFC.
2. Spec delta: `## ADDED Requirements`, `### Requirement:`, SHALL/MUST y `#### Scenario:` con WHEN/THEN. Conservar estos términos de sintaxis.
3. Diseño técnico: contexto, límites entre carpetas, estado/persistencia, modelo de fechas, alternativas y riesgos; enlazar este RFC y DESIGN.md.
4. Tareas: pasos pequeños verificables de manera independiente para dominio, adaptadores, interfaz, pruebas y publicación.
5. Validar con el CLI de OpenSpec instalado y guardar la salida real; revisar antes de implementar.

No utilizar el estado del RFC como estado de implementación. No crear cinco copias del mismo cambio funcional. Consultar versión y ayuda antes de elegir comandos: la guía advierte que los comandos y archivos de contexto varían. Archivar únicamente en fase 4, después de verificar.

## Decisiones sobre patrones
| Patrón | Responsabilidad concreta | Cuándo NO utilizarlo / costo |
|---|---|---|
| Entidad + encapsulación | Reservation protege transiciones válidas; ClassSession protege invariantes de cupos/fechas | No crear una clase por cada etiqueta o DTO pasivo de interfaz |
| Adapter + puertos | Aislar estado observable, persistencia y reloj de la aplicación | No envolver cada función de una librería; solo límites reemplazables |
| Repository | Cargar/guardar el conjunto completo y persistente de reservas | No introducir CRUD genérico ni múltiples almacenes parciales |
| Objetos de reglas estilo Strategy | CapacityRule, DuplicateRule y DailyLimitRule implementan BookingRule | Tres funciones con nombre serían suficientes sin el requisito explícito de aprendizaje de POO |
| State | ActiveReservation permite cancelar tras validar; CancelledReservation rechaza transiciones repetidas | No incluir carga/error de interfaz en la máquina de estados de negocio; una unión sería más simple con solo dos estados |
| Inyección por constructor | Proporcionar puertos a los casos de uso desde la raíz de composición | No usar contenedor de inyección ni localizador global de servicios |

Las tres reglas de reserva se componen y evalúan. Strategy proporciona implementaciones de reglas intercambiables; no significa elegir una regla y omitir las demás. El patrón State de negocio es independiente de la gestión de estado con Zustand. Preferir transiciones inmutables que devuelvan una nueva reserva a mutar un objeto ya expuesto a React.

## Puertos y adaptadores: contratos separados
| Puerto | Contrato semántico | Adaptador inicial | Sustituto para pruebas |
|---|---|---|---|
| BookingRepository | Carga/guardado asíncrono de datos versionados y validados; la escritura termina únicamente al completar almacenamiento | AsyncStorageBookingRepository | InMemoryBookingRepository con inyección de fallos |
| BookingStateStore | getSnapshot/replaceSnapshot/subscribe síncronos, con DTO inmutables y cancelación de suscripción | ZustandBookingStateAdapter con store vanilla interno | InMemoryBookingStateAdapter |
| Clock | Devolver el instante actual | SystemClock | FixedClock |

Zustand gestiona estado en ejecución; AsyncStorage proporciona almacenamiento persistente clave-valor. No se sustituyen entre sí. Reemplazar Zustand modifica el adaptador de estado y la composición. Reemplazar AsyncStorage modifica el adaptador de repositorio y la composición. Dominio y casos de uso permanecen iguales.

El store mantiene la instantánea confirmada en ejecución; el repositorio mantiene su representación persistente. No agregar otra caché mutable del dominio. La interfaz no modifica directamente el store ni el almacenamiento. Las suscripciones exponen instantáneas estables e inmutables; cualquier adaptador sustituto debe conservar la semántica de suscripción y desuscripción. Los hooks dependen del contrato del store, no de imports de Zustand.

## Flujo de comandos y consistencia
1. La inicialización carga DTO persistidos, valida el esquema y reconstruye entidades; si no existen datos, crea el conjunto inicial con fechas resueltas. No escribir un estado vacío predeterminado antes de terminar la hidratación.
2. Serializar comandos de reserva/cancelación mediante una cola única de la funcionalidad. Deshabilitar acciones incompatibles mientras hay un comando pendiente, manteniendo la validación de dominio como autoridad.
3. Al ejecutar, leer la última instantánea confirmada y Clock; reconstruir objetos de dominio desde los DTO.
4. Validar invariantes relevantes y producir un nuevo estado candidato sin modificar el confirmado.
5. Persistir el conjunto candidato completo bajo una única clave versionada y esperar su finalización.
6. Publicar la instantánea inmutable confirmada y después mostrar éxito. Ante error de escritura, conservar la instantánea anterior, sin éxito falso ni modificación de cupos.
7. Liberar siempre la cola, tanto al completar como al fallar. Revalidar el tiempo después de esperar y después de la confirmación.

Es persistencia local pesimista y serializada, no una transacción distribuida. Si la aplicación se cierra después de guardar pero antes de publicar en la interfaz, el resultado guardado se recupera al inicializar nuevamente. Ante error de lectura o validación, conservar los datos almacenados, bloquear mutaciones y ofrecer reintento; cualquier reinicio de datos requiere consentimiento explícito. No prometer consistencia entre dispositivos.

## DTO de persistencia
Guardar schemaVersion, datasetVersion, baseDateBogota, sesiones con fechas resueltas y registros de reserva con ID de reserva, ID de socio, ID de sesión, status, createdAt y cancelledAt cuando corresponda. Guardar instantes ISO y datos planos; no métodos, prototipos, suscripciones ni indicadores transitorios de interfaz. Detectar versiones desconocidas sin borrar datos silenciosamente. Las migraciones futuras deben ser explícitas y probadas.

Identidad de sesión = ID de clase original + fecha local concreta. Resolver diaOffset una vez para el conjunto de demostración y persistirlo para no desplazar reservas al reiniciar. Calcular ocupación desde ocupados de la fuente + reservas activas del socio; nunca persistir otro contador de cupos. Una incompatibilidad de versión de los datos iniciales requiere decidir explícitamente migración o reinicio, no reasignar reservas automáticamente.

## Aclaraciones de comportamiento propuestas
- Exactamente 120 minutos antes: se permite cancelar. Con menos tiempo: se bloquea. Resuelve el conflicto con el ejemplo de la guía a favor del texto de RN-04, pendiente de aprobación.
- Rechazar una reserva de una clase iniciada aunque una interfaz desactualizada todavía la muestre; requisito defensivo adicional, no una quinta RN original inventada.
- Active→Cancelled es terminal para ese registro. Reservar nuevamente crea otro registro activo si se cumplen todas las reglas.
- El límite diario utiliza la fecha calendario de la clase en Bogotá, no la fecha UTC ni la fecha de creación de la reserva.
- Las reservas pasadas existentes permanecen visibles; no hay eliminación automática ni nueva funcionalidad de historial.
- Si coinciden errores, informar RN-01, después RN-02 y después RN-03 consistentemente.

## Alternativas descartadas en esta propuesta
- Middleware persist de Zustand como único responsable de persistencia: es breve, pero acopla hidratación/escrituras al store y dificulta el límite independiente solicitado. Preferir orquestación explícita con repositorio; no habilitar ambos caminos.
- Redux Saga: agrega orquestación y código sin flujos de red que lo justifiquen.
- Reglas de negocio en hooks/componentes: simple inicialmente, difícil de probar y reutilizar independientemente.
- Numerosos repositorios o clases base para casos de uso: innecesarios para diez clases de ejemplo y una socia.

## Criterio de cierre
Aprobar aclaraciones, contratos y DESIGN.md. Cada RN debe tener escenarios de éxito, rechazo y frontera. La persistencia y el reemplazo de adaptadores deben tener escenarios. Guardar validación exitosa de OpenSpec y después el commit convencional `docs: specify class booking and architecture`. No declarar cumplido este criterio durante la generación documental.
