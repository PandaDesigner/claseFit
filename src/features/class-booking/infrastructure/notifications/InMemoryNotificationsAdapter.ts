import type { NotificationsService } from '@features/class-booking/application/ports/NotificationsService';

export interface ScheduledNotification {
  readonly title: string;
  readonly body: string;
  readonly identifier: string;
}

export class InMemoryNotificationsAdapter implements NotificationsService {
  private granted = false;
  private readonly log: ScheduledNotification[] = [];

  async requestPermissions(): Promise<boolean> {
    this.granted = true;
    return true;
  }

  async scheduleBookingSuccess(): Promise<void> {
    this.log.push({
      title: 'ClaseFit',
      body: '¡Listo! Tu cupo está reservado',
      identifier: 'booking-success',
    });
  }

  async scheduleCancellationSuccess(message: string): Promise<void> {
    this.log.push({
      title: 'ClaseFit',
      body: message,
      identifier: 'cancel-success',
    });
  }

  // Test-only inspection API.
  getScheduled(): readonly ScheduledNotification[] {
    return this.log;
  }
  clearLog(): void {
    this.log.length = 0;
  }
  isGranted(): boolean {
    return this.granted;
  }
}
