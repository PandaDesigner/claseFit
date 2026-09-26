# RFC-004 — Fase 4: archivo y preparación de publicación
Estado: propuesto. Depende de RFC-003 verificado; este documento no autoriza por sí solo acciones de publicación.

## Alcance
Preparar la configuración de publicación y documentar bloqueos externos explícitamente. La prueba no exige publicar en tiendas. La compilación de prueba en la nube es un bonus.

## Plan
- Volver a validar el cambio y comprobar que las tareas coinciden con la evidencia.
- Archivar mediante el flujo de OpenSpec instalado; inspeccionar especificaciones vigentes y cambio archivado. Archivar no elimina la trazabilidad.
- Configurar nombre, slug, versión, android.package e ios.bundleIdentifier con identidad aprobada; no entregar un propietario de ejemplo como definitivo.
- Configurar perfiles EAS preview y production conforme a las versiones instaladas de Expo/EAS.
- Registrar cada elemento de la lista como verificado, pendiente o bloqueado, con evidencia.
- Ejecutar compilaciones en la nube, configuración de credenciales o envíos solo después de autorización explícita; no inventar enlaces a APK.

## Categorías de comprobación
Configuración del proyecto; recursos por plataforma; disponibilidad de firma/cuentas; ficha/capturas de tienda; política de privacidad y declaraciones de datos; clasificación de contenido; pruebas por plataforma; bloqueos conocidos. Revisar requisitos oficiales vigentes al ejecutar, no de memoria. Mantener secretos fuera del repositorio.

## Criterio de cierre
La especificación vigente y el archivo existen; la configuración app/eas es válida para las versiones elegidas; la lista distingue honestamente lo configurado de lo publicado. Commit sugerido: `chore: archive booking change and prepare release`.

## Riesgos y alternativas
Las colas de EAS, firmas o cuentas pueden bloquear una compilación sin invalidar la evidencia funcional local. Entregar la configuración requerida y declarar bloqueos en lugar de afirmar aprobación o preparación absoluta para tiendas. Un APK de prueba no es una publicación de producción.
