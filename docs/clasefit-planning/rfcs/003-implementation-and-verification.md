# RFC-003 — Fase 3: implementación y verificación
Estado: propuesto. Depende de RFC-002 aprobado y artefactos OpenSpec validados.

## Secuencia
1. Escribir pruebas de escenarios de dominio que fallen, con FixedClock; implementar entidades, objetos de reglas y estados de reserva; refactorizar cuando pasen.
2. Escribir pruebas de contratos de puertos y después dobles en memoria y casos de uso.
3. Implementar mapeo de DTO, inicialización de datos con fechas, repositorio AsyncStorage y tratamiento de errores.
4. Implementar adaptador Zustand y conexión de suscripciones; demostrar que estado y persistencia se reemplazan independientemente.
5. Conectar composición, pantallas funcionales, dos pestañas y panel de cancelación.
6. Implementar hidratación y estados pendiente/error/vacío/éxito; actualizar el tiempo al reanudar la aplicación y cruzar límites de inicio/cancelación. Limpiar suscripciones y temporizadores.
7. Verificar flujos completos, ejecutar controles de calidad y conciliar evidencia con tareas y especificaciones.

Utilizar tasks de OpenSpec para seguir la implementación. Mantener lotes pequeños y detenerse para la revisión de fase del usuario; no ejecutar publicación automáticamente.

## Matriz obligatoria de pruebas
| Área | Casos |
|---|---|
| RN-01 | Sin cupos; exactamente un cupo; conservar estado ante fallo de persistencia |
| RN-02 | Reserva activa duplicada; toques rápidos repetidos; cancelar y reservar nuevamente |
| RN-03 | Primera/segunda aceptada, tercera rechazada; otro día aceptado; cancelar libera espacio en el límite diario |
| RN-04 | 2 h + 1 ms aceptado; exactamente 2 h aceptado sujeto a interpretación aprobada; 2 h − 1 ms rechazado; sesión pasada rechazada; confirmación desactualizada |
| Cupos | Otros socios no cambian; reserva exitosa −1; cancelación exitosa +1; repetir cancelación no libera más |
| Tiempo | Hoy/mañana/pasado mañana; orden por inicio; ocultar en instante exacto de inicio; medianoche; cambio de mes/año; distinta zona horaria del dispositivo |
| Persistencia | Reinicio en frío; registros activos/cancelados; JSON inválido; versión desconocida; fallos de lectura/escritura; no sobrescribir con vacío antes de hidratar |
| Concurrencia | Dos reservas distintas compiten por el último cupo diario; validación serializada sobre datos actualizados; la cola se recupera de errores |
| Contratos de adaptadores | Mismas pruebas de instantánea/suscripción en Zustand y estado en memoria; misma semántica de repositorio en AsyncStorage y repositorio en memoria |
| Presentación | Botón de clase llena deshabilitado, estado reservado, mensajes exactos, cierre de confirmación, lista vacía, reintento, etiquetas accesibles |

Las pruebas del mapeador no sustituyen una prueba de integración de hidratación real y orden de la primera escritura. Simular almacenamiento nativo cuando sea necesario, pero probar el flujo repositorio/caso de uso/store. Conservar fechas concretas de sesiones después de reiniciar tras medianoche.

## Evidencia de verificación
Ejecutar Jest, TypeScript y scripts de lint configurados; registrar comandos y salidas reales. Probar en emulador o dispositivo iOS/Android. La vista previa web complementa, pero no reemplaza, la verificación nativa de áreas seguras, accesibilidad, almacenamiento y navegación. Comparar con DESIGN.md en tamaños compactos y amplios, con fuentes ampliadas y movimiento reducido.

## Cierre y tratamiento de fallos
Todos los escenarios obligatorios deben pasar; ninguna tarea crítica puede quedar sin comprobar; ambas pestañas comparten estado coherente; las escrituras rechazadas son seguras y se respetan los límites de dependencia. Si un escenario falla, regresar a su tarea; no archivar. Registrar limitaciones honestamente. Commit sugerido: `feat: implement and verify class booking`.

## Compromiso técnico
POO y adaptadores agregan código a una prueba pequeña. Mantener una funcionalidad, tres puertos acotados y solo patrones justificados. Reducir primero las ilustraciones decorativas si falta tiempo; no sacrificar pruebas de negocio por fidelidad visual.
