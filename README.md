# class-validator-guard

**Deprecated and no longer maintained.** Existing npm versions remain available. For new code, use [class-validator](https://github.com/typestack/class-validator) directly.

This project added `@Guarded`, `Guard.create` and `Guard.createSync` around class-validator. It is being retired to reduce the maintenance cost of a separate decorator wrapper. There is no further feature or compatibility roadmap.

## Migrate existing code

Keep your validation decorators and move validation to an explicit creation boundary. Validate the constructed class instance; assigning plain JSON to a TypeScript type does not create an instance.

For asynchronous validation:

```typescript
import { validate } from 'class-validator';

async function createValidated<T extends object>(
  construct: () => T,
): Promise<T> {
  const value = construct();
  const errors = await validate(value);
  if (errors.length > 0) {
    throw new Error('Validation failed');
  }
  return value;
}

// Replace Guard.create(Customer, props) with:
// const customer = await createValidated(() => new Customer(props));
```

For synchronous validation, call `validateSync(instance)` and inspect the returned errors. It intentionally ignores asynchronous validators, so use `validate` if your constraints are asynchronous.

When removing `@Guarded`, ensure every construction path that requires validation passes through your explicit boundary. Validate after construction and before returning or using the instance.

The example throws a plain Error. If callers depend on `GuardedValidationError`, its `errors` property or `instanceof` checks, retain an application-owned compatibility error and migrate callers deliberately. Preserve nested validation, custom constraints and validation timing with consumer tests before removing this dependency.

The last npm release uses `class-validator ^0.13.2`. Upgrade class-validator separately using its upstream migration notes; changing the wrapper and validator version together is not guaranteed to preserve behavior.

## Distribution

Versions 0.1.0, 0.2.0, 0.3.0 and 0.3.1 are retained for existing consumers. Deprecation is a maintenance notice; no package versions or repository history are being removed.

## License

[MIT](LICENSE).
