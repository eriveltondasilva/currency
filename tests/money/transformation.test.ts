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
  it('should round up to the nearest 5-unit increment', () => {
    expect(from(0, 'US').plus(0.03).round(5).minorUnits()).toBe(5);
  });

  it('should round down to the nearest 5-unit increment', () => {
    expect(from(0, 'US').plus(0.02).round(5).minorUnits()).toBe(0);
  });

  it('should return a clone for increment of 1', () => {
    const original = from(10, 'US');
    const result = original.round(1);
    expect(result.minorUnits()).toBe(original.minorUnits());
  });

  it('should return zero unchanged for any increment', () => {
    expect(zero('US').round(10).isZero()).toBe(true);
  });

  it('should apply the specified rounding mode', () => {
    const floor = from(0, 'US').plus(0.025).round(5, 'floor').minorUnits();
    const ceil = from(0, 'US').plus(0.025).round(5, 'ceil').minorUnits();
    expect(ceil).toBeGreaterThanOrEqual(floor);
  });

  it('should throw InvalidInputError for a non-integer increment', () => {
    expect(() => from(10, 'US').round(0.5)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for an increment of 0', () => {
    expect(() => from(10, 'US').round(0)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a negative increment', () => {
    expect(() => from(10, 'US').round(-5)).toThrow(InvalidInputError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.clone', () => {
  it('should produce a new instance with the same minor units', () => {
    const original = from(10, 'US');
    expect(original.clone().minorUnits()).toBe(original.minorUnits());
  });

  it('should produce a new instance with the same currency code', () => {
    const original = from(10, 'US');
    expect(original.clone().currencyCode()).toBe(original.currencyCode());
  });

  it('should not return the same reference', () => {
    const original = from(10, 'US');
    expect(original.clone()).not.toBe(original);
  });
});
