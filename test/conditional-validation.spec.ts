import { Equals, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
import { Guard, Guarded } from '../src/index';
import { GuardedValidationError } from './../src/index';

describe('conditional validation', () => {
  it("shouldn't validate a property when the condition is false", () => {
    @Guarded
    class MyClass {
      @ValidateIf(_ => false)
      @IsNotEmpty()
      title!: string;
    }

    const model = new MyClass();

    expect(model).toBeInstanceOf(MyClass)
    expect(model.title).toBeUndefined()
  });

  it('should validate a property when the condition is true', () => {
    @Guarded
    class MyClass {
      @ValidateIf(o => true)
      @IsNotEmpty()
      title: string = '';
    }

    expect.assertions(7);

    try {
      new MyClass()
    } catch (error) {
      if (error instanceof GuardedValidationError) {
        expect(error.message).toBe('Validation failed');
        expect(error).toBeInstanceOf(GuardedValidationError)
        expect(error.errors.length).toEqual(1);
        expect(error.errors[0].target).toBeInstanceOf(MyClass);
        expect(error.errors[0].property).toEqual('title');
        expect(error.errors[0].constraints).toEqual({ isNotEmpty: 'title should not be empty' });
        expect(error.errors[0].value).toEqual('');
      }
    }
  });

  it('should pass the object being validated to the condition function', () => {
    expect.assertions(2);

    @Guarded
    class MyClass {
      @ValidateIf(o => {
        expect(o).toBeInstanceOf(MyClass);
        expect(o.title).toEqual('title');
        return true;
      })
      @IsNotEmpty()
      title: string = 'title';
    }

    new MyClass()
  });

  it('should validate a property when value is empty', () => {
    expect.assertions(6);

    @Guarded
    class MyClass {
      @IsOptional()
      @Equals('test')
      title: string = '';
    }

    try {
      new MyClass();
    } catch (error) {
      if (error instanceof GuardedValidationError) {
        expect(error.message).toBe('Validation failed');
        expect(error.errors.length).toEqual(1);
        expect(error.errors[0].target).toBeInstanceOf(MyClass);
        expect(error.errors[0].property).toEqual('title');
        expect(error.errors[0].constraints).toEqual({ equals: 'title must be equal to test' });
        expect(error.errors[0].value).toEqual('');
      }
    }
  });

  it('should validate a property when value is supplied with Guard sync creator', () => {
    class MyClass {
      @IsOptional()
      @Equals('test')
      title: string = 'bad_value';
    }

    try {
      Guard.createSync(MyClass);
    } catch (error) {
      if (error instanceof GuardedValidationError) {
        expect(error.message).toBe('Validation failed');
        expect(error.errors.length).toEqual(1);
        expect(error.errors[0].target).toBeInstanceOf(MyClass);
        expect(error.errors[0].property).toEqual('title');
        expect(error.errors[0].constraints).toEqual({ equals: 'title must be equal to test' });
        expect(error.errors[0].value).toEqual('bad_value');
      }
    }
  });

  it("shouldn't validate a property when the condition is false", () => {
    class MyClass {
      @ValidateIf(_ => false)
      @IsNotEmpty()
      title!: string;
    }

    const model = Guard.createSync(MyClass);

    expect(model).toBeInstanceOf(MyClass)
    expect(model.title).toBeUndefined()
  });

  it('should validate a property when the condition is true with Guard sync creator', () => {
    class MyClass {
      @ValidateIf(o => true)
      @IsNotEmpty()
      title: string = '';
    }

    expect.assertions(7);

    try {
      Guard.createSync(MyClass)
    } catch (error) {
      if (error instanceof GuardedValidationError) {
        expect(error.message).toBe('Validation failed');
        expect(error).toBeInstanceOf(GuardedValidationError)
        expect(error.errors.length).toEqual(1);
        expect(error.errors[0].target).toBeInstanceOf(MyClass);
        expect(error.errors[0].property).toEqual('title');
        expect(error.errors[0].constraints).toEqual({ isNotEmpty: 'title should not be empty' });
        expect(error.errors[0].value).toEqual('');
      }
    }
  });

  it('should pass the object being validated to the condition function with Guard sync creator', () => {
    expect.assertions(2);

    class MyClass {
      @ValidateIf(o => {
        expect(o).toBeInstanceOf(MyClass);
        expect(o.title).toEqual('title');
        return true;
      })
      @IsNotEmpty()
      title: string = 'title';
    }

    Guard.createSync(MyClass)
  });

  it('should validate a property when value is empty with Guard sync creator', () => {
    expect.assertions(6);

    class MyClass {
      @IsOptional()
      @Equals('test')
      title: string = '';
    }

    try {
      Guard.createSync(MyClass);
    } catch (error) {
      if (error instanceof GuardedValidationError) {
        expect(error.message).toBe('Validation failed');
        expect(error.errors.length).toEqual(1);
        expect(error.errors[0].target).toBeInstanceOf(MyClass);
        expect(error.errors[0].property).toEqual('title');
        expect(error.errors[0].constraints).toEqual({ equals: 'title must be equal to test' });
        expect(error.errors[0].value).toEqual('');
      }
    }
  });

  it('should validate a property when value is supplied with Guard sync creator', () => {
    class MyClass {
      @IsOptional()
      @Equals('test')
      title: string = 'bad_value';
    }

    try {
      Guard.createSync(MyClass);
    } catch (error) {
      if (error instanceof GuardedValidationError) {
        expect(error.message).toBe('Validation failed');
        expect(error.errors.length).toEqual(1);
        expect(error.errors[0].target).toBeInstanceOf(MyClass);
        expect(error.errors[0].property).toEqual('title');
        expect(error.errors[0].constraints).toEqual({ equals: 'title must be equal to test' });
        expect(error.errors[0].value).toEqual('bad_value');
      }
    }
  });
});
