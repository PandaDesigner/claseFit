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

  brandWordmark: 'ClaseFit',
  brandVenue: 'Sede Laureles',
  taglineLine1: 'DISCIPLINA',
  taglineLine2: 'TAMBIÉN ES',
  taglineLine3: 'BIENESTAR',

  greeting: 'Hola, Laura',
  upcomingTitle: 'Próximas clases',
  dailyLimitHint: 'Hasta 2 reservas por día.',

  dayToday: 'Hoy',
  dayTomorrow: 'Mañana',

  instructorFemale: 'INSTRUCTORA',
  instructorMale: 'INSTRUCTOR',

  seatsTemplate: '{occupied} de {total} cupos',

  bookAction: 'Reservar',
  cancelAction: 'Cancelar',
  reservedTag: 'Reservada',
} as const;

export type MessageKey = keyof typeof messages;

export function instructorEyebrow(gender: 'male' | 'female'): string {
  return gender === 'female' ? messages.instructorFemale : messages.instructorMale;
}

export function seatsLabel(occupied: number, total: number): string {
  return messages.seatsTemplate.replace('{occupied}', String(occupied)).replace('{total}', String(total));
}

export function dayLabel(diaOffset: 0 | 1 | 2 | number, date: Date): string {
  if (diaOffset === 0) return messages.dayToday;
  if (diaOffset === 1) return messages.dayTomorrow;
  return date.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}