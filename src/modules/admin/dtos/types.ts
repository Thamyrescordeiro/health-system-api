import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { isValid } from '@fnando/cpf';

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCPF',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && isValid(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}  must be a valid CPF number`;
        },
      },
    });
  };
}
