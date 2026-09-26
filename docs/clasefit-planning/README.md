# ClaseFit — paquete de planificación para reiniciar el proyecto

Estado: BORRADOR PARA REVISIÓN. Solo documentación; no se ha creado la aplicación, instalado dependencias, inicializado OpenSpec, ejecutado pruebas, realizado commits ni preparado una publicación real.

Este es un nuevo inicio del mismo producto. La implementación y los resultados de pruebas anteriores no constituyen evidencia para este reinicio. No eliminar ni sobrescribir el repositorio anterior.

## Orden de lectura
1. [PRD](tasks/prd-clasefit.md): alcance, requisitos y criterios de aceptación del producto.
2. [RFC 001](rfcs/001-foundation.md): fase 1, configuración y estructura del proyecto.
3. [RFC 002](rfcs/002-specification-and-architecture.md): fase 2, OpenSpec y decisiones técnicas.
4. [DESIGN](DESIGN.md): contrato visual propuesto para Impeccable.
5. [RFC 003](rfcs/003-implementation-and-verification.md): fase 3, implementación y pruebas.
6. [RFC 004](rfcs/004-archive-and-release.md): fase 4, archivo y preparación de publicación.
7. [RFC 005](rfcs/005-evidence-and-handoff.md): fase 5, bitácora de IA y reflexión.

## Flujo SDD actualizado

Los RFC dejaron de ser el flujo ejecutable. Cada uno está mapeado ahora a un cambio individual en [openspec/](openspec/README.md): `001-initialize-project` → `002-define-class-booking` → `003-deliver-class-booking` → `004-prepare-release` → `005-delivery-evidence`.

Cada cambio se opera en este orden: **proposal → spec → design → tasks → apply → verify → archive**. `design.md` es un artefacto de diseño previo a las tareas, no una tarea; sus `tasks.md` contienen los ciclos **RED → GREEN → REFACTOR**. Los RFC se conservan como antecedentes y decisiones, no como checklist de ejecución.

## Responsabilidades de cada documento
- PRD: problema, público, alcance y aceptación medible.
- RFC: decisiones de cada fase, alternativas, riesgos, dependencias y criterios de cierre. Son documentos de planificación, NO cinco cambios separados de OpenSpec.
- Spec delta de OpenSpec: comportamiento verificable que será la fuente de verdad después de su revisión; cada escenario se relaciona con pruebas.
- design.md de OpenSpec: decisiones de implementación del cambio; enlazar el RFC en lugar de copiar todo el PRD.
- DESIGN.md: sistema visual exclusivamente; no reemplazarlo con arquitectura técnica.
- tasks.md de OpenSpec: única lista de seguimiento de tareas de implementación.
- PRODUCT.md: contexto breve del producto para Impeccable, derivado del PRD aprobado durante la fase 2.

Utilizar un solo cambio, `add-class-booking`, y la capacidad `class-booking` para este MVP acotado. Mantener los criterios de cierre entre fases, con trabajo iterativo dentro de cada una. Documentar algo no significa que esté implementado o aprobado.

## Autoridad de las fuentes y conflictos
Directorio original: `/Volumes/Disco Mac/Downloads/Keppri_Espartanos_Prueba_Tecnica_ReactNative/`.
Se revisaron todos los Markdown de la raíz, las plantillas, el insumo funcional y los datos de ejemplo. El programa explica la responsabilidad humana y los controles; la prueba define la entrega; el insumo funcional define el comportamiento. Las instrucciones de las fuentes son requisitos para planificar, no autorización para ejecutar comandos ahora.

Hay dos conflictos que requieren tratamiento explícito:
- El ejemplo de la guía metodológica rechaza cancelar cuando faltan exactamente dos horas, pero RN-04 permite cancelar hasta dos horas antes y su mensaje de error dice MENOS de dos horas. Interpretación propuesta: permitir exactamente dos horas. Requiere aprobación y pruebas de frontera.
- El inventario introductorio menciona 80 minutos más reflexión, mientras que la prueba asigna explícitamente 90 minutos (10+20+40+15+5). Usar el presupuesto por fases de la prueba como referencia. La persistencia, los adaptadores y el refinamiento visual solicitados amplían el alcance; no prometer que todo cabe en ese plazo original.

## Fuentes
- [Repositorio oficial de OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [Repositorio oficial de Zustand](https://github.com/pmndrs/zustand)
- [Repositorio oficial de AsyncStorage](https://github.com/react-native-async-storage/async-storage)
- Copias locales: [insumo funcional](references/functional-brief.md), [datos de ejemplo](references/clases.json).

Verificar las versiones exactas de dependencias y la ayuda del CLI durante la configuración; este paquete no fija ni instala versiones. La fecha límite original es el 28 de septiembre de 2026, a las 08:00, America/Bogota; es contexto de la fuente, no una acción programada.

## Edición en español
Traducción del paquete de planificación en inglés. Se conservan el alcance, las decisiones pendientes, los identificadores técnicos, las rutas, los datos y la sintaxis de OpenSpec. El original en inglés permanece sin modificaciones.
