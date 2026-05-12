import { describe, expect, it } from 'vitest';

import { from, zero } from '@/api/creation';

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.isZero', () => {
  it('should return true for a zero instance', () => {
    expect(zero('US').isZero()).toBe(true);
  });

  it('should return true when created from 0', () => {
    expect(from(0, 'US').isZero()).toBe(true);
  });

  it('should return false for a positive amount', () => {
    expect(from(1, 'US').isZero()).toBe(false);
  });

  it('should return false for a negative amount', () => {
    expect(from(-1, 'US').isZero()).toBe(false);
  });

  it('should return false for the smallest possible non-zero amount', () => {
    expect(from(0.01, 'US').isZero()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.isPositive', () => {
  it('should return true for a positive amount', () => {
    expect(from(1, 'US').isPositive()).toBe(true);
  });

  it('should return false for zero', () => {
    expect(zero('US').isPositive()).toBe(false);
  });

  it('should return false for a negative amount', () => {
    expect(from(-1, 'US').isPositive()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.isNegative', () => {
  it('should return true for a negative amount', () => {
    expect(from(-1, 'US').isNegative()).toBe(true);
  });

  it('should return false for zero', () => {
    expect(zero('US').isNegative()).toBe(false);
  });

  it('should return false for a positive amount', () => {
    expect(from(1, 'US').isNegative()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('state after arithmetic', () => {
  it('should become zero after subtracting the full amount', () => {
    const price = from(50, 'US');
    expect(price.minus(price).isZero()).toBe(true);
  });

  it('should become negative after negating a positive amount', () => {
    expect(from(10, 'US').negate().isNegative()).toBe(true);
  });

  it('should become positive after taking abs of a negative amount', () => {
    expect(from(-10, 'US').abs().isPositive()).toBe(true);
  });
});
