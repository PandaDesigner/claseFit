export interface ClassSessionProps {
  readonly id: string;
  readonly name: string;
  readonly instructor: string;
  readonly start: Date;
  readonly durationMinutes: number;
  readonly capacity: number;
  readonly occupiedByOthers: number;
}

export class ClassSession {
  readonly id: string;
  readonly name: string;
  readonly instructor: string;
  readonly start: Date;
  readonly durationMinutes: number;
  readonly capacity: number;
  readonly occupiedByOthers: number;

  constructor(props: ClassSessionProps) {
    if (props.capacity < 0) {
      throw new Error('ClassSession capacity cannot be negative');
    }
    if (props.occupiedByOthers < 0) {
      throw new Error('ClassSession occupiedByOthers cannot be negative');
    }
    if (props.occupiedByOthers > props.capacity) {
      throw new Error('ClassSession occupiedByOthers exceeds capacity');
    }
    if (props.durationMinutes <= 0) {
      throw new Error('ClassSession durationMinutes must be positive');
    }
    this.id = props.id;
    this.name = props.name;
    this.instructor = props.instructor;
    this.start = props.start;
    this.durationMinutes = props.durationMinutes;
    this.capacity = props.capacity;
    this.occupiedByOthers = props.occupiedByOthers;
  }

  available(activeMemberReservations: number): number {
    const remaining = this.capacity - this.occupiedByOthers - activeMemberReservations;
    return Math.max(0, remaining);
  }

  isFull(activeMemberReservations: number): boolean {
    return this.available(activeMemberReservations) === 0;
  }

  hasStartedAt(now: Date): boolean {
    return this.start.getTime() <= now.getTime();
  }
}
