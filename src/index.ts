import { validate, validateSync, ValidationError } from 'class-validator';
import { isPromise } from 'util/types';

type Constructor = new (...args: any[]) => any;

export class GuardedValidationError extends Error {
  constructor(message: string, public readonly errors: ValidationError[]) {
    super(message)
  }
}

export function Guarded<TBase extends Constructor>(Base: TBase): void;
export function Guarded<TBase extends Constructor>(): (Base: TBase) => void;
export function Guarded<TBase extends Constructor>(Base?: TBase) {
  const generate = function (Base: TBase) {
    const c = class extends Base {
      public var = "override";

      constructor(...args: any[]) {
        super(...args)

        for (const arg of args) {
          if (isPromise(arg)) {
            return;
          }
        }

        const errors = validateSync(this);

        if (errors.length > 0) {
          throw new GuardedValidationError('Validation failed', errors)
        }
      }
    };

    Object.defineProperty(c, "name", { value: Base.name });

    return c;
  }

  return Base ? generate(Base) : generate;
}

export abstract class Guard {
  static async create(constructor: Constructor, ...args: any[]) {
    const o = new constructor(...args);
    const errors = await validate(o);
    if (errors.length > 0) {
      throw new GuardedValidationError('Validation failed', errors)
    }
    return o;
  }

  static createSync(constructor: Constructor, ...args: any[]) {
    const o = new constructor(...args);
    const errors = validateSync(o);
    if (errors.length > 0) {
      throw new GuardedValidationError('Validation failed', errors)
    }
    return o;
  }
}
