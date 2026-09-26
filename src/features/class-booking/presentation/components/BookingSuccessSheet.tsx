import { type ReactNode } from 'react';
import {
  SuccessSheet,
  type SuccessSheetProps,
} from '@shared/ui/components/SuccessSheet';
import { messages } from '@features/class-booking/presentation/copy/messages';

export interface BookingSuccessSheetProps
  extends Omit<SuccessSheetProps, 'children'> {
  readonly children?: ReactNode;
}

/**
 * Booking-specific success modal. Wraps the shared `SuccessSheet` with
 * the booking copy from the PRD (FR-05: "¡Listo! Tu cupo está reservado").
 */
export function BookingSuccessSheet(props: BookingSuccessSheetProps) {
  const { children, ...rest } = props;
  return (
    <SuccessSheet.Root {...rest}>
      {children ?? (
        <>
          <SuccessSheet.Title>{messages.successTitle}</SuccessSheet.Title>
          <SuccessSheet.Message>{messages.successDefaultMessage}</SuccessSheet.Message>
          <SuccessSheet.Actions ctaLabel={messages.successCta} />
        </>
      )}
    </SuccessSheet.Root>
  );
}