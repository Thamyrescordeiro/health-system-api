import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@ValidatorConstraint({ name: 'IsFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: string) {
    const ms = Date.parse(date);
    if (isNaN(ms)) return false;
    const SKEW_MS = 2 * 60 * 1000;
    return ms > Date.now() - SKEW_MS;
  }

  defaultMessage() {
    return 'appointmentDate must be in the future';
  }
}
