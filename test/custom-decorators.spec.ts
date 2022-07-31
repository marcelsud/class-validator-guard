import * as assert from 'assert';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions, ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Guarded } from '../src';
import { GuardedValidationError } from './../src/';

function IsLongerThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      name: 'isLongerThan',
      validator: {
        validate(value: any, args: ValidationArguments): Promise<boolean> | boolean {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (relatedValue === undefined || relatedValue === null) {
            return true;
          }

          const result =
            typeof value === 'string' && typeof relatedValue === 'string' && value.length > relatedValue.length;

          const asPromise = validationOptions && validationOptions.context && validationOptions.context.promise;

          return asPromise ? Promise.resolve(result) : result;
        },
      },
    });
  };
}

function IsLonger(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      name: 'isLonger',
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (relatedValue === undefined || relatedValue === null) return true;

          return typeof value === 'string' && typeof relatedValue === 'string' && value.length > relatedValue.length;
        },
        defaultMessage(args: ValidationArguments): string {
          return args.property + ' must be longer then ' + args.constraints[0];
        },
      },
    });
  };
}

@ValidatorConstraint({ name: 'isShortenThan' })
class IsShortenThanConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    if (value === null || value === undefined) return true;

    return typeof value === 'string' && typeof relatedValue === 'string' && value.length < relatedValue.length;
  }
}

function IsShorterThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsShortenThanConstraint,
    });
  };
}

@Guarded
class SecondClass {
  @IsLonger('lastName')
  firstName!: string;
  lastName!: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

@Guarded
class MyLongerClass {
  @IsLongerThan('lastName', {
    context: { foo: 'bar' },
    message: '$property must be longer then $constraint1. Given value: $value',
  })
  firstName!: string;
  lastName!: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

@Guarded
class MyShorterClass {
  firstName: string;

  @IsShorterThan('firstName', {
    message: '$property must be shorter then $constraint1. Given value: $value',
  })
  lastName: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

describe('decorator with inline validation', () => {
  it('if firstName is not empty and lastLame is empty then it should succeed', () => {
    expect.assertions(2);
    const model = new MyShorterClass('hell no world', '');
    expect(model.firstName).toBe('hell no world')
    expect(model.lastName).toBe('')
  });

  it('if firstName is empty and lastLame is not empty then it should fail', () => {
    try {
      expect.assertions(3);
      new MyLongerClass('', 'Kim');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.message).toBe('Validation failed');
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].constraints).toEqual({ isLongerThan: 'firstName must be longer then lastName. Given value: ' });
    }
  });

  it('if firstName is shorter then lastLame then it should fail', () => {
    try {
      expect.assertions(3);
      new MyLongerClass('Li', 'Kim');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.message).toBe('Validation failed');
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].constraints).toEqual({
        isLongerThan: 'firstName must be longer then lastName. Given value: Li',
      });
    }
  });

  it('should include context', () => {
    expect.assertions(4);

    try {
      new MyLongerClass('Paul', 'Walker');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].contexts).toEqual({ isLongerThan: { foo: 'bar' } });
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].contexts).toHaveProperty('isLongerThan.foo', 'bar');
    }
  });
});

describe('decorator with default message', () => {
  it('if firstName is not empty and lastLame is empty then it should succeed', () => {
    expect.assertions(1);
    const model = new SecondClass('hell no world', '');
    expect(model.firstName).toBe('hell no world')
  });

  it('if firstName is empty and lastLame is not empty then it should fail', () => {
    expect.assertions(2);
    try {
      new SecondClass('', 'Kim');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].constraints).toEqual({ isLonger: 'firstName must be longer then lastName' });
    }
  });

  it('if firstName is shorter then lastLame then it should fail', () => {
    expect.assertions(2);
    try {
      new SecondClass('Li', 'Kim');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].constraints).toEqual({ isLonger: 'firstName must be longer then lastName' });
    }
  });
});

describe('decorator with separate validation constraint class', () => {
  it('if firstName is not empty and lastLame is empty then it should succeed', () => {
    expect.assertions(2);
    const model = new MyLongerClass('hell no world', '');
    expect(model.firstName).toBe('hell no world')
    expect(model.lastName).toBe('')
  });

  it('if firstName is empty and lastLame is not empty then it should fail', () => {
    expect.assertions(2);
    try {
      new MyShorterClass('', 'Kim');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].constraints).toEqual({
        isShortenThan: 'lastName must be shorter then firstName. Given value: Kim',
      });
    }
  });

  it('if firstName is shorter then lastLame then it should fail', () => {
    expect.assertions(2);
    try {
      new MyShorterClass('Li', 'Kim');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].constraints).toEqual({
        isShortenThan: 'lastName must be shorter then firstName. Given value: Kim',
      });
    }
  });
});
