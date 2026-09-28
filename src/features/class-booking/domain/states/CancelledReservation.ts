export interface CancelledReservationProps {
  readonly id: string;
  readonly sessionId: string;
  readonly sessionStart: Date;
  readonly createdAt: Date;
  readonly cancelledAt: Date;
}

export class CancelledReservation {
  readonly id: string;
  readonly sessionId: string;
  readonly sessionStart: Date;
  readonly createdAt: Date;
  readonly cancelledAt: Date;
  readonly status: 'cancelled' = 'cancelled';

  constructor(props: CancelledReservationProps) {
    if (!props.id) {
      throw new Error('CancelledReservation id is required');
    }
    if (!props.sessionId) {
      throw new Error('CancelledReservation sessionId is required');
    }
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.sessionStart = props.sessionStart;
    this.createdAt = props.createdAt;
    this.cancelledAt = props.cancelledAt;
  }

  cancelAt(_cancelledAt: Date): never {
    throw new Error(`Reservation ${this.id} is already cancelled`);
  }

  isCancellable(): boolean {
    return false;
  }
}
