import * as assert from 'assert';
import { Contains, MinLength } from 'class-validator';
import { Guard, Guarded } from '../src';
import { GuardedValidationError } from './../src/index';

describe('inherited validation', () => {
  it('should validate inherited properties', () => {
    expect.assertions(9);

    class MyClass {
      @Contains('hello')
      title: string;

      constructor(title: string) {
        this.title = title;
      }
    }

    @Guarded
    class MySubClass extends MyClass {
      @MinLength(5)
      name: string;

      constructor(title: string, name: string) {
        super(title)
        this.name = name;
      }
    }

    try {
      new MySubClass('helo world', 'my');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors.length).toEqual(2);

      // parent props are validated afterwards
      expect(error.errors[0].target).toBeInstanceOf(MySubClass);
      expect(error.errors[0].property).toEqual('title');
      expect(error.errors[0].constraints).toEqual({ contains: 'title must contain a hello string' });
      expect(error.errors[0].value).toEqual('helo world');

      // subclass own props are validated first
      expect(error.errors[1].target).toBeInstanceOf(MySubClass);
      expect(error.errors[1].property).toEqual('name');
      expect(error.errors[1].constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(error.errors[1].value).toEqual('my');
    }
  });
});

describe('inherited validation with sync Guard creator', () => {
  it('should validate inherited properties', () => {
    expect.assertions(9);

    class MyClass {
      @Contains('hello')
      title: string;

      constructor(title: string) {
        this.title = title;
      }
    }

    class MySubClass extends MyClass {
      @MinLength(5)
      name: string;

      constructor(title: string, name: string) {
        super(title)
        this.name = name;
      }
    }

    try {
      Guard.createSync(MySubClass, 'helo world', 'my');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors.length).toEqual(2);

      // subclass own props are validated first
      expect(error.errors[0].target).toBeInstanceOf(MySubClass);
      expect(error.errors[0].property).toEqual('name');
      expect(error.errors[0].constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(error.errors[0].value).toEqual('my');

      // parent props are validated afterwards
      expect(error.errors[1].target).toBeInstanceOf(MySubClass);
      expect(error.errors[1].property).toEqual('title');
      expect(error.errors[1].constraints).toEqual({ contains: 'title must contain a hello string' });
      expect(error.errors[1].value).toEqual('helo world');
    }
  });
});