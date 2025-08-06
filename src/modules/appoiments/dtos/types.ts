import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@ValidatorConstraint({ name: 'IsFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: string) {
    return new Date(date) > new Date();
  }

  defaultMessage() {
    return 'appointmentDate must be in the future';
  }
}
