import { CancelledReservation } from './CancelledReservation';

export type CancellableReservation = ActiveReservation | CancelledReservation;

export interface ActiveReservationProps {
  readonly id: string;
  readonly sessionId: string;
  readonly sessionStart: Date;
  readonly createdAt: Date;
}

export class ActiveReservation {
  readonly id: string;
  readonly sessionId: string;
  readonly sessionStart: Date;
  readonly createdAt: Date;
  readonly status: 'active' = 'active';
  readonly cancelledAt: undefined = undefined;

  constructor(props: ActiveReservationProps) {
    if (!props.id) {
      throw new Error('ActiveReservation id is required');
    }
    if (!props.sessionId) {
      throw new Error('ActiveReservation sessionId is required');
    }
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.sessionStart = props.sessionStart;
    this.createdAt = props.createdAt;
  }

  cancelAt(cancelledAt: Date): CancelledReservation {
    return new CancelledReservation({
      id: this.id,
      sessionId: this.sessionId,
      sessionStart: this.sessionStart,
      createdAt: this.createdAt,
      cancelledAt,
    });
  }

  isCancellable(): boolean {
    return true;
  }
}
