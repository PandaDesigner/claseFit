# ClaseFit — contrato visual propuesto
Estado: propuesto; los mockups no son capturas de producción. No se ha implementado ninguna interfaz en este reinicio.

## Intención y autoridad
Experiencia móvil orientada a que Laura complete reservas. El insumo funcional y los escenarios aprobados tienen prioridad sobre las imágenes generadas. Conservar la inspiración seleccionada: superficies pastel redondeadas, controles oscuros, tipografía clara e imágenes deportivas moderadas. No copiar métricas de salud ni funciones de gestión de proyectos de las referencias.

## Tokens propuestos
| Token | Valor inicial / intención |
|---|---|
| background | #F7F8FA |
| text.primary / action.primary | #191B1D |
| text.secondary | #51565C |
| category.functional | #C6EBEE |
| category.yoga | #E5DBF5 |
| category.rumba | #F5EDAE |
| category.spinning | #D8F3E5 |
| texto / superficie destructiva | #8C1D24 / #FCE7EA |
| espaciado | 4, 8, 12, 16, 24, 32 unidades lógicas |
| radio | 12 en controles pequeños; 24 en tarjetas/paneles; forma de cápsula para acciones principales |
| tipografía | Sans del sistema nativo inicialmente; títulos 28–32, títulos de tarjeta 20–24, cuerpo 16, texto secundario 14 |

Son valores propuestos, no una extracción medida de imágenes. Verificar contraste final del texto (4.5:1 normal, 3:1 grande) y controles significativos. El estado no depende solo del color. Evitar eslóganes diminutos y retratos ficticios de instructores.

## Pantallas y componentes
### Próximas clases
Marca/sede y saludo compactos; título; indicación del límite diario; secciones cronológicas por día. Cada ClassCard muestra hora, duración, nombre, instructor, cupos disponibles/totales y acción explícita. Llena: “Llena”; reservada: estado textual. Mantener legibles los números de disponibilidad incluso sin imágenes. Evitar un banner principal que desplace los controles de reserva fuera de pantalla.

### Mis reservas
Reservas activas en orden cronológico. BookingCard muestra fecha/hora, duración, instructor y estado. Cancelar es una acción secundaria. Mostrar la regla de dos horas cerca de la acción; explicar por qué está bloqueada cuando corresponda. Estado vacío: “Aún no tienes reservas”, con acción para volver a Clases. La confirmación de éxito es transitoria y accesible, no un mensaje permanente fijado en la pantalla.

### Panel de cancelación
Clase/fecha/hora seleccionadas; “¿Cancelar tu reserva?”; “Tu cupo quedará disponible para otra persona.” Acción segura principal: “Mantener reserva”; acción destructiva secundaria: “Sí, cancelar”. Confirmar vuelve a validar elegibilidad. Cerrar o usar el botón de retroceso de la plataforma no cancela. Mantener el foco del lector de pantalla dentro del panel y restaurarlo al cerrar.

## Estados de interacción
Hidratación: no mostrar fugazmente una cuenta vacía ni permitir modificaciones. Escritura pendiente: impedir acciones duplicadas y anunciar progreso. Fallo de almacenamiento: explicar cómo reintentar sin mostrar éxito. Los estados llena/reservada/límite diario siguen validados en el caso de uso. No se necesita indicador de carga de red ni aviso de desconexión en esta aplicación exclusivamente local. Los mensajes exactos de las RN están en PRD/fuente.

## Navegación y adaptación
Solo Clases y Mis reservas. Navegación oscura redondeada con etiquetas legibles; la superficie interior para la pestaña activa es opcional si accesibilidad o distribución de plataforma requieren ajustes. Reservar áreas seguras y espacio al final de las listas. Permitir desplazamiento en lugar de reducir el texto. Las imágenes decorativas pueden reducirse o eliminarse con pantallas pequeñas o fuentes grandes. Áreas táctiles: iOS ≥44 y Android ≥48 unidades lógicas.

## Recursos y movimiento
Las imágenes decorativas de categorías no deben interpretarse como retratos reales de instructores. Usar recursos con licencia e incluidos en la aplicación, con alternativa sin imagen; reservar no debe requerir descargas de red. El eslogan generado no está aprobado. Solo transiciones breves de pulsación, pestaña y panel; respetar movimiento reducido. No agregar gráficos, indicadores circulares de progreso, chat ni pestañas adicionales.

## Aceptación visual
Verificar ambas plataformas nativas, texto ampliado, pantalla compacta, áreas seguras, nombres largos de instructores, lectores de pantalla, controles deshabilitados y estados vacíos/de error. Las imágenes orientan el diseño; no demuestran contraste ni corrección de distribución. Corregir durante la implementación las inconsistencias de estado o mensajes en ejemplos generados.

## Referencias visuales
- [Próximas clases](references/mockups/upcoming-classes.png)
- [Mis reservas](references/mockups/my-bookings.png)
- [Confirmación de cancelación](references/mockups/cancel-confirmation.png)
