# Contexto del proyecto

ClaseFit es un MVP móvil para que Laura Gómez consulte, reserve y cancele clases de un gimnasio de Medellín. El repositorio de aplicación todavía no existe: este paquete define el plan para empezarlo de cero.

Tecnología objetivo: Expo + React Native + TypeScript strict; Jest; React Native Testing Library; React Navigation; Zustand como estado observable mediante adapter; AsyncStorage como persistencia mediante repository; EAS para preparación de publicación.

Estructura: `src/features/class-booking/{domain,application,infrastructure,presentation}`. La UI es funcional; POO se concentra en dominio, casos de uso y adaptadores. El flujo es SDD con OpenSpec y TDD RED → GREEN → REFACTOR por tarea.
