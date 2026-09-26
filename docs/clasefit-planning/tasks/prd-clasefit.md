# PRD — reservas de clases desde la aplicación móvil ClaseFit

Estado: borrador para revisión · Entrega: repositorio nuevo, documentación antes de implementar.

## 1. Problema y resultado esperado
Un gimnasio de barrio en Medellín coordina las reservas por WhatsApp, lo que provoca sobrecupos y reservas olvidadas. ClaseFit permite que una persona ya autenticada consulte las próximas clases, reserve un cupo y cancele dentro del plazo permitido.

Actora principal: Laura Gómez (`S-0001`). Gimnasio: ClaseFit · Sede Laureles.
El éxito consiste en un comportamiento de reservas correcto y explicable, no en analíticas, promesas de participación ni un panel complejo.

## 2. Alcance y prioridades
### Obligatorio según la prueba
- React Native, Expo, TypeScript, datos locales de ejemplo y Jest.
- Próximas clases y Mis reservas, más confirmación de cancelación.
- RN-01 a RN-04, con pruebas unitarias derivadas de escenarios OpenSpec.
- Ciclo completo de OpenSpec, commits por fase, bitácora de IA, reflexión y configuración/lista de comprobación de publicación.

### Requerido para este reinicio
- Carpetas organizadas por funcionalidad (feature-first), con domain/application/infrastructure/presentation dentro de la funcionalidad de reservas.
- POO para comportamiento del dominio, casos de uso y adaptadores; componentes y hooks funcionales de React.
- Adaptadores reemplazables de estado y persistencia mediante contratos separados.
- Propuesta inicial: Zustand para estado observable en ejecución; AsyncStorage para almacenamiento local persistente.
- La persistencia pasa de ser un bonus de la prueba a formar parte del alcance planificado del reinicio, sujeto a aprobación del diseño técnico.
- Usar el rediseño pastel como dirección visual, no como autoridad literal sobre píxeles o contenido.

### Opcional, después de cumplir los criterios obligatorios
APK de prueba generado en la nube y video demostrativo de 1–2 minutos. Las imágenes decorativas elaboradas tienen menor prioridad que la corrección funcional.

### Fuera de alcance
Autenticación, pagos, gestión de instructores, administración, notificaciones, backend, sincronización por red, múltiples socios/dispositivos, analíticas, seguimiento de salud, integraciones de calendario y publicación efectiva en tiendas. No agregar Redux Saga, un framework de inyección de dependencias, un bus de eventos ni un framework CRUD genérico.

## 3. Historias de usuario y aceptación
### US-01 — Consultar próximas clases
Como Laura, quiero ver las clases futuras para elegir una sesión.
- Mostrar hoy, mañana y pasado mañana, ordenados por fecha y hora de inicio.
- Mostrar nombre, fecha/día, hora, instructor y cupos disponibles/totales.
- Ocultar sesiones cuya hora de inicio sea menor o igual a la hora actual.
- Las sesiones llenas muestran “Llena” y no se pueden reservar desde la interfaz.
- Verificar visualmente en iOS y Android; comprobar pantallas pequeñas y texto ampliado.

### US-02 — Reservar una clase
Como Laura, quiero reservar una sesión disponible para asegurar mi cupo.
- Validar RN-01, RN-02 y RN-03 en dominio/aplicación, no solo deshabilitando botones.
- Una reserva exitosa reduce los cupos disponibles exactamente en uno y actualiza ambas pantallas.
- Mostrar exactamente “¡Listo! Tu cupo está reservado”.
- Una operación rechazada o una escritura fallida no modifica reservas ni cupos y no muestra éxito.
- Los toques repetidos no pueden crear reservas duplicadas ni superar el límite diario.
- Se requiere verificación visual y de interacción en plataformas nativas.

### US-03 — Consultar y cancelar reservas
Como Laura, quiero consultar mis reservas y cancelarlas cuando esté permitido.
- Mostrar reservas activas ordenadas por fecha/hora de inicio ascendente; texto vacío: “Aún no tienes reservas”.
- Solicitar confirmación. Cerrar la confirmación o mantener la reserva no modifica nada.
- Volver a validar RN-04 al confirmar, no solamente cuando se abre el panel.
- La cancelación exitosa retira la reserva activa de la lista y libera un cupo.
- Cancelar repetidamente no puede liberar cupos adicionales.
- Frontera propuesta: se permite cancelar exactamente dos horas antes; con menos de dos horas se rechaza.
- Se requiere verificación visual y de interacción en plataformas nativas.

