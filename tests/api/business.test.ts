import { describe, expect, it } from 'vitest';

import { percent, total } from '@/api/business';
import { from, zero } from '@/api/creation';
import { CurrencyMismatchError, DivisionByZeroError, InvalidInputError } from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

describe('total', () => {
  it('should return the sum of all item prices', () => {
    const items = [{ price: 10 }, { price: 20 }, { price: 30 }];
    expect(total(items, 'US').minorUnits()).toBe(6000);
  });

  it('should multiply price by quantity when provided', () => {
    const items = [{ price: 10, quantity: 3 }];
    expect(total(items, 'US').minorUnits()).toBe(3000);
  });

  it('should default quantity to 1 when omitted', () => {
    const items = [{ price: 10 }];
    expect(total(items, 'US').minorUnits()).toBe(1000);
  });

  it('should handle quantity of 0 and contribute nothing to the total', () => {
    const items = [
      { price: 50, quantity: 0 },
      { price: 10, quantity: 1 },
    ];
    expect(total(items, 'US').minorUnits()).toBe(1000);
  });

  it('should handle a mix of numbers and Money instances as prices', () => {
    const items = [{ price: from(10, 'US') }, { price: 20 }];
    expect(total(items, 'US').minorUnits()).toBe(3000);
  });

  it('should return zero for an empty array', () => {
    expect(total([], 'US').isZero()).toBe(true);
  });

  it('should produce the correct currency code', () => {
    expect(total([{ price: 10 }], 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw InvalidInputError for a non-object item', () => {
    expect(() => total([null as never], 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a fractional quantity', () => {
    expect(() => total([{ price: 10, quantity: 1.5 }], 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a negative quantity', () => {
    expect(() => total([{ price: 10, quantity: -1 }], 'US')).toThrow(InvalidInputError);
  });

  it('should throw CurrencyMismatchError when a Money price has a different currency', () => {
    const items = [{ price: from(10, 'BR') }];
    expect(() => total(items, 'US')).toThrow(CurrencyMismatchError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('percent', () => {
  it('should return 50 when the portion is half of the base', () => {
    expect(percent(50, 100, 'US')).toBe(50);
  });

  it('should return 100 when portion equals the base', () => {
    expect(percent(100, 100, 'US')).toBe(100);
  });

  it('should return a value above 100 when portion exceeds the base', () => {
    expect(percent(150, 100, 'US')).toBe(150);
  });

  it('should return 0 when the portion is zero', () => {
    expect(percent(0, 100, 'US')).toBe(0);
  });

  it('should accept Money instances as portion and base', () => {
    expect(percent(from(50, 'US'), from(100, 'US'), 'US')).toBe(50);
  });

  it('should return a precise percentage for non-round values', () => {
    expect(percent(1, 3, 'US')).toBeCloseTo(33.33, 1);
  });

  it('should throw DivisionByZeroError when the base is zero', () => {
    expect(() => percent(10, 0, 'US')).toThrow(DivisionByZeroError);
  });

  it('should throw DivisionByZeroError when the base is a zero Money instance', () => {
    expect(() => percent(10, zero('US'), 'US')).toThrow(DivisionByZeroError);
  });

  it('should throw CurrencyMismatchError when portion and base have different currencies', () => {
    expect(() => percent(from(10, 'BR'), from(100, 'US'), 'US')).toThrow(CurrencyMismatchError);
  });
});
