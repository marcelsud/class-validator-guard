import * as assert from 'assert';
import { IsArray, IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { Guarded } from '../src';
import { GuardedValidationError } from './../src/index';

@Guarded
class CustomerDTO {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsDate()
  createdAt: Date;

  @IsBoolean()
  active: boolean

  @IsArray()
  roles: string[]

  constructor(props: {
    name: string,
    age: number,
    roles: string[],
    createdAt: Date,
    active: boolean
  }) {
    this.name = props.name;
    this.age = props.age;
    this.roles = props.roles;
    this.active = props.active;
    this.createdAt = props.createdAt;
  }
}

describe('DTO validation', () => {
  it('should validate a simple DTO - string', () => {
    expect.assertions(1)
    try {
      new CustomerDTO({
        name: 123 as any,
        age: 23,
        roles: [],
        createdAt: new Date(),
        active: true
      })
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      assert(error.errors[0].constraints !== undefined)
      expect(error.errors[0].constraints.isString).toBe('name must be a string')
    }
  })

  it('should validate a simple DTO - number', () => {
    expect.assertions(1)
    try {
      new CustomerDTO({
        name: 'John Doe',
        age: '23' as any,
        roles: [],
        createdAt: new Date(),
        active: true
      })
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      assert(error.errors[0].constraints !== undefined)
      expect(error.errors[0].constraints.isNumber).toBe('age must be a number conforming to the specified constraints')
    }
  })

  it('should validate a simple DTO - array', () => {
    expect.assertions(1)
    try {
      new CustomerDTO({
        name: 'John Doe',
        age: 23,
        roles: 'abc' as any,
        createdAt: new Date(),
        active: true
      })
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      assert(error.errors[0].constraints !== undefined)
      expect(error.errors[0].constraints.isArray).toBe('roles must be an array')
    }
  })

  it('should validate a simple DTO - date', () => {
    expect.assertions(1)
    try {
      new CustomerDTO({
        name: 'John Doe',
        age: 23,
        roles: [],
        createdAt: 'abc' as any,
        active: true
      })
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      assert(error.errors[0].constraints !== undefined)
      expect(error.errors[0].constraints.isDate).toBe('createdAt must be a Date instance')
    }
  })

  it('should validate a simple DTO - boolean', () => {
    expect.assertions(1)
    try {
      new CustomerDTO({
        name: 'John Doe',
        age: 23,
        roles: [],
        createdAt: new Date(),
        active: 'abc' as any
      })
    } catch (error) {
      assert(error instanceof GuardedValidationError)
      assert(error.errors[0].constraints !== undefined)
      expect(error.errors[0].constraints.isBoolean).toBe('active must be a boolean value')
    }
  })
});