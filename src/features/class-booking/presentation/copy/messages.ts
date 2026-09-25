export const messages = {
  success: '¡Listo! Tu cupo está reservado',
  emptyBookings: 'Aún no tienes reservas',
  noCapacity: 'Esta clase ya no tiene cupos.',
  duplicate: 'Ya reservaste esta clase.',
  dailyLimit: 'Solo puedes reservar 2 clases por día.',
  cancellationWindow: 'Ya no puedes cancelar: faltan menos de 2 horas.',
  alreadyCancelled: 'La reserva ya estaba cancelada.',
  sessionFull: 'Llena',
  keepBooking: 'Mantener reserva',
  confirmCancel: 'Sí, cancelar',
  cancelPrompt: '¿Cancelar tu reserva?',
  cancelDescription: 'Tu cupo quedará disponible para otra persona.',
  classesTab: 'Clases',
  myBookingsTab: 'Mis reservas',
} as const;

export type MessageKey = keyof typeof messages;
