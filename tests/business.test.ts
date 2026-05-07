import { describe, expect, it } from 'vitest';

import type { MoneyContract } from '@/types/contract';

import { from, zero } from '@/api/creation';
import { InvalidAllocationError, InvalidPercentageError } from '@/lib/errors';

// ─── percentage() ─────────────────────────────────────────────────────────────

describe('Money.percentage', () => {
  it('should return 10% of a value', () => {
    expect(from(200, 'US').percentage(10).value()).toBe(20);
  });

  it('should return 50% of a value', () => {
    expect(from(100, 'US').percentage(50).value()).toBe(50);
  });

  it('should return the original value for 100%', () => {
    expect(from(100, 'US').percentage(100).value()).toBe(100);
  });

  it('should return zero for 0%', () => {
    expect(from(100, 'US').percentage(0).isZero()).toBe(true);
  });

  it('should handle a fractional percentage', () => {
    expect(from(200, 'US').percentage(12.5).value()).toBe(25);
  });

  it('should return zero when applied to a zero value', () => {
    expect(zero('US').percentage(50).isZero()).toBe(true);
  });

  it('should return a new instance leaving the original unchanged', () => {
    const money = from(100, 'US');
    money.percentage(10);
    expect(money.value()).toBe(100);
  });

  it('should throw InvalidPercentageError for a negative percentage', () => {
    expect(() => from(100, 'US').percentage(-1)).toThrow(InvalidPercentageError);
  });
});

// ─── applyDiscount() ──────────────────────────────────────────────────────────

describe('Money.applyDiscount', () => {
  it('should reduce the value by the given discount percentage', () => {
    expect(from(100, 'US').applyDiscount(20).value()).toBe(80);
  });

  it('should return the original value when discount is 0', () => {
    expect(from(100, 'US').applyDiscount(0).value()).toBe(100);
  });

  it('should return zero when discount is 100', () => {
    expect(from(100, 'US').applyDiscount(100).isZero()).toBe(true);
  });

  it('should handle a fractional discount', () => {
    expect(from(200, 'US').applyDiscount(12.5).value()).toBe(175);
  });

  it('should return a new instance leaving the original unchanged', () => {
    const money = from(100, 'US');
    money.applyDiscount(20);
    expect(money.value()).toBe(100);
  });

  it('should throw InvalidPercentageError for a negative discount', () => {
    expect(() => from(100, 'US').applyDiscount(-1)).toThrow(InvalidPercentageError);
  });

  it('should throw InvalidPercentageError for a discount above 100', () => {
    expect(() => from(100, 'US').applyDiscount(101)).toThrow(InvalidPercentageError);
  });
});

// ─── applySurcharge() ─────────────────────────────────────────────────────────

describe('Money.applySurcharge', () => {
  it('should increase the value by the given surcharge percentage', () => {
    expect(from(100, 'US').applySurcharge(10).value()).toBe(110);
  });

  it('should return the original value when surcharge is 0', () => {
    expect(from(100, 'US').applySurcharge(0).value()).toBe(100);
  });

  it('should handle a surcharge above 100%', () => {
    expect(from(100, 'US').applySurcharge(150).value()).toBe(250);
  });

  it('should handle a fractional surcharge', () => {
    expect(from(200, 'US').applySurcharge(12.5).value()).toBe(225);
  });

  it('should return a new instance leaving the original unchanged', () => {
    const money = from(100, 'US');
    money.applySurcharge(10);
    expect(money.value()).toBe(100);
  });

  it('should throw InvalidPercentageError for a negative surcharge', () => {
    expect(() => from(100, 'US').applySurcharge(-1)).toThrow(InvalidPercentageError);
  });
});

// ─── allocate() ───────────────────────────────────────────────────────────────

describe('Money.allocate', () => {
  it('should split a value evenly when divisible', () => {
    const parts = from(100, 'US').allocate(4);
    expect(parts.map((p) => p.value())).toEqual([25, 25, 25, 25]);
  });

  it('should distribute the remainder to the first parts', () => {
    const parts = from(1, 'US').allocate(3);
    expect(parts.map((p) => p.amount())).toEqual([34, 33, 33]);
  });

  it('should return an array with length equal to parts', () => {
    expect(from(100, 'US').allocate(5)).toHaveLength(5);
  });

  it('should allocate a single part returning the full value', () => {
    const parts = from(99.99, 'US').allocate(1);
    expect((parts[0] as MoneyContract).value()).toBe(99.99);
  });

  it('should preserve the sign for negative values', () => {
    const parts = from(-100, 'US').allocate(3);
    expect(parts.every((p) => p.isNegative())).toBe(true);
  });

  it('should distribute the remainder correctly for a negative value', () => {
    const parts = from(-1, 'US').allocate(3);
    expect(parts.map((p) => p.amount())).toEqual([-34, -33, -33]);
  });

  it('should return all-zero parts when allocating zero', () => {
    const parts = zero('US').allocate(3);
    expect(parts.every((p) => p.isZero())).toBe(true);
  });

  it('should preserve the currency code in every part', () => {
    const parts = from(100, 'BR').allocate(2);
    expect(parts.every((p) => p.currencyCode() === 'BRL')).toBe(true);
  });

  it('should throw InvalidAllocationError for zero parts', () => {
    expect(() => from(100, 'US').allocate(0)).toThrow(InvalidAllocationError);
  });

  it('should throw InvalidAllocationError for a negative number of parts', () => {
    expect(() => from(100, 'US').allocate(-1)).toThrow(InvalidAllocationError);
  });

  it('should throw InvalidAllocationError for a non-integer number of parts', () => {
    expect(() => from(100, 'US').allocate(2.5)).toThrow(InvalidAllocationError);
  });
});
