/** biome-ignore-all lint/style/noNonNullAssertion: test file */
import { describe, expect, it } from 'vitest';

import { from, zero } from '@/api/creation';
import { InvalidAllocationError, InvalidPercentageError } from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.percentOf', () => {
  it('should return half of the amount for 50%', () => {
    expect(from(100, 'US').percentOf(50).minorUnits()).toBe(5000);
  });

  it('should return zero for 0%', () => {
    expect(from(100, 'US').percentOf(0).isZero()).toBe(true);
  });

  it('should return a clone for 100%', () => {
    expect(from(100, 'US').percentOf(100).minorUnits()).toBe(10000);
  });

  it('should handle a non-round percentage', () => {
    expect(from(100, 'US').percentOf(33).minorUnits()).toBe(3300);
  });

  it('should handle a percentage over 100', () => {
    expect(from(100, 'US').percentOf(150).minorUnits()).toBe(15000);
  });

  it('should apply the specified rounding mode', () => {
    const floor = from(10, 'US').percentOf(33.33, 'floor').minorUnits();
    const ceil = from(10, 'US').percentOf(33.33, 'ceil').minorUnits();
    expect(ceil).toBeGreaterThanOrEqual(floor);
  });

  it('should throw InvalidPercentageError for a negative percentage', () => {
    expect(() => from(100, 'US').percentOf(-1)).toThrow(InvalidPercentageError);
  });

  it('should throw InvalidPercentageError for Infinity', () => {
    expect(() => from(100, 'US').percentOf(Infinity)).toThrow(InvalidPercentageError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.applyDiscount', () => {
  it('should reduce the amount by the given percentage', () => {
    expect(from(100, 'US').applyDiscount(10).minorUnits()).toBe(9000);
  });

  it('should return a clone for a 0% discount', () => {
    expect(from(100, 'US').applyDiscount(0).minorUnits()).toBe(10000);
  });

  it('should return zero for a 100% discount', () => {
    expect(from(100, 'US').applyDiscount(100).isZero()).toBe(true);
  });

  it('should handle a fractional discount', () => {
    expect(from(200, 'US').applyDiscount(12.5).minorUnits()).toBe(17500);
  });

  it('should not mutate the original instance', () => {
    const original = from(100, 'US');
    original.applyDiscount(10);
    expect(original.minorUnits()).toBe(10000);
  });

  it('should throw InvalidPercentageError for a negative discount', () => {
    expect(() => from(100, 'US').applyDiscount(-1)).toThrow(InvalidPercentageError);
  });

  it('should throw InvalidPercentageError for a discount above 100', () => {
    expect(() => from(100, 'US').applyDiscount(101)).toThrow(InvalidPercentageError);
  });

  it('should throw InvalidPercentageError for Infinity', () => {
    expect(() => from(100, 'US').applyDiscount(Infinity)).toThrow(InvalidPercentageError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.applySurcharge', () => {
  it('should increase the amount by the given percentage', () => {
    expect(from(100, 'US').applySurcharge(10).minorUnits()).toBe(11000);
  });

  it('should return a clone for a 0% surcharge', () => {
    expect(from(100, 'US').applySurcharge(0).minorUnits()).toBe(10000);
  });

  it('should handle a fractional surcharge', () => {
    expect(from(200, 'US').applySurcharge(12.5).minorUnits()).toBe(22500);
  });

  it('should not mutate the original instance', () => {
    const original = from(100, 'US');
    original.applySurcharge(10);
    expect(original.minorUnits()).toBe(10000);
  });

  it('should throw InvalidPercentageError for a negative surcharge', () => {
    expect(() => from(100, 'US').applySurcharge(-1)).toThrow(InvalidPercentageError);
  });

  it('should throw InvalidPercentageError for Infinity', () => {
    expect(() => from(100, 'US').applySurcharge(Infinity)).toThrow(InvalidPercentageError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.allocate', () => {
  it('should split the amount into equal parts', () => {
    const parts = from(100, 'US').allocate(4);
    expect(parts).toHaveLength(4);
    expect(parts.every((p) => p.minorUnits() === 2500)).toBe(true);
  });

  it('should distribute the remainder into the leading parts', () => {
    const parts = from(10, 'US').allocate(3);
    const units = parts.map((p) => p.minorUnits());
    expect(units).toEqual([334, 333, 333]);
  });

  it('should ensure the sum of all parts equals the original amount', () => {
    const original = from(10, 'US');
    const parts = original.allocate(3);
    const total = parts.reduce((acc, p) => acc + p.minorUnits(), 0);
    expect(total).toBe(original.minorUnits());
  });

  it('should return an array with a clone for 1 part', () => {
    const parts = from(100, 'US').allocate(1);
    expect(parts).toHaveLength(1);
    expect(parts[0]!.minorUnits()).toBe(10000);
  });

  it('should return all zeros when allocating a zero amount', () => {
    const parts = zero('US').allocate(3);
    expect(parts.every((p) => p.isZero())).toBe(true);
  });

  it('should handle negative amounts by distributing the remainder in leading parts', () => {
    const parts = from(-10, 'US').allocate(3);
    const units = parts.map((p) => p.minorUnits());
    expect(units).toEqual([-334, -333, -333]);
  });

  it('should throw InvalidAllocationError for 0 parts', () => {
    expect(() => from(100, 'US').allocate(0)).toThrow(InvalidAllocationError);
  });

  it('should throw InvalidAllocationError for a negative number of parts', () => {
    expect(() => from(100, 'US').allocate(-1)).toThrow(InvalidAllocationError);
  });

  it('should throw InvalidAllocationError for a float number of parts', () => {
    expect(() => from(100, 'US').allocate(1.5)).toThrow(InvalidAllocationError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.allocateByRatio', () => {
  it('should distribute amounts proportionally by ratio', () => {
    const parts = from(100, 'US').allocateByRatio([1, 2, 3]);
    const units = parts.map((p) => p.minorUnits());
    expect(units).toEqual([1667, 3333, 5000]);
  });

  it('should ensure the sum of all parts equals the original amount', () => {
    const original = from(100, 'US');
    const parts = original.allocateByRatio([1, 2, 3]);
    const total = parts.reduce((acc, p) => acc + p.minorUnits(), 0);
    expect(total).toBe(original.minorUnits());
  });

  it('should handle a [30, 70] ratio split', () => {
    const parts = from(100, 'US').allocateByRatio([30, 70]);
    expect(parts[0]!.minorUnits()).toBe(3000);
    expect(parts[1]!.minorUnits()).toBe(7000);
  });

  it('should return all zeros when distributing a zero amount', () => {
    const parts = zero('US').allocateByRatio([1, 2, 3]);
    expect(parts.every((p) => p.isZero())).toBe(true);
  });

  it('should handle a ratio array containing zero', () => {
    const parts = from(100, 'US').allocateByRatio([0, 1]);
    expect(parts[0]!.isZero()).toBe(true);
    expect(parts[1]!.minorUnits()).toBe(10000);
  });

  it('should throw InvalidAllocationError for an empty ratios array', () => {
    expect(() => from(100, 'US').allocateByRatio([])).toThrow(InvalidAllocationError);
  });

  it('should throw InvalidAllocationError when the sum of ratios is zero', () => {
    expect(() => from(100, 'US').allocateByRatio([0, 0])).toThrow(InvalidAllocationError);
  });

  it('should throw InvalidAllocationError for a negative ratio', () => {
    expect(() => from(100, 'US').allocateByRatio([1, -1])).toThrow(InvalidAllocationError);
  });

  it('should throw InvalidAllocationError for a non-integer ratio', () => {
    expect(() => from(100, 'US').allocateByRatio([0.5, 0.5])).toThrow(InvalidAllocationError);
  });

  it('should throw InvalidAllocationError for Infinity in ratios', () => {
    expect(() => from(100, 'US').allocateByRatio([1, Infinity])).toThrow(InvalidAllocationError);
  });
});
