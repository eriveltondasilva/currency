import { describe, expect, it } from 'vitest';

import { average, from, InvalidInputError, max, min, sum } from '@/index';

describe('sum', () => {
  it('should return the sum of multiple values', () => {
    expect(sum([10, 20, 30], 'US').minorUnits()).toBe(6000);
  });

  it('should accept Money instances as values', () => {
    expect(sum([from(10, 'US'), from(20, 'US')], 'US').minorUnits()).toBe(3000);
  });

  it('should accept a mix of numbers and Money instances', () => {
    expect(sum([from(10, 'US'), 20], 'US').minorUnits()).toBe(3000);
  });

  it('should return zero for an empty array', () => {
    expect(sum([], 'US').isZero()).toBe(true);
  });

  it('should return zero for an array containing only zeros', () => {
    expect(sum([0, 0, 0], 'US').isZero()).toBe(true);
  });

  it('should handle negative values', () => {
    expect(sum([10, -3], 'US').minorUnits()).toBe(700);
  });

  it('should produce the correct currency code', () => {
    expect(sum([10, 20], 'BR').currencyCode()).toBe('BRL');
  });
});

describe('average', () => {
  it('should return the average of multiple values', () => {
    expect(average([10, 20, 30], 'US').minorUnits()).toBe(2000);
  });

  it('should round the result when values do not divide evenly', () => {
    const result = average([10, 20, 30, 40], 'US').minorUnits();
    expect(result).toBe(2500);
  });

  it('should apply default rounding when the average is a non-integer minor unit', () => {
    // (100 + 200 + 300) cents / 3 = 200 cents → exact
    expect(average([1, 2, 3], 'US').minorUnits()).toBe(200);
  });

  it('should return zero for an empty array', () => {
    expect(average([], 'US').isZero()).toBe(true);
  });

  it('should return the single value for a one-element array', () => {
    expect(average([42], 'US').minorUnits()).toBe(4200);
  });

  it('should produce the correct currency code', () => {
    expect(average([10, 20], 'BR').currencyCode()).toBe('BRL');
  });
});

describe('max', () => {
  it('should return the largest value in the array', () => {
    expect(max([10, 50, 20], 'US').minorUnits()).toBe(5000);
  });

  it('should return the single element when the array has one item', () => {
    expect(max([42], 'US').minorUnits()).toBe(4200);
  });

  it('should handle all negative values', () => {
    expect(max([-10, -5, -20], 'US').minorUnits()).toBe(-500);
  });

  it('should accept Money instances', () => {
    expect(max([from(10, 'US'), from(50, 'US')], 'US').minorUnits()).toBe(5000);
  });

  it('should produce the correct currency code', () => {
    expect(max([10, 20], 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw InvalidInputError for an empty array', () => {
    expect(() => max([], 'US')).toThrow(InvalidInputError);
  });
});

describe('min', () => {
  it('should return the smallest value in the array', () => {
    expect(min([10, 50, 20], 'US').minorUnits()).toBe(1000);
  });

  it('should return the single element when the array has one item', () => {
    expect(min([42], 'US').minorUnits()).toBe(4200);
  });

  it('should handle all negative values', () => {
    expect(min([-10, -5, -20], 'US').minorUnits()).toBe(-2000);
  });

  it('should accept Money instances', () => {
    expect(min([from(10, 'US'), from(50, 'US')], 'US').minorUnits()).toBe(1000);
  });

  it('should produce the correct currency code', () => {
    expect(min([10, 20], 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw InvalidInputError for an empty array', () => {
    expect(() => min([], 'US')).toThrow(InvalidInputError);
  });
});
