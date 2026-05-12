import { describe, expect, it } from 'vitest';

import { averageWith, clamp, max, min, sum } from '@/api/collection';
import { from } from '@/api/creation';
import { InvalidInputError, InvalidRangeError } from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

describe('average', () => {
  it('should return the average of multiple values', () => {
    expect(averageWith([10, 20, 30], 'US').minorUnits()).toBe(2000);
  });

  it('should round the result when values do not divide evenly', () => {
    const result = averageWith([10, 20, 30, 40], 'US').minorUnits();
    expect(result).toBe(2500);
  });

  it('should apply default rounding when the average is a non-integer minor unit', () => {
    // (100 + 200 + 300) cents / 3 = 200 cents → exact
    expect(averageWith([1, 2, 3], 'US').minorUnits()).toBe(200);
  });

  it('should return zero for an empty array', () => {
    expect(averageWith([], 'US').isZero()).toBe(true);
  });

  it('should return the single value for a one-element array', () => {
    expect(averageWith([42], 'US').minorUnits()).toBe(4200);
  });

  it('should produce the correct currency code', () => {
    expect(averageWith([10, 20], 'BR').currencyCode()).toBe('BRL');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

describe('clamp', () => {
  it('should return the value unchanged when it is within the range', () => {
    expect(clamp(5, 1, 10, 'US').minorUnits()).toBe(500);
  });

  it('should return the minimum when the value is below the range', () => {
    expect(clamp(0, 1, 10, 'US').minorUnits()).toBe(100);
  });

  it('should return the maximum when the value is above the range', () => {
    expect(clamp(20, 1, 10, 'US').minorUnits()).toBe(1000);
  });

  it('should return the value when it equals the minimum boundary', () => {
    expect(clamp(1, 1, 10, 'US').minorUnits()).toBe(100);
  });

  it('should return the value when it equals the maximum boundary', () => {
    expect(clamp(10, 1, 10, 'US').minorUnits()).toBe(1000);
  });

  it('should accept Money instances as value, min and max', () => {
    expect(clamp(from(5, 'US'), from(1, 'US'), from(10, 'US'), 'US').minorUnits()).toBe(500);
  });

  it('should produce the correct currency code', () => {
    expect(clamp(5, 1, 10, 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw InvalidRangeError when min is greater than max', () => {
    expect(() => clamp(5, 10, 1, 'US')).toThrow(InvalidRangeError);
  });
});