### US-04 — Reanudar sin perder reservas
Como Laura, quiero que las reservas confirmadas se conserven al reiniciar la aplicación.
- Cargar y validar los registros persistidos antes de habilitar reservas/cancelaciones.
- Reconstruir el comportamiento del dominio desde DTO versionados; no persistir instancias de clases.
- Las reservas guardadas conservan las fechas originales de sus sesiones después de medianoche o de reiniciar.
- La persistencia local funciona sin conexión; no se introduce una dependencia de red.
- Los errores de lectura o datos inválidos muestran errores recuperables y no eliminan datos silenciosamente.
- Una escritura fallida conserva la instantánea confirmada anterior y permite reintentar.

## 4. Requisitos funcionales y mensajes exactos
| ID | Requisito | Mensaje de error/éxito |
|---|---|---|
| FR-01 | Listar sesiones futuras dentro de la ventana de tres días | El mensaje de lista de clases vacía es una decisión de interfaz propuesta |
| FR-02 / RN-01 | Rechazar una reserva sin cupos disponibles | Esta clase ya no tiene cupos. |
| FR-03 / RN-02 | Rechazar una reserva activa duplicada para el mismo socio y sesión | Ya reservaste esta clase. |
| FR-04 / RN-03 | Limitar reservas activas a dos por fecha calendario de la clase en Bogotá | Solo puedes reservar 2 clases por día. |
| FR-05 | Confirmar una reserva y actualizar disponibilidad | ¡Listo! Tu cupo está reservado |
| FR-06 | Mostrar reservas activas ordenadas y estado vacío | Aún no tienes reservas |
| FR-07 / RN-04 | Confirmar y validar la cancelación al ejecutarla | Ya no puedes cancelar: faltan menos de 2 horas. |
| FR-08 | Persistir cambios confirmados y restaurarlos de manera segura | El texto de error de almacenamiento es propuesto, no exigido por la fuente |
| FR-09 | Actualizar la elegibilidad dependiente del tiempo al reanudar y cruzar límites horarios | No depender únicamente del estado visual deshabilitado |

Las reservas canceladas no cuentan para RN-02/RN-03. Se permite reservar nuevamente si se cumplen todas las reglas; es una aclaración propuesta, no un requisito original explícito. Cuando fallen varias reglas, utilizar la precedencia determinista RN-01, RN-02, RN-03; documentarla y probarla.

## 5. Datos y tiempo
Utilizar los diez registros de clases suministrados sin cambios como datos iniciales. Campos: id, nombre, instructor, diaOffset, hora, duracionMin, cupoTotal, ocupados. `ocupados` cuenta únicamente a otros socios.
Disponibilidad = cupo total − ocupación de otros socios − reservas activas de Laura para esa sesión. Calcularla a partir de esos datos; no persistir contadores mutables independientes.

Capturar una fecha base de Bogotá al crear el conjunto de datos persistido de demostración. Resolver diaOffset + hora en instantes concretos de inicio; la identidad incluye ID de clase y fecha concreta. Persistir versión/fecha base y sesiones concretas junto con las reservas. No desplazar las reservas existentes hacia adelante cada vez que se inicia la aplicación. Cuando expire el conjunto fijo de demostración, mostrar una lista vacía real; reinicializar datos es una acción explícita de desarrollo, no un comportamiento silencioso de producción. Esta aclaración propuesta sobre persistencia requiere aprobación en la fase 2.

Utilizar un Clock inyectado para pruebas deterministas. La elegibilidad usa el instante actual real; la presentación y agrupación usan America/Bogota aunque la zona horaria del dispositivo sea distinta. Las reservas activas de sesiones pasadas permanecen visibles en Mis reservas, identificadas como iniciadas/pasadas y con cancelación bloqueada; la fuente no exige eliminación automática ni una funcionalidad de historial.

## 6. Tecnologías y arquitectura
| Área | Selección | Estado |
|---|---|---|
| Aplicación | Expo + React Native + TypeScript strict | Requisito de la prueba |
| Pruebas unitarias | Jest con configuración compatible con Expo | Requisito de la prueba |
| Estado | Zustand mediante BookingStateStore | Propuesta inicial |
| Persistencia | AsyncStorage mediante BookingRepository | Alcance del reinicio; adaptador propuesto |
| Navegación | Pestañas inferiores de React Navigation | Propuesta; evitar agregar Expo Router simultáneamente |
| Pruebas de componentes | React Native Testing Library | Herramienta de apoyo propuesta |
| Estilos | StyleSheet de React Native + tokens semánticos compartidos | Propuesta sin dependencia adicional de estilos |
| Entrega | Configuración EAS preview/production | Requisito de la prueba |
| Especificación | OpenSpec, un cambio add-class-booking | Requisito de la prueba + organización propuesta |

