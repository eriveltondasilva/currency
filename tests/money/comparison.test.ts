import { describe, expect, it } from 'vitest';

import type { MoneyContract } from '@/types';

import { from, zero } from '@/api/creation';
import { CurrencyMismatchError, InvalidRangeError } from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.equals', () => {
  it('should return true for the same amount and currency', () => {
    expect(from(10, 'US').equals(from(10, 'US'))).toBe(true);
  });

  it('should return true when comparing with an equivalent number', () => {
    expect(from(10, 'US').equals(10)).toBe(true);
  });

  it('should return false for a different amount', () => {
    expect(from(10, 'US').equals(9.99)).toBe(false);
  });

  it('should return false when comparing with a different currency', () => {
    expect(from(10, 'US').equals(from(10, 'BR'))).toBe(false);
  });

  it('should return true for two zero instances of the same currency', () => {
    expect(zero('US').equals(zero('US'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.greaterThan', () => {
  it('should return true when the amount is greater than a number', () => {
    expect(from(10, 'US').greaterThan(9)).toBe(true);
  });

  it('should return true when the amount is greater than another Money instance', () => {
    expect(from(10, 'US').greaterThan(from(9, 'US'))).toBe(true);
  });

  it('should return false when the amounts are equal', () => {
    expect(from(10, 'US').greaterThan(10)).toBe(false);
  });

  it('should return false when the amount is less than the given value', () => {
    expect(from(5, 'US').greaterThan(10)).toBe(false);
  });

  it('should throw CurrencyMismatchError for different currencies', () => {
    expect(() => from(10, 'US').greaterThan(from(5, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.lessThan', () => {
  it('should return true when the amount is less than a number', () => {
    expect(from(5, 'US').lessThan(10)).toBe(true);
  });

  it('should return true when the amount is less than another Money instance', () => {
    expect(from(5, 'US').lessThan(from(10, 'US'))).toBe(true);
  });

  it('should return false when the amounts are equal', () => {
    expect(from(10, 'US').lessThan(10)).toBe(false);
  });

  it('should return false when the amount is greater than the given value', () => {
    expect(from(10, 'US').lessThan(5)).toBe(false);
  });

  it('should throw CurrencyMismatchError for different currencies', () => {
    expect(() => from(10, 'US').lessThan(from(5, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.greaterThanOrEqual', () => {
  it('should return true when the amount is greater', () => {
    expect(from(10, 'US').greaterThanOrEqual(9)).toBe(true);
  });

  it('should return true when the amounts are equal', () => {
    expect(from(10, 'US').greaterThanOrEqual(10)).toBe(true);
  });

  it('should return false when the amount is less', () => {
    expect(from(5, 'US').greaterThanOrEqual(10)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.lessThanOrEqual', () => {
  it('should return true when the amount is less', () => {
    expect(from(5, 'US').lessThanOrEqual(10)).toBe(true);
  });

  it('should return true when the amounts are equal', () => {
    expect(from(10, 'US').lessThanOrEqual(10)).toBe(true);
  });

  it('should return false when the amount is greater', () => {
    expect(from(10, 'US').lessThanOrEqual(5)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.isBetween', () => {
  it('should return true when the amount is strictly between min and max', () => {
    expect(from(5, 'US').isBetween(1, 10)).toBe(true);
  });

  it('should return true when the amount equals the minimum boundary', () => {
    expect(from(1, 'US').isBetween(1, 10)).toBe(true);
  });

  it('should return true when the amount equals the maximum boundary', () => {
    expect(from(10, 'US').isBetween(1, 10)).toBe(true);
  });

  it('should return false when the amount is below the minimum', () => {
    expect(from(0.5, 'US').isBetween(1, 10)).toBe(false);
  });

  it('should return false when the amount is above the maximum', () => {
    expect(from(11, 'US').isBetween(1, 10)).toBe(false);
  });

  it('should accept Money instances as boundaries', () => {
    expect(from(5, 'US').isBetween(from(1, 'US'), from(10, 'US'))).toBe(true);
  });

  it('should throw InvalidRangeError when min is greater than max', () => {
    expect(() => from(5, 'US').isBetween(10, 1)).toThrow(InvalidRangeError);
  });

  it('should throw CurrencyMismatchError when boundaries use a different currency', () => {
    expect(() => from(5, 'US').isBetween(from(1, 'BR'), from(10, 'BR'))).toThrow(
      CurrencyMismatchError,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.hasSameCurrency', () => {
  it('should return true for two instances of the same currency', () => {
    expect(from(10, 'US').hasSameCurrency(from(99, 'US'))).toBe(true);
  });

  it('should return false for instances of different currencies', () => {
    expect(from(10, 'US').hasSameCurrency(from(10, 'BR'))).toBe(false);
  });

  it('should return true for different countries that share the same currency', () => {
    expect(from(10, 'DE').hasSameCurrency(from(10, 'FR'))).toBe(true);
  });

  it('should return false for a non-Money value passed as MoneyContract', () => {
    expect(from(10, 'US').hasSameCurrency(42 as unknown as MoneyContract)).toBe(false);
  });
});
