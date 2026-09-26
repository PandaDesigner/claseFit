import type { AsyncStorageLike } from '@features/class-booking/infrastructure/persistence/AsyncStorageBookingRepository';
import { AsyncStorageBookingRepository } from '@features/class-booking/infrastructure/persistence/AsyncStorageBookingRepository';
import { InMemoryBookingRepository } from '@features/class-booking/infrastructure/persistence/InMemoryBookingRepository';
import { ZustandBookingStateAdapter } from '@features/class-booking/infrastructure/state/ZustandBookingStateAdapter';
import { InMemoryBookingStateAdapter } from '@features/class-booking/infrastructure/state/InMemoryBookingStateAdapter';
import { SystemClock } from '@features/class-booking/infrastructure/time/SystemClock';
import { FixedClock } from '@features/class-booking/infrastructure/time/FixedClock';
import { InitializeBookings } from '@features/class-booking/application/use-cases/InitializeBookings';
import { BookClass } from '@features/class-booking/application/use-cases/BookClass';
import { CancelBooking } from '@features/class-booking/application/use-cases/CancelBooking';
import { RefreshEligibilityOnForeground } from '@features/class-booking/application/use-cases/RefreshEligibilityOnForeground';
import { ListUpcomingSessions } from '@features/class-booking/application/queries/ListUpcomingSessions';
import { ListActiveBookings } from '@features/class-booking/application/queries/ListActiveBookings';
import { loadFixture } from '@features/class-booking/infrastructure/fixtures/Fixture';
import type { BookingRepository } from '@features/class-booking/application/ports/BookingRepository';
import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { Clock } from '@features/class-booking/application/ports/Clock';

export interface CompositionDeps {
  readonly repository: BookingRepository;
  readonly store: BookingStateStore;
  readonly clock: Clock;
  readonly storage?: AsyncStorageLike;
}

export interface Composition {
  readonly initializeBookings: InitializeBookings;
  readonly bookClass: BookClass;
  readonly cancelBooking: CancelBooking;
  readonly refreshEligibility: RefreshEligibilityOnForeground;
  readonly listUpcomingSessions: ListUpcomingSessions;
  readonly listActiveBookings: ListActiveBookings;
  readonly store: BookingStateStore;
  readonly repository: BookingRepository;
  readonly clock: Clock;
}

export function buildComposition(deps: CompositionDeps): Composition {
  const fixture = loadFixture();
  const listUpcomingSessions = new ListUpcomingSessions({ store: deps.store, clock: deps.clock });
  const listActiveBookings = new ListActiveBookings({ store: deps.store, clock: deps.clock });
  return {
    initializeBookings: new InitializeBookings({
      repository: deps.repository,
      store: deps.store,
      clock: deps.clock,
      fixture,
    }),
    bookClass: new BookClass({
      repository: deps.repository,
      store: deps.store,
      clock: deps.clock,
    }),
    cancelBooking: new CancelBooking({
      repository: deps.repository,
      store: deps.store,
      clock: deps.clock,
    }),
    refreshEligibility: new RefreshEligibilityOnForeground({
      repository: deps.repository,
      store: deps.store,
      clock: deps.clock,
    }),
    listUpcomingSessions,
    listActiveBookings,
    store: deps.store,
    repository: deps.repository,
    clock: deps.clock,
  };
}

export interface ProductionCompositionOptions {
  readonly storage: AsyncStorageLike;
}

export function buildProductionComposition(options: ProductionCompositionOptions): Composition {
  const repository = new AsyncStorageBookingRepository({ storage: options.storage });
  const store = new ZustandBookingStateAdapter();
  const clock = new SystemClock();
  return buildComposition({ repository, store, clock, storage: options.storage });
}

export interface TestCompositionOptions {
  readonly clock?: Clock;
}

export function buildTestComposition(options: TestCompositionOptions = {}): Composition {
  const repository = new InMemoryBookingRepository();
  const store = new InMemoryBookingStateAdapter();
  const clock = options.clock ?? new FixedClock(new Date('2026-03-02T13:00:00.000-05:00'));
  return buildComposition({ repository, store, clock });
}
