import * as assert from 'assert';
import { Contains, IsDefined, MinLength, ValidateNested, ValidationTypes } from 'class-validator';
import { Guard, Guarded } from '../src';
import { GuardedValidationError } from './../src/index';

describe('nested validation', () => {
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

      @ValidateNested()
      @IsDefined()
      mySubClass?: MySubClass;

      constructor(title: string, mySubClass?: MySubClass) {
        this.title = title;
        this.mySubClass = mySubClass
      }
    }

    try {
      new MyClass('helo');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors[1].target).toBeInstanceOf(MyClass);
      expect(error.errors[1].value).toBeUndefined();
      expect(error.errors[1].property).toEqual('mySubClass');
      expect(error.errors[1].constraints).toEqual({ isDefined: 'mySubClass should not be null or undefined' });
    }
  });

  it('should validate nested objects', () => {
    expect.assertions(55);

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

      @ValidateNested()
      mySubClass: MySubClass;

      @ValidateNested()
      mySubClasses: MySubClass[];

      @ValidateNested()
      mySubSubClasses: MySubClass[][];

      @ValidateNested()
      mySubSubSubClasses: MySubClass[][][];

      constructor(props: {
        title: string,
        mySubClass: MySubClass,
        mySubClasses: MySubClass[],
        mySubSubClasses: MySubClass[][],
        mySubSubSubClasses: MySubClass[][][],
      }) {
        this.title = props.title;
        this.mySubClass = props.mySubClass;
        this.mySubClasses = props.mySubClasses;
        this.mySubSubClasses = props.mySubSubClasses;
        this.mySubSubSubClasses = props.mySubSubSubClasses;
      }
    }

    const mySubClass = new MySubClass('my')
    const mySubClasses = [new MySubClass('my'), new MySubClass('not-short')]
    const mySubSubClasses = [[new MySubClass('sub')]]
    const mySubSubSubClasses = [[[new MySubClass('sub')]]]
    try {
      new MyClass({
        title: 'helo world',
        mySubClass,
        mySubClasses,
        mySubSubClasses,
        mySubSubSubClasses
      });
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      assert(error.errors[0] !== undefined)
      assert(error.errors[1] !== undefined && error.errors[1].children !== undefined)
      assert(error.errors[2] !== undefined && error.errors[2].children !== undefined)
      assert(error.errors[3] !== undefined && error.errors[3].children !== undefined)
      assert(error.errors[4] !== undefined && error.errors[4].children !== undefined)
      expect(error.errors.length).toEqual(5);

      expect(error.errors[0].target).toBeInstanceOf(MyClass);
      expect(error.errors[0].property).toEqual('title');
      expect(error.errors[0].constraints).toEqual({ contains: 'title must contain a hello string' });
      expect(error.errors[0].value).toEqual('helo world');

      expect(error.errors[1].target).toBeInstanceOf(MyClass);
      expect(error.errors[1].property).toEqual('mySubClass');
      expect(error.errors[1].value).toEqual(mySubClass);
      expect(error.errors[1].constraints).toBeUndefined();
      assert(error.errors[1] !== undefined)
      assert(error.errors[1].children[0] !== undefined)
      const subError1 = error.errors[1].children[0];
      expect(subError1.target).toEqual(mySubClass);
      expect(subError1.property).toEqual('name');
      expect(subError1.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subError1.value).toEqual('my');

      expect(error.errors[2].target).toBeInstanceOf(MyClass);
      expect(error.errors[2].property).toEqual('mySubClasses');
      expect(error.errors[2].value).toEqual(mySubClasses);
      expect(error.errors[2].constraints).toBeUndefined();
      const subError2 = error.errors[2].children[0];
      expect(subError2.target).toEqual(mySubClasses);
      expect(subError2.value).toEqual(mySubClasses[0]);
      expect(subError2.property).toEqual('0');
      assert(subError2.children !== undefined)
      const subSubError = subError2.children[0];
      expect(subSubError.target).toEqual(mySubClasses[0]);
      expect(subSubError.property).toEqual('name');
      expect(subSubError.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subSubError.value).toEqual('my');

      expect(error.errors[3].target).toBeInstanceOf(MyClass);
      expect(error.errors[3].property).toEqual('mySubSubClasses');
      expect(error.errors[3].value).toEqual(mySubSubClasses);
      expect(error.errors[3].constraints).toBeUndefined();
      const subError3 = error.errors[3].children[0];
      expect(subError3.target).toEqual(mySubSubClasses);
      expect(subError3.value).toEqual(mySubSubClasses[0]);
      expect(subError3.property).toEqual('0');
      assert(subError3.children !== undefined)
      const subSubError3 = subError3.children[0];
      expect(subSubError3.target).toEqual(mySubSubClasses[0]);
      expect(subSubError3.value).toEqual(mySubSubClasses[0][0]);
      expect(subSubError3.property).toEqual('0');
      assert(subSubError3.children !== undefined)
      const subSubSubError3 = subSubError3.children[0];
      expect(subSubSubError3.target).toEqual(mySubSubClasses[0][0]);
      expect(subSubSubError3.property).toEqual('name');
      expect(subSubSubError3.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subSubSubError3.value).toEqual('sub');

      expect(error.errors[4].target).toBeInstanceOf(MyClass);
      expect(error.errors[4].property).toEqual('mySubSubSubClasses');
      expect(error.errors[4].value).toEqual(mySubSubSubClasses);
      expect(error.errors[4].constraints).toBeUndefined();
      const subError4 = error.errors[4].children[0];
      expect(subError4.target).toEqual(mySubSubSubClasses);
      expect(subError4.value).toEqual(mySubSubSubClasses[0]);
      expect(subError4.property).toEqual('0');
      assert(subError4.children !== undefined)
      const subSubError4 = subError4.children[0];
      expect(subSubError4.target).toEqual(mySubSubSubClasses[0]);
      expect(subSubError4.value).toEqual(mySubSubSubClasses[0][0]);
      expect(subSubError4.property).toEqual('0');
      assert(subSubError4.children !== undefined)
      const subSubSubError4 = subSubError4.children[0];
      expect(subSubSubError4.target).toEqual(mySubSubSubClasses[0][0]);
      expect(subSubSubError4.value).toEqual(mySubSubSubClasses[0][0][0]);
      expect(subSubSubError4.property).toEqual('0');
      assert(subSubSubError4.children !== undefined)
      const subSubSubSubError4 = subSubSubError4.children[0];
      expect(subSubSubSubError4.target).toEqual(mySubSubSubClasses[0][0][0]);
      expect(subSubSubSubError4.property).toEqual('name');
      expect(subSubSubSubError4.constraints).toEqual({
        minLength: 'name must be longer than or equal to 5 characters',
      });
      expect(subSubSubSubError4.value).toEqual('sub');
    }
  });

  it('should validate when nested is not object', () => {
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
      @ValidateNested()
      mySubClass: MySubClass;

      constructor(mySubClass: MySubClass) {
        this.mySubClass = mySubClass;
      }
    }

    try {
      new MyClass('invalidnested object' as any);
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

  it('should validate nested set', () => {
    expect.assertions(24);

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

      @ValidateNested()
      mySubClass: MySubClass;

      @ValidateNested()
      mySubClasses: Set<MySubClass>;

      constructor(title: string, mySubClass: MySubClass, mySubClasses: Set<MySubClass>) {
        this.title = title;
        this.mySubClass = mySubClass;
        this.mySubClasses = mySubClasses;
      }
    }

    const name = 'helo world'
    const submodel1 = new MySubClass('my');
    const submodel2 = new MySubClass('not-short');
    const mySubClass = new MySubClass('my');
    const mySubClasses = new Set([submodel1, submodel2])

    try {
      new MyClass(name, mySubClass, mySubClasses);
    } catch (error) {
      assert(error instanceof GuardedValidationError)

      expect(error.errors.length).toEqual(3);

      expect(error.errors[0].target).toBeInstanceOf(MyClass);
      expect(error.errors[0].property).toEqual('title');
      expect(error.errors[0].constraints).toEqual({ contains: 'title must contain a hello string' });
      expect(error.errors[0].value).toEqual('helo world');

      expect(error.errors[1].target).toBeInstanceOf(MyClass);
      expect(error.errors[1].property).toEqual('mySubClass');
      expect(error.errors[1].value).toEqual(mySubClass);
      expect(error.errors[1].constraints).toBeUndefined();
      assert(error.errors[1].children !== undefined)
      const subError1 = error.errors[1].children[0];
      expect(subError1.target).toEqual(mySubClass);
      expect(subError1.property).toEqual('name');
      expect(subError1.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subError1.value).toEqual('my');

      expect(error.errors[2].target).toBeInstanceOf(MyClass);
      expect(error.errors[2].property).toEqual('mySubClasses');
      expect(error.errors[2].value).toEqual(mySubClasses);
      expect(error.errors[2].constraints).toBeUndefined();
      assert(error.errors[2].children !== undefined)
      const subError2 = error.errors[2].children[0];
      expect(subError2.target).toEqual(mySubClasses);
      expect(subError2.value).toEqual(submodel1);
      expect(subError2.property).toEqual('0');
      assert(subError2.children !== undefined)
      const subSubError = subError2.children[0];
      expect(subSubError.target).toEqual(submodel1);
      expect(subSubError.property).toEqual('name');
      expect(subSubError.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subSubError.value).toEqual('my');
    }
  });

  it('should validate nested map', () => {
    expect.assertions(24);

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

      @ValidateNested()
      mySubClass: MySubClass;

      @ValidateNested()
      mySubClasses: Map<string, MySubClass>;

      constructor(title: string, mySubClass: MySubClass, mySubClasses: Map<string, MySubClass>) {
        this.title = title;
        this.mySubClass = mySubClass;
        this.mySubClasses = mySubClasses;
      }
    }

    const name = 'helo world';
    const mySubClass = new MySubClass('my');
    const submodel1 = new MySubClass('my');
    const submodel2 = new MySubClass('not-short');
    const mySubClasses = new Map();
    mySubClasses.set('key1', submodel1);
    mySubClasses.set('key2', submodel2);

    try {
      new MyClass(name, mySubClass, mySubClasses);
    } catch (error) {
      assert(error instanceof GuardedValidationError)

      expect(error.errors.length).toEqual(3);

      expect(error.errors[0].target).toBeInstanceOf(MyClass);
      expect(error.errors[0].property).toEqual('title');
      expect(error.errors[0].constraints).toEqual({ contains: 'title must contain a hello string' });
      expect(error.errors[0].value).toEqual(name);

      expect(error.errors[1].target).toBeInstanceOf(MyClass);
      expect(error.errors[1].property).toEqual('mySubClass');
      expect(error.errors[1].value).toEqual(mySubClass);
      expect(error.errors[1].constraints).toBeUndefined();
      assert(error.errors[1].children !== undefined)
      const subError1 = error.errors[1].children[0];
      expect(subError1.target).toEqual(mySubClass);
      expect(subError1.property).toEqual('name');
      expect(subError1.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subError1.value).toEqual('my');

      expect(error.errors[2].target).toBeInstanceOf(MyClass);
      expect(error.errors[2].property).toEqual('mySubClasses');
      expect(error.errors[2].value).toEqual(mySubClasses);
      expect(error.errors[2].constraints).toBeUndefined();
      assert(error.errors[2].children !== undefined)
      const subError2 = error.errors[2].children[0];
      expect(subError2.target).toEqual(mySubClasses);
      expect(subError2.value).toEqual(submodel1);
      expect(subError2.property).toEqual('key1');
      assert(subError2.children !== undefined)
      const subSubError = subError2.children[0];
      expect(subSubError.target).toEqual(submodel1);
      expect(subSubError.property).toEqual('name');
      expect(subSubError.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subSubError.value).toEqual('my');
    }
  });
});

