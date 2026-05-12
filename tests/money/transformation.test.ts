import { describe, expect, it } from 'vitest';

import { from, zero } from '@/api/creation';
import { CurrencyMismatchError, InvalidInputError } from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.abs', () => {
  it('should return the same amount for a positive value', () => {
    expect(from(10, 'US').abs().minorUnits()).toBe(1000);
  });

  it('should return a positive value for a negative amount', () => {
    expect(from(-10, 'US').abs().minorUnits()).toBe(1000);
  });

  it('should return zero for zero', () => {
    expect(zero('US').abs().isZero()).toBe(true);
  });

  it('should not mutate the original instance', () => {
    const original = from(-10, 'US');
    original.abs();
    expect(original.minorUnits()).toBe(-1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.negate', () => {
  it('should turn a positive amount into a negative one', () => {
    expect(from(10, 'US').negate().minorUnits()).toBe(-1000);
  });

  it('should turn a negative amount into a positive one', () => {
    expect(from(-10, 'US').negate().minorUnits()).toBe(1000);
  });

  it('should return zero when negating zero', () => {
    expect(zero('US').negate().isZero()).toBe(true);
  });

  it('should not mutate the original instance', () => {
    const original = from(10, 'US');
    original.negate();
    expect(original.minorUnits()).toBe(1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.max', () => {
  it('should return the current instance when it is greater', () => {
    expect(from(10, 'US').max(5).minorUnits()).toBe(1000);
  });

  it('should return the given value when it is greater', () => {
    expect(from(5, 'US').max(10).minorUnits()).toBe(1000);
  });

  it('should return the current instance when both are equal', () => {
    expect(from(10, 'US').max(10).minorUnits()).toBe(1000);
  });

  it('should accept a Money instance as input', () => {
    expect(from(5, 'US').max(from(10, 'US')).minorUnits()).toBe(1000);
  });

  it('should throw CurrencyMismatchError for different currencies', () => {
    expect(() => from(10, 'US').max(from(5, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.min', () => {
  it('should return the current instance when it is less', () => {
    expect(from(5, 'US').min(10).minorUnits()).toBe(500);
  });

  it('should return the given value when it is less', () => {
    expect(from(10, 'US').min(5).minorUnits()).toBe(500);
  });

  it('should return the current instance when both are equal', () => {
    expect(from(5, 'US').min(5).minorUnits()).toBe(500);
  });

  it('should accept a Money instance as input', () => {
    expect(from(10, 'US').min(from(5, 'US')).minorUnits()).toBe(500);
  });

  it('should throw CurrencyMismatchError for different currencies', () => {
    expect(() => from(10, 'US').min(from(5, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.round', () => {
  it('should round up to the nearest 5-cent step', () => {
    expect(from(0.03, 'US').round(0.05).minorUnits()).toBe(5);
  });

  it('should round down to the nearest 5-cent step', () => {
    expect(from(0.02, 'US').round(0.05).minorUnits()).toBe(0);
  });

  it('should return the same value when step equals the minimum currency unit', () => {
    expect(from(10.99, 'US').round(0.01).minorUnits()).toBe(from(10.99, 'US').minorUnits());
  });

  it('should round to the nearest dollar', () => {
    expect(from(1.5, 'US').round(1).minorUnits()).toBe(200);
    expect(from(1.49, 'US').round(1).minorUnits()).toBe(100);
  });

  it('should return zero unchanged for any step', () => {
    expect(zero('US').round(0.05).isZero()).toBe(true);
  });

  it('should apply the specified rounding mode', () => {
    const floor = from(0.025, 'US').round(0.05, 'floor').minorUnits();
    const ceil = from(0.025, 'US').round(0.05, 'ceil').minorUnits();
    expect(ceil).toBeGreaterThanOrEqual(floor);
  });

  it('should throw InvalidInputError for a step of 0', () => {
    expect(() => from(10, 'US').round(0)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a negative step', () => {
    expect(() => from(10, 'US').round(-0.05)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for Infinity', () => {
    expect(() => from(10, 'US').round(Infinity)).toThrow(InvalidInputError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.compare', () => {
  it('should return -1 when less than the given value', () => {
    expect(from(5, 'US').compare(10)).toBe(-1);
  });

  it('should return 0 when equal to the given value', () => {
    expect(from(10, 'US').compare(10)).toBe(0);
  });

  it('should return 1 when greater than the given value', () => {
    expect(from(20, 'US').compare(10)).toBe(1);
  });

  it('should accept a MoneyContract as input', () => {
    expect(from(5, 'US').compare(from(10, 'US'))).toBe(-1);
  });

  it('should sort an array in ascending order', () => {
    const prices = [from(30, 'US'), from(10, 'US'), from(20, 'US')];
    const sorted = prices.sort((a, b) => a.compare(b));
    expect(sorted.map((p) => p.amount())).toEqual([10, 20, 30]);
  });

  it('should sort an array in descending order', () => {
    const prices = [from(30, 'US'), from(10, 'US'), from(20, 'US')];
    const sorted = prices.sort((a, b) => b.compare(a));
    expect(sorted.map((p) => p.amount())).toEqual([30, 20, 10]);
  });

  it('should handle negative values correctly', () => {
    expect(from(-10, 'US').compare(-5)).toBe(-1);
    expect(from(-5, 'US').compare(-10)).toBe(1);
    expect(from(-10, 'US').compare(-10)).toBe(0);
  });

  it('should throw CurrencyMismatchError for different currencies', () => {
    expect(() => from(10, 'US').compare(from(10, 'BR'))).toThrow(CurrencyMismatchError);
  });
});
