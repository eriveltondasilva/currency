import { describe, expect, it } from 'vitest';

import { from, zero } from '@/api/creation';
import { CurrencyMismatchError, InvalidRangeError } from '@/lib/errors';

// ─── equals() ────────────────────────────────────────────────────────────────

describe('Money.equals', () => {
  it('should return true when values are equal', () => {
    expect(from(10, 'US').equals(10)).toBe(true);
  });

  it('should return false when values differ', () => {
    expect(from(10, 'US').equals(9.99)).toBe(false);
  });

  it('should return true when compared to a MoneyContract with the same value', () => {
    expect(from(10, 'US').equals(from(10, 'US'))).toBe(true);
  });

  it('should return true when compared to a string with the same value', () => {
    expect(from(10.5, 'US').equals('10.50')).toBe(true);
  });

  it('should return true for two zero instances', () => {
    expect(zero('US').equals(zero('US'))).toBe(true);
  });

  it('should return false for equal absolute values with different signs', () => {
    expect(from(10, 'US').equals(-10)).toBe(false);
  });

  it('should throw CurrencyMismatchError when comparing different currencies', () => {
    expect(() => from(10, 'US').equals(from(10, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─── greaterThan() ────────────────────────────────────────────────────────────

describe('Money.greaterThan', () => {
  it('should return true when the instance is greater', () => {
    expect(from(10, 'US').greaterThan(9)).toBe(true);
  });

  it('should return false when the instance is equal', () => {
    expect(from(10, 'US').greaterThan(10)).toBe(false);
  });

  it('should return false when the instance is less', () => {
    expect(from(9, 'US').greaterThan(10)).toBe(false);
  });

  it('should work correctly with negative values', () => {
    expect(from(-1, 'US').greaterThan(-2)).toBe(true);
  });

  it('should accept a string input', () => {
    expect(from(10, 'US').greaterThan('9.99')).toBe(true);
  });

  it('should throw CurrencyMismatchError when comparing different currencies', () => {
    expect(() => from(10, 'US').greaterThan(from(5, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─── lessThan() ───────────────────────────────────────────────────────────────

describe('Money.lessThan', () => {
  it('should return true when the instance is less', () => {
    expect(from(5, 'US').lessThan(10)).toBe(true);
  });

  it('should return false when the instance is equal', () => {
    expect(from(10, 'US').lessThan(10)).toBe(false);
  });

  it('should return false when the instance is greater', () => {
    expect(from(10, 'US').lessThan(9)).toBe(false);
  });

  it('should work correctly with negative values', () => {
    expect(from(-5, 'US').lessThan(-1)).toBe(true);
  });

  it('should accept a MoneyContract input', () => {
    expect(from(5, 'US').lessThan(from(10, 'US'))).toBe(true);
  });

  it('should throw CurrencyMismatchError when comparing different currencies', () => {
    expect(() => from(5, 'US').lessThan(from(10, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─── greaterThanOrEqual() ─────────────────────────────────────────────────────

describe('Money.greaterThanOrEqual', () => {
  it('should return true when the instance is greater', () => {
    expect(from(10, 'US').greaterThanOrEqual(5)).toBe(true);
  });

  it('should return true when the instance is equal', () => {
    expect(from(10, 'US').greaterThanOrEqual(10)).toBe(true);
  });

  it('should return false when the instance is less', () => {
    expect(from(5, 'US').greaterThanOrEqual(10)).toBe(false);
  });

  it('should return true for two zero instances', () => {
    expect(zero('US').greaterThanOrEqual(0)).toBe(true);
  });
});

// ─── lessThanOrEqual() ────────────────────────────────────────────────────────

describe('Money.lessThanOrEqual', () => {
  it('should return true when the instance is less', () => {
    expect(from(5, 'US').lessThanOrEqual(10)).toBe(true);
  });

  it('should return true when the instance is equal', () => {
    expect(from(10, 'US').lessThanOrEqual(10)).toBe(true);
  });

  it('should return false when the instance is greater', () => {
    expect(from(10, 'US').lessThanOrEqual(5)).toBe(false);
  });

  it('should return true for two zero instances', () => {
    expect(zero('US').lessThanOrEqual(0)).toBe(true);
  });
});

// ─── isBetween() ──────────────────────────────────────────────────────────────

describe('Money.isBetween', () => {
  it('should return true when value is strictly between min and max', () => {
    expect(from(5, 'US').isBetween(1, 10)).toBe(true);
  });

  it('should return true when value equals min (inclusive)', () => {
    expect(from(1, 'US').isBetween(1, 10)).toBe(true);
  });

  it('should return true when value equals max (inclusive)', () => {
    expect(from(10, 'US').isBetween(1, 10)).toBe(true);
  });

  it('should return false when value is below min', () => {
    expect(from(0, 'US').isBetween(1, 10)).toBe(false);
  });

  it('should return false when value is above max', () => {
    expect(from(11, 'US').isBetween(1, 10)).toBe(false);
  });

  it('should work correctly with negative bounds', () => {
    expect(from(-5, 'US').isBetween(-10, -1)).toBe(true);
  });

  it('should return true when min equals max and value matches', () => {
    expect(from(5, 'US').isBetween(5, 5)).toBe(true);
  });

  it('should accept string inputs for min and max', () => {
    expect(from(5, 'US').isBetween('1.00', '10.00')).toBe(true);
  });

  it('should accept MoneyContract inputs for min and max', () => {
    expect(from(5, 'US').isBetween(from(1, 'US'), from(10, 'US'))).toBe(true);
  });

  it('should throw InvalidRangeError when min is greater than max', () => {
    expect(() => from(5, 'US').isBetween(10, 1)).toThrow(InvalidRangeError);
  });

  it('should throw CurrencyMismatchError when min has a different currency', () => {
    expect(() => from(5, 'US').isBetween(from(1, 'BR'), 10)).toThrow(CurrencyMismatchError);
  });
});