describe('nested validation with sync Guard creator', () => {
  it('should not validate missing nested objects', () => {
    expect.assertions(4);

    class MySubClass {
      @MinLength(5)
      name: string;

      constructor(name: string) {
        this.name = name;
      }
    }

    class MyClass {
      @Contains('hello')
      title: string;

      @ValidateNested()
      @IsDefined()
      mySubClass?: MySubClass;

      constructor(title: string, mySubClass?: MySubClass) {
        this.title = title;
        this.mySubClass = mySubClass
      }
    }

    try {
      Guard.createSync(MyClass, 'helo');
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      expect(error.errors[1].target).toBeInstanceOf(MyClass);
      expect(error.errors[1].value).toBeUndefined();
      expect(error.errors[1].property).toEqual('mySubClass');
      expect(error.errors[1].constraints).toEqual({ isDefined: 'mySubClass should not be null or undefined' });
    }
  });

  it('should validate nested objects', () => {
    expect.assertions(55);

    class MySubClass {
      @MinLength(5)
      name: string;

      constructor(name: string) {
        this.name = name;
      }
    }

    class MyClass {
      @Contains('hello')
      title: string;

      @ValidateNested()
      mySubClass: MySubClass;

      @ValidateNested()
      mySubClasses: MySubClass[];

      @ValidateNested()
      mySubSubClasses: MySubClass[][];

      @ValidateNested()
      mySubSubSubClasses: MySubClass[][][];

      constructor(props: {
        title: string,
        mySubClass: MySubClass,
        mySubClasses: MySubClass[],
        mySubSubClasses: MySubClass[][],
        mySubSubSubClasses: MySubClass[][][],
      }) {
        this.title = props.title;
        this.mySubClass = props.mySubClass;
        this.mySubClasses = props.mySubClasses;
        this.mySubSubClasses = props.mySubSubClasses;
        this.mySubSubSubClasses = props.mySubSubSubClasses;
      }
    }

    const mySubClass = new MySubClass('my')
    const mySubClasses = [new MySubClass('my'), new MySubClass('not-short')]
    const mySubSubClasses = [[new MySubClass('sub')]]
    const mySubSubSubClasses = [[[new MySubClass('sub')]]]
    try {
      Guard.createSync(MyClass, {
        title: 'helo world',
        mySubClass,
        mySubClasses,
        mySubSubClasses,
        mySubSubSubClasses
      });
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      assert(error.errors[0] !== undefined)
      assert(error.errors[1] !== undefined && error.errors[1].children !== undefined)
      assert(error.errors[2] !== undefined && error.errors[2].children !== undefined)
      assert(error.errors[3] !== undefined && error.errors[3].children !== undefined)
      assert(error.errors[4] !== undefined && error.errors[4].children !== undefined)
      expect(error.errors.length).toEqual(5);

      expect(error.errors[0].target).toBeInstanceOf(MyClass);
      expect(error.errors[0].property).toEqual('title');
      expect(error.errors[0].constraints).toEqual({ contains: 'title must contain a hello string' });
      expect(error.errors[0].value).toEqual('helo world');

      expect(error.errors[1].target).toBeInstanceOf(MyClass);
      expect(error.errors[1].property).toEqual('mySubClass');
      expect(error.errors[1].value).toEqual(mySubClass);
      expect(error.errors[1].constraints).toBeUndefined();
      assert(error.errors[1] !== undefined)
      assert(error.errors[1].children[0] !== undefined)
      const subError1 = error.errors[1].children[0];
      expect(subError1.target).toEqual(mySubClass);
      expect(subError1.property).toEqual('name');
      expect(subError1.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subError1.value).toEqual('my');

      expect(error.errors[2].target).toBeInstanceOf(MyClass);
      expect(error.errors[2].property).toEqual('mySubClasses');
      expect(error.errors[2].value).toEqual(mySubClasses);
      expect(error.errors[2].constraints).toBeUndefined();
      const subError2 = error.errors[2].children[0];
      expect(subError2.target).toEqual(mySubClasses);
      expect(subError2.value).toEqual(mySubClasses[0]);
      expect(subError2.property).toEqual('0');
      assert(subError2.children !== undefined)
      const subSubError = subError2.children[0];
      expect(subSubError.target).toEqual(mySubClasses[0]);
      expect(subSubError.property).toEqual('name');
      expect(subSubError.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subSubError.value).toEqual('my');

      expect(error.errors[3].target).toBeInstanceOf(MyClass);
      expect(error.errors[3].property).toEqual('mySubSubClasses');
      expect(error.errors[3].value).toEqual(mySubSubClasses);
      expect(error.errors[3].constraints).toBeUndefined();
      const subError3 = error.errors[3].children[0];
      expect(subError3.target).toEqual(mySubSubClasses);
      expect(subError3.value).toEqual(mySubSubClasses[0]);
      expect(subError3.property).toEqual('0');
      assert(subError3.children !== undefined)
      const subSubError3 = subError3.children[0];
      expect(subSubError3.target).toEqual(mySubSubClasses[0]);
      expect(subSubError3.value).toEqual(mySubSubClasses[0][0]);
      expect(subSubError3.property).toEqual('0');
      assert(subSubError3.children !== undefined)
      const subSubSubError3 = subSubError3.children[0];
      expect(subSubSubError3.target).toEqual(mySubSubClasses[0][0]);
      expect(subSubSubError3.property).toEqual('name');
      expect(subSubSubError3.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subSubSubError3.value).toEqual('sub');

      expect(error.errors[4].target).toBeInstanceOf(MyClass);
      expect(error.errors[4].property).toEqual('mySubSubSubClasses');
      expect(error.errors[4].value).toEqual(mySubSubSubClasses);
      expect(error.errors[4].constraints).toBeUndefined();
      const subError4 = error.errors[4].children[0];
      expect(subError4.target).toEqual(mySubSubSubClasses);
      expect(subError4.value).toEqual(mySubSubSubClasses[0]);
      expect(subError4.property).toEqual('0');
      assert(subError4.children !== undefined)
      const subSubError4 = subError4.children[0];
      expect(subSubError4.target).toEqual(mySubSubSubClasses[0]);
      expect(subSubError4.value).toEqual(mySubSubSubClasses[0][0]);
      expect(subSubError4.property).toEqual('0');
      assert(subSubError4.children !== undefined)
      const subSubSubError4 = subSubError4.children[0];
      expect(subSubSubError4.target).toEqual(mySubSubSubClasses[0][0]);
      expect(subSubSubError4.value).toEqual(mySubSubSubClasses[0][0][0]);
      expect(subSubSubError4.property).toEqual('0');
      assert(subSubSubError4.children !== undefined)
      const subSubSubSubError4 = subSubSubError4.children[0];
      expect(subSubSubSubError4.target).toEqual(mySubSubSubClasses[0][0][0]);
      expect(subSubSubSubError4.property).toEqual('name');
      expect(subSubSubSubError4.constraints).toEqual({
        minLength: 'name must be longer than or equal to 5 characters',
      });
      expect(subSubSubSubError4.value).toEqual('sub');
    }
  });

  it('should validate when nested is not object', () => {
    expect.assertions(4);

    class MySubClass {
      @MinLength(5)
      name: string;

      constructor(name: string) {
        this.name = name;
      }
    }

    class MyClass {
      @ValidateNested()
      mySubClass: MySubClass;

      constructor(mySubClass: MySubClass) {
        this.mySubClass = mySubClass;
      }
    }

    try {
      Guard.createSync(MyClass, 'invalidnested object' as any);
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

  it('should validate nested set', () => {
    expect.assertions(24);

    class MySubClass {
      @MinLength(5)
      name: string;

      constructor(name: string) {
        this.name = name;
      }
    }


    class MyClass {
      @Contains('hello')
      title: string;

      @ValidateNested()
      mySubClass: MySubClass;

      @ValidateNested()
      mySubClasses: Set<MySubClass>;

      constructor(title: string, mySubClass: MySubClass, mySubClasses: Set<MySubClass>) {
        this.title = title;
        this.mySubClass = mySubClass;
        this.mySubClasses = mySubClasses;
      }
    }

    const name = 'helo world'
    const submodel1 = new MySubClass('my');
    const submodel2 = new MySubClass('not-short');
    const mySubClass = new MySubClass('my');
    const mySubClasses = new Set([submodel1, submodel2])

    try {
      Guard.createSync(MyClass, name, mySubClass, mySubClasses);
    } catch (error) {
      assert(error instanceof GuardedValidationError)

      expect(error.errors.length).toEqual(3);

      expect(error.errors[0].target).toBeInstanceOf(MyClass);
      expect(error.errors[0].property).toEqual('title');
      expect(error.errors[0].constraints).toEqual({ contains: 'title must contain a hello string' });
      expect(error.errors[0].value).toEqual('helo world');

      expect(error.errors[1].target).toBeInstanceOf(MyClass);
      expect(error.errors[1].property).toEqual('mySubClass');
      expect(error.errors[1].value).toEqual(mySubClass);
      expect(error.errors[1].constraints).toBeUndefined();
      assert(error.errors[1].children !== undefined)
      const subError1 = error.errors[1].children[0];
      expect(subError1.target).toEqual(mySubClass);
      expect(subError1.property).toEqual('name');
      expect(subError1.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subError1.value).toEqual('my');

      expect(error.errors[2].target).toBeInstanceOf(MyClass);
      expect(error.errors[2].property).toEqual('mySubClasses');
      expect(error.errors[2].value).toEqual(mySubClasses);
      expect(error.errors[2].constraints).toBeUndefined();
      assert(error.errors[2].children !== undefined)
      const subError2 = error.errors[2].children[0];
      expect(subError2.target).toEqual(mySubClasses);
      expect(subError2.value).toEqual(submodel1);
      expect(subError2.property).toEqual('0');
      assert(subError2.children !== undefined)
      const subSubError = subError2.children[0];
      expect(subSubError.target).toEqual(submodel1);
      expect(subSubError.property).toEqual('name');
      expect(subSubError.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subSubError.value).toEqual('my');
    }
  });

  it('should validate nested map', () => {
    expect.assertions(24);

    class MySubClass {
      @MinLength(5)
      name: string;

      constructor(name: string) {
        this.name = name;
      }
    }


    class MyClass {
      @Contains('hello')
      title: string;

      @ValidateNested()
      mySubClass: MySubClass;

      @ValidateNested()
      mySubClasses: Map<string, MySubClass>;

      constructor(title: string, mySubClass: MySubClass, mySubClasses: Map<string, MySubClass>) {
        this.title = title;
        this.mySubClass = mySubClass;
        this.mySubClasses = mySubClasses;
      }
    }

    const name = 'helo world';
    const mySubClass = new MySubClass('my');
    const submodel1 = new MySubClass('my');
    const submodel2 = new MySubClass('not-short');
    const mySubClasses = new Map();
    mySubClasses.set('key1', submodel1);
    mySubClasses.set('key2', submodel2);

    try {
      Guard.createSync(MyClass, name, mySubClass, mySubClasses);
    } catch (error) {
      assert(error instanceof GuardedValidationError)

      expect(error.errors.length).toEqual(3);

      expect(error.errors[0].target).toBeInstanceOf(MyClass);
      expect(error.errors[0].property).toEqual('title');
      expect(error.errors[0].constraints).toEqual({ contains: 'title must contain a hello string' });
      expect(error.errors[0].value).toEqual(name);

      expect(error.errors[1].target).toBeInstanceOf(MyClass);
      expect(error.errors[1].property).toEqual('mySubClass');
      expect(error.errors[1].value).toEqual(mySubClass);
      expect(error.errors[1].constraints).toBeUndefined();
      assert(error.errors[1].children !== undefined)
      const subError1 = error.errors[1].children[0];
      expect(subError1.target).toEqual(mySubClass);
      expect(subError1.property).toEqual('name');
      expect(subError1.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subError1.value).toEqual('my');

      expect(error.errors[2].target).toBeInstanceOf(MyClass);
      expect(error.errors[2].property).toEqual('mySubClasses');
      expect(error.errors[2].value).toEqual(mySubClasses);
      expect(error.errors[2].constraints).toBeUndefined();
      assert(error.errors[2].children !== undefined)
      const subError2 = error.errors[2].children[0];
      expect(subError2.target).toEqual(mySubClasses);
      expect(subError2.value).toEqual(submodel1);
      expect(subError2.property).toEqual('key1');
      assert(subError2.children !== undefined)
      const subSubError = subError2.children[0];
      expect(subSubError.target).toEqual(submodel1);
      expect(subSubError.property).toEqual('name');
      expect(subSubError.constraints).toEqual({ minLength: 'name must be longer than or equal to 5 characters' });
      expect(subSubError.value).toEqual('my');
    }
  });
});