import * as assert from 'assert';
import { IsOptional, IsString, IsUrl, MinLength, ValidateNested } from 'class-validator';
import { Guard, Guarded } from '../src';
import { GuardedValidationError } from './../src/index';

/**
 * TODO: needs to split these test into
 *   - testing basic toString
 *   - testing nested objects
 *   - testing arrays
 *   - testing color codes?
 */
describe('ValidationError', () => {
  it('should correctly log error message without ANSI escape codes with Guard creator', async () => {
    class NestedClass {
      @IsString()
      public name: string;

      @IsUrl()
      public url: string;

      @IsOptional()
      @ValidateNested()
      public insideNested?: NestedClass;

      constructor(url: string, name: any, insideNested?: NestedClass) {
        this.url = url;
        this.name = name;
        this.insideNested = insideNested;
      }
    }

    class RootClass {
      @IsString()
      @MinLength(15)
      public title: string;

      @ValidateNested()
      public nestedObj: NestedClass;

      @ValidateNested({ each: true })
      public nestedArr: NestedClass[];

      constructor() {
        this.title = 5 as any;
        this.nestedObj = new NestedClass('invalid-url', 5, new NestedClass('invalid-url', 5));
        this.nestedArr = [new NestedClass('invalid-url', 5), new NestedClass('invalid-url', 5)];
      }
    }

    try {
      await Guard.create(RootClass);
    } catch (error) {
      assert(error instanceof GuardedValidationError)

      expect(error.errors[0].toString()).toEqual(
        'An instance of RootClass has failed the validation:\n' +
        ' - property title has failed the following constraints: minLength, isString \n'
      );
      expect(error.errors[1].toString()).toEqual(
        'An instance of RootClass has failed the validation:\n' +
        ' - property nestedObj.name has failed the following constraints: isString \n' +
        ' - property nestedObj.url has failed the following constraints: isUrl \n' +
        ' - property nestedObj.insideNested.name has failed the following constraints: isString \n' +
        ' - property nestedObj.insideNested.url has failed the following constraints: isUrl \n'
      );
      expect(error.errors[2].toString()).toEqual(
        'An instance of RootClass has failed the validation:\n' +
        ' - property nestedArr[0].name has failed the following constraints: isString \n' +
        ' - property nestedArr[0].url has failed the following constraints: isUrl \n' +
        ' - property nestedArr[1].name has failed the following constraints: isString \n' +
        ' - property nestedArr[1].url has failed the following constraints: isUrl \n'
      );
    }


  });

  it('should correctly log error message without ANSI escape codes with decorator', async () => {
    class NestedClass {
      @IsString()
      public name: string;

      @IsUrl()
      public url: string;

      @IsOptional()
      @ValidateNested()
      public insideNested?: NestedClass;

      constructor(url: string, name: any, insideNested?: NestedClass) {
        this.url = url;
        this.name = name;
        this.insideNested = insideNested;
      }
    }

    @Guarded
    class RootClass {
      @IsString()
      @MinLength(15)
      public title: string;

      @ValidateNested()
      public nestedObj: NestedClass;

      @ValidateNested({ each: true })
      public nestedArr: NestedClass[];

      constructor() {
        this.title = 5 as any;
        this.nestedObj = new NestedClass('invalid-url', 5, new NestedClass('invalid-url', 5));
        this.nestedArr = [new NestedClass('invalid-url', 5), new NestedClass('invalid-url', 5)];
      }
    }

    try {
      new RootClass();
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      assert(error.errors[0].target !== undefined)
      expect(error.errors[0].toString()).toEqual(
        'An instance of RootClass has failed the validation:\n' +
        ' - property title has failed the following constraints: minLength, isString \n'
      );
      expect(error.errors[1].toString()).toEqual(
        'An instance of RootClass has failed the validation:\n' +
        ' - property nestedObj.name has failed the following constraints: isString \n' +
        ' - property nestedObj.url has failed the following constraints: isUrl \n' +
        ' - property nestedObj.insideNested.name has failed the following constraints: isString \n' +
        ' - property nestedObj.insideNested.url has failed the following constraints: isUrl \n'
      );
      expect(error.errors[2].toString()).toEqual(
        'An instance of RootClass has failed the validation:\n' +
        ' - property nestedArr[0].name has failed the following constraints: isString \n' +
        ' - property nestedArr[0].url has failed the following constraints: isUrl \n' +
        ' - property nestedArr[1].name has failed the following constraints: isString \n' +
        ' - property nestedArr[1].url has failed the following constraints: isUrl \n'
      );
    }


  });
});
