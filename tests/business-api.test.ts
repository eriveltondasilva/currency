import { describe, expect, it } from 'vitest';

import { percent, total } from '@/api/business';
import { from } from '@/api/creation';
import { DivisionByZeroError, InvalidInputError } from '@/lib/errors';

// ─── total() ─────────────────────────────────────────────────────────────────

describe('total', () => {
  it('should return zero for an empty array', () => {
    expect(total([], 'US').isZero()).toBe(true);
  });

  it('should compute the total for a single item with default quantity of 1', () => {
    expect(total([{ price: 10 }], 'US').value()).toBe(10);
  });

  it('should multiply price by quantity', () => {
    expect(total([{ price: 10, quantity: 3 }], 'US').value()).toBe(30);
  });

  it('should sum multiple items', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 4 },
    ];
    expect(total(items, 'US').value()).toBe(40);
  });

  it('should handle a fractional quantity', () => {
    expect(total([{ price: 10, quantity: 1.5 }], 'US').value()).toBe(15);
  });

  it('should handle quantity of zero returning zero for that item', () => {
    const items = [
      { price: 50, quantity: 0 },
      { price: 10, quantity: 1 },
    ];
    expect(total(items, 'US').value()).toBe(10);
  });

  it('should accept a string price', () => {
    expect(total([{ price: '9.99', quantity: 2 }], 'US').value()).toBe(19.98);
  });

  it('should accept a MoneyContract price', () => {
    expect(total([{ price: from(10, 'US'), quantity: 3 }], 'US').value()).toBe(30);
  });

  it('should return a result with the correct currency code', () => {
    expect(total([{ price: 100 }], 'BR').currencyCode()).toBe('BRL');
  });

  it('should return zero for an empty items array using a non-default country', () => {
    expect(total([], 'JP').currencyCode()).toBe('JPY');
  });

  it('should throw InvalidInputError when an item is not an object', () => {
    expect(() => total([null as never], 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when an item is a primitive', () => {
    expect(() => total([42 as never], 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a negative quantity', () => {
    expect(() => total([{ price: 10, quantity: -1 }], 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for an infinite quantity', () => {
    expect(() => total([{ price: 10, quantity: Infinity }], 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a NaN quantity', () => {
    expect(() => total([{ price: 10, quantity: NaN }], 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for an invalid price', () => {
    expect(() => total([{ price: 'abc' }], 'US')).toThrow(InvalidInputError);
  });
});

// ─── percent() ────────────────────────────────────────────────────────────────

describe('percent', () => {
  it('should return 50 when part is half of whole', () => {
    expect(percent(50, 100, 'US')).toBe(50);
  });

  it('should return 100 when part equals whole', () => {
    expect(percent(100, 100, 'US')).toBe(100);
  });

  it('should return 0 when part is zero', () => {
    expect(percent(0, 100, 'US')).toBe(0);
  });

  it('should return a fractional percentage', () => {
    expect(percent(1, 3, 'US')).toBeCloseTo(33.33, 2);
  });

  it('should return a percentage above 100 when part exceeds whole', () => {
    expect(percent(150, 100, 'US')).toBe(150);
  });

  it('should accept string inputs for part and whole', () => {
    expect(percent('25.00', '100.00', 'US')).toBe(25);
  });

  it('should accept MoneyContract inputs for part and whole', () => {
    expect(percent(from(25, 'US'), from(100, 'US'), 'US')).toBe(25);
  });

  it('should work with a non-default country', () => {
    expect(percent(50, 200, 'BR')).toBe(25);
  });

  it('should throw DivisionByZeroError when whole is zero', () => {
    expect(() => percent(10, 0, 'US')).toThrow(DivisionByZeroError);
  });

  it('should throw InvalidInputError when whole is an invalid string', () => {
    expect(() => percent(10, 'abc', 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when part is an invalid string', () => {
    expect(() => percent('xyz', 100, 'US')).toThrow(InvalidInputError);
  });
});