POO no significa utilizar componentes React basados en clases. Los objetos de negocio encapsulan invariantes; los componentes presentan DTO y delegan acciones. Los detalles y responsabilidades de carpetas están en RFC-001/002.

## 7. Experiencia de usuario
Dos pestañas: Clases y Mis reservas. Priorizar información útil sobre decoración. Superficies pastel consistentes por categoría, acciones principales oscuras, espaciado generoso y panel de cancelación claro. Conservar los mensajes funcionales exactos. Los retratos y el eslogan generados no son recursos factuales aprobados. Consultar DESIGN.md para el contrato visual propuesto.

## 8. Criterios no funcionales
- Las pruebas de dominio y aplicación se ejecutan sin React, Zustand ni almacenamiento del dispositivo.
- Cambiar el adaptador de estado o almacenamiento requiere cambios de composición, no de reglas de negocio.
- Los comandos locales serializados evitan validar contra datos desactualizados durante escrituras asíncronas.
- No guardar secretos ni credenciales de autenticación en AsyncStorage.
- Áreas táctiles mínimas de 44×44 unidades lógicas en iOS y 48×48 en Android; verificar etiquetas, texto escalable, estados para lectores de pantalla y movimiento reducido.
- Verificar contraste, pantallas pequeñas y ambas plataformas; no declarar accesibilidad basándose solamente en un mockup.
- No inventar salidas de validación, enlaces de compilaciones ni marcas de tareas completadas.

## 9. Plan por fases
| Fase | Tiempo de la fuente | RFC | Evidencia de cierre |
|---|---:|---|---|
| 1: Configuración/contexto | 10 min | 001 | Herramientas registradas, aplicación inicia, prueba básica, commit de fase |
| 2: Propuesta/spec/diseño/tareas | 20 min | 002 | Escenarios revisados, decisiones técnicas/visuales, salida de validación, commit de fase |
| 3: Implementación/verificación | 40 min | 003 | Pruebas de reglas, adaptadores e interfaz; evidencia en dispositivo; commit de fase |
| 4: Archivo/publicación | 15 min | 004 | Evidencia de archivo, configuración/lista de publicación, commit de fase |
| 5: Reflexión/entrega | 5 min | 005 | Bitácora honesta, respuestas personales, README y commit final de fase |

Registrar el uso de IA durante todo el proceso, no solo en la fase 5. La arquitectura y persistencia ampliadas pueden superar los 90 minutos originales; cerrar fases por evidencia, no por tiempo transcurrido. Ninguna fase está completada en este reinicio.

## 10. Trazabilidad y definición de terminado
| Elemento de producto | Grupo de escenarios OpenSpec | Evidencia de pruebas | Fase responsable |
|---|---|---|---|
| US-01 / FR-01 | Próximas sesiones | Pruebas de tiempo, filtro, orden y presentación | 2→3 |
| RN-01 | Disponibilidad y clase llena | Cupos cero/uno y escritura fallida | 2→3 |
| RN-02 | Reserva duplicada | Duplicado activo, toques rápidos, nueva reserva tras cancelar | 2→3 |
| RN-03 | Límite diario | Segunda/tercera reserva, otro día, cancelación | 2→3 |
| RN-04 | Frontera de cancelación | Más/exactamente/menos de 2 h, confirmación desactualizada | 2→3 |
| US-04 | Estado persistente de reservas | Reinicio, corrupción, escritura fallida, identidad por fecha | 2→3 |
| Contrato visual | Flujo de reserva accesible | Capturas iOS/Android y comprobaciones de interacción | 3 |
| Publicación | Lista de entrega | Configuración real y bloqueos declarados | 4→5 |

Terminado significa: todos los escenarios obligatorios pasan, las verificaciones de tipos y lint pasan, OpenSpec valida correctamente, las tareas tienen evidencia, el cambio se archiva solo después de verificar, la configuración está presente y la documentación coincide con los resultados reales. La aprobación efectiva de las tiendas no es un criterio de éxito.

## 11. Decisiones por revisar antes de implementar
Aprobar cancelación exactamente dos horas antes, fecha base del conjunto persistido, nuevas reservas después de cancelar, precedencia de errores y tratamiento de reservas pasadas. Confirmar opciones iniciales de estado/persistencia y navegación. Seleccionar versiones compatibles con Expo durante la configuración. Aprobar recursos ilustrativos y licencias. Confirmar identificadores de aplicación sin inventar un nombre de propietario. No resolver estas decisiones silenciosamente copiando los mockups generados.
