import { describe, expect, it } from 'vitest';

import { from, zero } from '@/api/creation';
import {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidInputError,
  UnsafeIntegerError,
} from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.plus', () => {
  it('should add a number to the current amount', () => {
    expect(from(10, 'US').plus(5).minorUnits()).toBe(1500);
  });

  it('should add another Money instance of the same currency', () => {
    expect(from(10, 'US').plus(from(5, 'US')).minorUnits()).toBe(1500);
  });

  it('should handle adding a negative number', () => {
    expect(from(10, 'US').plus(-3).minorUnits()).toBe(700);
  });

  it('should handle adding zero', () => {
    expect(from(10, 'US').plus(0).minorUnits()).toBe(1000);
  });

  it('should not mutate the original instance', () => {
    const original = from(10, 'US');
    original.plus(5);
    expect(original.minorUnits()).toBe(1000);
  });

  it('should throw CurrencyMismatchError when adding a different currency', () => {
    expect(() => from(10, 'US').plus(from(5, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.minus', () => {
  it('should subtract a number from the current amount', () => {
    expect(from(10, 'US').minus(3).minorUnits()).toBe(700);
  });

  it('should subtract another Money instance of the same currency', () => {
    expect(from(10, 'US').minus(from(3, 'US')).minorUnits()).toBe(700);
  });

  it('should produce a negative result when subtracting more than the current amount', () => {
    expect(from(5, 'US').minus(10).minorUnits()).toBe(-500);
  });

  it('should handle subtracting zero', () => {
    expect(from(10, 'US').minus(0).minorUnits()).toBe(1000);
  });

  it('should not mutate the original instance', () => {
    const original = from(10, 'US');
    original.minus(5);
    expect(original.minorUnits()).toBe(1000);
  });

  it('should throw CurrencyMismatchError when subtracting a different currency', () => {
    expect(() => from(10, 'US').minus(from(5, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.times', () => {
  it('should multiply the amount by an integer factor', () => {
    expect(from(10, 'US').times(3).minorUnits()).toBe(3000);
  });

  it('should multiply by a decimal factor with default rounding', () => {
    expect(from(10, 'US').times(1.5).minorUnits()).toBe(1500);
  });

  it('should return zero when the factor is 0', () => {
    expect(from(10, 'US').times(0).isZero()).toBe(true);
  });

  it('should handle a negative factor', () => {
    expect(from(10, 'US').times(-2).minorUnits()).toBe(-2000);
  });

  it('should apply the given rounding mode', () => {
    const result = from(1, 'US')
      .times(1 / 3, 'floor')
      .minorUnits();
    const resultCeil = from(1, 'US')
      .times(1 / 3, 'ceil')
      .minorUnits();
    expect(result).toBeLessThan(resultCeil);
  });

  it('should not mutate the original instance', () => {
    const original = from(10, 'US');
    original.times(3);
    expect(original.minorUnits()).toBe(1000);
  });

  it('should throw InvalidInputError for an infinite factor', () => {
    expect(() => from(10, 'US').times(Infinity)).toThrow(InvalidInputError);
  });

  it('should throw UnsafeIntegerError when the product exceeds Number.MAX_SAFE_INTEGER', () => {
    // 100 minor units (from(1)) * MAX_SAFE_INTEGER overflows the safe integer range
    expect(() => from(1, 'US').times(Number.MAX_SAFE_INTEGER)).toThrow(UnsafeIntegerError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.divide', () => {
  it('should divide the amount by an integer divisor', () => {
    expect(from(10, 'US').divide(2).minorUnits()).toBe(500);
  });

  it('should divide by a decimal divisor with default rounding', () => {
    expect(from(10, 'US').divide(3).minorUnits()).toBe(333);
  });

  it('should return a clone when divisor is 1', () => {
    const original = from(10, 'US');
    const result = original.divide(1);
    expect(result.minorUnits()).toBe(original.minorUnits());
    expect(result).not.toBe(original);
  });

  it('should handle a negative divisor', () => {
    expect(from(10, 'US').divide(-2).minorUnits()).toBe(-500);
  });

  it('should apply the given rounding mode', () => {
    const floor = from(10, 'US').divide(3, 'floor').minorUnits();
    const ceil = from(10, 'US').divide(3, 'ceil').minorUnits();
    expect(ceil).toBeGreaterThan(floor);
  });

  it('should not mutate the original instance', () => {
    const original = from(10, 'US');
    original.divide(2);
    expect(original.minorUnits()).toBe(1000);
  });

  it('should throw DivisionByZeroError when dividing by 0', () => {
    expect(() => from(10, 'US').divide(0)).toThrow(DivisionByZeroError);
  });

  it('should throw InvalidInputError for an infinite divisor', () => {
    expect(() => from(10, 'US').divide(Infinity)).toThrow(InvalidInputError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('arithmetic composition', () => {
  it('should chain plus and minus and return the correct result', () => {
    expect(from(100, 'US').plus(50).minus(30).minorUnits()).toBe(12000);
  });

  it('should chain times and divide and return the original amount', () => {
    expect(from(10, 'US').times(4).divide(4).minorUnits()).toBe(1000);
  });

  it('should produce zero when subtracting the full amount', () => {
    const price = from(99.99, 'US');
    expect(price.minus(price).isZero()).toBe(true);
  });

  it('should accumulate correctly when adding many small values', () => {
    const base = zero('US');
    const result = [1, 2, 3, 4].reduce((acc, n) => acc.plus(n), base);
    expect(result.minorUnits()).toBe(1000);
  });
});
