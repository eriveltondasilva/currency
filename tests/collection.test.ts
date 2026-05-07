import { describe, expect, it } from 'vitest';

import { average, clamp, max, min, sum } from '@/api/collection';
import { from } from '@/api/creation';
import { CurrencyMismatchError, InvalidRangeError } from '@/lib/errors';

// ─── sum() ────────────────────────────────────────────────────────────────────

describe('sum', () => {
  it('should return zero for an empty array', () => {
    expect(sum([], 'US').isZero()).toBe(true);
  });

  it('should sum a list of numbers', () => {
    expect(sum([10, 20, 30], 'US').value()).toBe(60);
  });

  it('should sum a list of strings', () => {
    expect(sum(['1.50', '2.50', '6.00'], 'US').value()).toBe(10);
  });

  it('should sum a list of MoneyContract values', () => {
    const values = [from(10, 'US'), from(20, 'US'), from(30, 'US')];
    expect(sum(values, 'US').value()).toBe(60);
  });

  it('should sum a mixed list of number, string and MoneyContract', () => {
    expect(sum([10, '5.00', from(5, 'US')], 'US').value()).toBe(20);
  });

  it('should sum negative values correctly', () => {
    expect(sum([-10, -20], 'US').value()).toBe(-30);
  });

  it('should return a result with the correct currency code', () => {
    expect(sum([100, 200], 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw CurrencyMismatchError when a MoneyContract has a different currency', () => {
    expect(() => sum([from(10, 'US'), from(10, 'BR')], 'US')).toThrow(CurrencyMismatchError);
  });
});

// ─── average() ────────────────────────────────────────────────────────────────

describe('average', () => {
  it('should return zero for an empty array', () => {
    expect(average([], 'US').isZero()).toBe(true);
  });

  it('should return the value itself for a single-element array', () => {
    expect(average([50], 'US').value()).toBe(50);
  });

  it('should compute the average of a list of numbers', () => {
    expect(average([10, 20, 30], 'US').value()).toBe(20);
  });

  it('should round the remainder when the average is not exact', () => {
    expect(average([1, 2], 'US').value()).toBe(1.5);
  });

  it('should round to the nearest minor unit when result is fractional', () => {
    const result = average([10, 10, 11], 'US');
    expect(result.amount()).toBe(1033);
  });

  it('should average a mixed list of number, string and MoneyContract', () => {
    expect(average([10, '20', from(30, 'US')], 'US').value()).toBe(20);
  });

  it('should return a result with the correct currency code', () => {
    expect(average([100, 200], 'JP').currencyCode()).toBe('JPY');
  });

  it('should throw CurrencyMismatchError when a MoneyContract has a different currency', () => {
    expect(() => average([from(10, 'US'), from(10, 'BR')], 'US')).toThrow(CurrencyMismatchError);
  });
});

// ─── max() ────────────────────────────────────────────────────────────────────

describe('max', () => {
  it('should return zero for an empty array', () => {
    expect(max([], 'US').isZero()).toBe(true);
  });

  it('should return the largest value from a list', () => {
    expect(max([10, 50, 30], 'US').value()).toBe(50);
  });

  it('should return the only element for a single-element array', () => {
    expect(max([42], 'US').value()).toBe(42);
  });

  it('should work correctly when all values are negative', () => {
    expect(max([-10, -5, -20], 'US').value()).toBe(-5);
  });

  it('should work with a mixed list of number, string and MoneyContract', () => {
    expect(max([10, '50.00', from(30, 'US')], 'US').value()).toBe(50);
  });

  it('should return a result with the correct currency code', () => {
    expect(max([10, 20], 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw CurrencyMismatchError when a MoneyContract has a different currency', () => {
    expect(() => max([from(10, 'US'), from(20, 'BR')], 'US')).toThrow(CurrencyMismatchError);
  });
});

// ─── min() ────────────────────────────────────────────────────────────────────

describe('min', () => {
  it('should return zero for an empty array', () => {
    expect(min([], 'US').isZero()).toBe(true);
  });

  it('should return the smallest value from a list', () => {
    expect(min([10, 50, 30], 'US').value()).toBe(10);
  });

  it('should return the only element for a single-element array', () => {
    expect(min([42], 'US').value()).toBe(42);
  });

  it('should work correctly when all values are negative', () => {
    expect(min([-10, -5, -20], 'US').value()).toBe(-20);
  });

  it('should work with a mixed list of number, string and MoneyContract', () => {
    expect(min([10, '5.00', from(30, 'US')], 'US').value()).toBe(5);
  });

  it('should return a result with the correct currency code', () => {
    expect(min([10, 20], 'GB').currencyCode()).toBe('GBP');
  });

  it('should throw CurrencyMismatchError when a MoneyContract has a different currency', () => {
    expect(() => min([from(10, 'US'), from(5, 'BR')], 'US')).toThrow(CurrencyMismatchError);
  });
});

// ─── clamp() ─────────────────────────────────────────────────────────────────

describe('clamp', () => {
  it('should return the value unchanged when within range', () => {
    expect(clamp(5, 1, 10, 'US').value()).toBe(5);
  });

  it('should return min when value is below the lower bound', () => {
    expect(clamp(0, 1, 10, 'US').value()).toBe(1);
  });

  it('should return max when value is above the upper bound', () => {
    expect(clamp(15, 1, 10, 'US').value()).toBe(10);
  });

  it('should return min when value equals min', () => {
    expect(clamp(1, 1, 10, 'US').value()).toBe(1);
  });

  it('should return max when value equals max', () => {
    expect(clamp(10, 1, 10, 'US').value()).toBe(10);
  });

  it('should return min and max when they are equal and value matches', () => {
    expect(clamp(5, 5, 5, 'US').value()).toBe(5);
  });

  it('should work correctly with negative bounds', () => {
    expect(clamp(-15, -10, -1, 'US').value()).toBe(-10);
  });

  it('should accept string inputs for value, min and max', () => {
    expect(clamp('5.00', '1.00', '10.00', 'US').value()).toBe(5);
  });

  it('should accept MoneyContract inputs for value, min and max', () => {
    expect(clamp(from(5, 'US'), from(1, 'US'), from(10, 'US'), 'US').value()).toBe(5);
  });

  it('should return a result with the correct currency code', () => {
    expect(clamp(5, 1, 10, 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw InvalidRangeError when min is greater than max', () => {
    expect(() => clamp(5, 10, 1, 'US')).toThrow(InvalidRangeError);
  });

  it('should throw CurrencyMismatchError when min has a different currency', () => {
    expect(() => clamp(5, from(1, 'BR'), 10, 'US')).toThrow(CurrencyMismatchError);
  });
});
