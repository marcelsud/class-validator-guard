import * as assert from 'assert';
import { Contains, IsDefined, MinLength, ValidateNested, ValidatePromise, ValidationTypes } from 'class-validator';
import { Guard, Guarded } from '../src';
import { GuardedValidationError } from './../src/index';

describe('promise validation', () => {
  it('should not validate missing nested objects', () => {
    expect.assertions(4);

    class MySubClass {
      @MinLength(5)
      name: string;

      constructor(name: string) {
        this.name = name;
      }
    }

    @Guarded
    class MyClass {
      @Contains('hello')
      title: string;

      @ValidatePromise()
      @ValidateNested()
      @IsDefined()
      mySubClass?: Promise<MySubClass>;

      constructor(title: string, mySubClass?: Promise<MySubClass>) {
        this.title = title;
        this.mySubClass = mySubClass;
      }
    }

    try {
      new MyClass('helo')
    } catch (error) {
      assert(error instanceof GuardedValidationError)

      expect(error.errors[1].target).toBeInstanceOf(MyClass);
      expect(error.errors[1].value).toBeUndefined();
      expect(error.errors[1].property).toEqual('mySubClass');
      expect(error.errors[1].constraints).toEqual({ isDefined: 'mySubClass should not be null or undefined' });
    }
  });

  it('should validate nested objects', async () => {
    expect.assertions(24);

    class MySubClass {
      @MinLength(5)
      name!: string;

      constructor(name: string) {
        this.name = name;
      }
    }

    class MyClass {
      @Contains('hello')
      title: string;

      @ValidatePromise()
      @ValidateNested()
      mySubClass?: Promise<MySubClass>;

      @ValidatePromise()
      @ValidateNested()
      mySubClasses?: Promise<MySubClass[]>;

      constructor(title: string, mySubClass?: Promise<MySubClass>, mySubClasses?: Promise<MySubClass[]>) {
        this.title = title;
        this.mySubClass = mySubClass;
        this.mySubClasses = mySubClasses;
      }
    }

    const mySubClass = Promise.resolve(new MySubClass('my'));
    const mySubClasses = Promise.resolve([new MySubClass('my'), new MySubClass('not-short')]);

    try {
      await Guard.create(MyClass, 'helo world', mySubClass, mySubClasses)
    } catch (error) {
      return Promise.all([mySubClass, mySubClasses]).then(([modelMySubClass, modelMySubClasses]) => {
        assert(error instanceof GuardedValidationError)
        assert(modelMySubClasses !== undefined)
        expect(error.errors.length).toEqual(3);

        expect(error.errors[0].target).toBeInstanceOf(MyClass);
        expect(error.errors[0].property).toEqual('title');
        expect(error.errors[0].constraints).toEqual({ contains: 'title must contain a hello string' });
        expect(error.errors[0].value).toEqual('helo world');

        expect(error.errors[1].target).toBeInstanceOf(MyClass);
        expect(error.errors[1].property).toEqual('mySubClass');
        expect(error.errors[1].value).toEqual(modelMySubClass);
        expect(error.errors[1].constraints).toBeUndefined();
        assert(error.errors[1].children !== undefined)
        const subError1 = error.errors[1].children[0];
        expect(subError1.target).toEqual(modelMySubClass);
        expect(subError1.property).toEqual('name');
        expect(subError1.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
        expect(subError1.value).toEqual('my');

        expect(error.errors[2].target).toBeInstanceOf(MyClass);
        expect(error.errors[2].property).toEqual('mySubClasses');
        expect(error.errors[2].value).toEqual(modelMySubClasses);
        expect(error.errors[2].constraints).toBeUndefined();
        assert(error.errors[2].children !== undefined)
        const subError2 = error.errors[2].children[0];
        expect(subError2.target).toEqual(modelMySubClasses);
        expect(subError2.value).toEqual(modelMySubClasses[0]);
        expect(subError2.property).toEqual('0');
        assert(subError2.children !== undefined)
        const subSubError = subError2.children[0];
        expect(subSubError.target).toEqual(modelMySubClasses[0]);
        expect(subSubError.property).toEqual('name');
        expect(subSubError.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
        expect(subSubError.value).toEqual('my');
      });
    }
  });

  it('should validate when nested is not object', async () => {
    expect.assertions(4);

    class MySubClass {
      @MinLength(5)
      name: string;

      constructor(name: string) {
        this.name = name;
      }
    }

    class MyClass {
      @ValidatePromise()
      @ValidateNested()
      mySubClass: MySubClass;

      constructor(mySubClass: MySubClass) {
        this.mySubClass = mySubClass;
      }
    }

    try {
      await Guard.create(MyClass, 'invalidnested object' as any)
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors[0].target).toBeInstanceOf(MyClass);
      expect(error.errors[0].property).toEqual('mySubClass');
      assert(error.errors[0].children !== undefined)
      expect(error.errors[0].children.length).toEqual(1);

      const subError = error.errors[0].children[0];
      expect(subError.constraints).toEqual({
        [ValidationTypes.NESTED_VALIDATION]: 'nested property mySubClass must be either object or array',
      });
    }
  });

  it('should validate array promise', async () => {
    expect.assertions(5);

    class MyClass {
      @ValidatePromise()
      @MinLength(2)
      arrProperty: Promise<string[]>;

      constructor(arrProperty: Promise<string[]>) {
        this.arrProperty = arrProperty;
      }
    }

    const arrProperty = Promise.resolve(['one'])

    try {
      await Guard.create(MyClass, arrProperty)
    } catch (error) {
      return Promise.all([arrProperty]).then(([modelArrProperty]) => {
        assert(error instanceof GuardedValidationError)
        expect(error.errors.length).toEqual(1);

        expect(error.errors[0].target).toBeInstanceOf(MyClass);
        expect(error.errors[0].property).toEqual('arrProperty');
        expect(error.errors[0].constraints).toEqual({
          minLength: 'arrProperty must be longer than or equal to 2 characters',
        });
        expect(error.errors[0].value).toEqual(modelArrProperty);
      });
    }
  });
});
