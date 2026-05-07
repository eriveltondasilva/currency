import { describe, expect, it } from 'vitest';

import { from, zero } from '@/api/creation';
import { CurrencyMismatchError, DivisionByZeroError, InvalidInputError } from '@/lib/errors';

// ─── plus() ───────────────────────────────────────────────────────────────────

describe('Money.plus', () => {
  it('should add two positive values', () => {
    expect(from(10, 'US').plus(5).value()).toBe(15);
  });

  it('should add a decimal without floating-point error', () => {
    expect(from(0.1, 'US').plus(0.2).value()).toBe(0.3);
  });

  it('should add a string input', () => {
    expect(from(10, 'US').plus('5.50').value()).toBe(15.5);
  });

  it('should add a MoneyContract input', () => {
    const other = from(3, 'US');
    expect(from(7, 'US').plus(other).value()).toBe(10);
  });

  it('should return a negative result when sum is negative', () => {
    expect(from(-10, 'US').plus(3).value()).toBe(-7);
  });

  it('should return a new instance leaving the original unchanged', () => {
    const money = from(10, 'US');
    money.plus(5);
    expect(money.value()).toBe(10);
  });

  it('should throw CurrencyMismatchError when adding different currencies', () => {
    expect(() => from(10, 'US').plus(from(5, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─── minus() ──────────────────────────────────────────────────────────────────

describe('Money.minus', () => {
  it('should subtract two positive values', () => {
    expect(from(10, 'US').minus(3).value()).toBe(7);
  });

  it('should subtract a decimal without floating-point error', () => {
    expect(from(0.3, 'US').minus(0.1).value()).toBe(0.2);
  });

  it('should produce a negative result when subtrahend is larger', () => {
    expect(from(5, 'US').minus(10).value()).toBe(-5);
  });

  it('should subtract a string input', () => {
    expect(from(10, 'US').minus('4.25').value()).toBe(5.75);
  });

  it('should return a new instance leaving the original unchanged', () => {
    const money = from(10, 'US');
    money.minus(3);
    expect(money.value()).toBe(10);
  });

  it('should throw CurrencyMismatchError when subtracting different currencies', () => {
    expect(() => from(10, 'US').minus(from(5, 'BR'))).toThrow(CurrencyMismatchError);
  });
});

// ─── times() ──────────────────────────────────────────────────────────────────

describe('Money.times', () => {
  it('should multiply by a positive integer', () => {
    expect(from(10, 'US').times(3).value()).toBe(30);
  });

  it('should multiply by a decimal factor', () => {
    expect(from(10, 'US').times(1.5).value()).toBe(15);
  });

  it('should return zero when factor is 0', () => {
    expect(from(100, 'US').times(0).isZero()).toBe(true);
  });

  it('should multiply by a negative factor', () => {
    expect(from(10, 'US').times(-2).value()).toBe(-20);
  });

  it('should return a new instance leaving the original unchanged', () => {
    const money = from(10, 'US');
    money.times(3);
    expect(money.value()).toBe(10);
  });

  it('should throw InvalidInputError for Infinity as factor', () => {
    expect(() => from(10, 'US').times(Infinity)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for NaN as factor', () => {
    expect(() => from(10, 'US').times(NaN)).toThrow(InvalidInputError);
  });
});

// ─── dividedBy() ──────────────────────────────────────────────────────────────

describe('Money.dividedBy', () => {
  it('should divide by a positive integer', () => {
    expect(from(10, 'US').dividedBy(2).value()).toBe(5);
  });

  it('should divide by a decimal divisor', () => {
    expect(from(10, 'US').dividedBy(4).value()).toBe(2.5);
  });

  it('should return the same value when dividing by 1', () => {
    expect(from(10, 'US').dividedBy(1).value()).toBe(10);
  });

  it('should divide a negative value', () => {
    expect(from(-10, 'US').dividedBy(2).value()).toBe(-5);
  });

  it('should return a new instance leaving the original unchanged', () => {
    const money = from(10, 'US');
    money.dividedBy(2);
    expect(money.value()).toBe(10);
  });

  it('should throw DivisionByZeroError when divisor is 0', () => {
    expect(() => from(10, 'US').dividedBy(0)).toThrow(DivisionByZeroError);
  });

  it('should throw InvalidInputError for Infinity as divisor', () => {
    expect(() => from(10, 'US').dividedBy(Infinity)).toThrow(InvalidInputError);
  });
});

// ─── absolute() ───────────────────────────────────────────────────────────────

describe('Money.absolute', () => {
  it('should return the same value for a positive amount', () => {
    expect(from(10, 'US').absolute().value()).toBe(10);
  });

  it('should return the positive value for a negative amount', () => {
    expect(from(-10, 'US').absolute().value()).toBe(10);
  });

  it('should return zero for a zero amount', () => {
    expect(zero('US').absolute().isZero()).toBe(true);
  });
});

// ─── negate() ─────────────────────────────────────────────────────────────────

describe('Money.negate', () => {
  it('should negate a positive value to negative', () => {
    expect(from(10, 'US').negate().value()).toBe(-10);
  });

  it('should negate a negative value to positive', () => {
    expect(from(-10, 'US').negate().value()).toBe(10);
  });

  it('should return zero when negating zero', () => {
    expect(zero('US').negate().isZero()).toBe(true);
  });
});

// ─── max() ────────────────────────────────────────────────────────────────────

describe('Money.max', () => {
  it('should return itself when greater than the input', () => {
    expect(from(10, 'US').max(5).value()).toBe(10);
  });

  it('should return the input when it is greater', () => {
    expect(from(5, 'US').max(10).value()).toBe(10);
  });

  it('should return itself when equal to the input', () => {
    expect(from(10, 'US').max(10).value()).toBe(10);
  });

  it('should work correctly with negative values', () => {
    expect(from(-3, 'US').max(-10).value()).toBe(-3);
  });
});

// ─── min() ────────────────────────────────────────────────────────────────────

describe('Money.min', () => {
  it('should return itself when less than the input', () => {
    expect(from(5, 'US').min(10).value()).toBe(5);
  });

  it('should return the input when it is smaller', () => {
    expect(from(10, 'US').min(5).value()).toBe(5);
  });

  it('should return itself when equal to the input', () => {
    expect(from(10, 'US').min(10).value()).toBe(10);
  });

  it('should work correctly with negative values', () => {
    expect(from(-3, 'US').min(-10).value()).toBe(-10);
  });
});

// ─── round() ──────────────────────────────────────────────────────────────────

describe('Money.round — halfExpand (default)', () => {
  it('should round to nearest step', () => {
    expect(from(10.03, 'US').round(5).value()).toBe(10.05);
  });

  it('should round down when closer to lower step', () => {
    expect(from(10.02, 'US').round(5).value()).toBe(10.0);
  });

  it('should round tie away from zero for a positive value', () => {
    expect(from(10.05, 'US').round(10).value()).toBe(10.1);
  });

  it('should round tie away from zero for a negative value', () => {
    expect(from(-10.05, 'US').round(10).value()).toBe(-10.1);
  });

  it('should be symmetric — positive and negative ties produce the same magnitude', () => {
    const pos = from(10.05, 'US').round(10).value();
    const neg = from(-10.05, 'US').round(10).value();
    expect(Math.abs(pos)).toBe(Math.abs(neg));
  });
});

describe('Money.round — ceil (toward +∞)', () => {
  it('should round up for a positive value', () => {
    expect(from(10.01, 'US').round(5, 'ceil').value()).toBe(10.05);
  });

  it('should round toward +∞ for a negative value', () => {
    expect(from(-10.09, 'US').round(5, 'ceil').value()).toBe(-10.05);
  });
});

describe('Money.round — floor (toward -∞)', () => {
  it('should round down for a positive value', () => {
    expect(from(10.09, 'US').round(5, 'floor').value()).toBe(10.05);
  });

  it('should round toward -∞ for a negative value', () => {
    expect(from(-10.01, 'US').round(5, 'floor').value()).toBe(-10.05);
  });
});

describe('Money.round — trunc (toward 0)', () => {
  it('should truncate a positive value toward zero', () => {
    expect(from(10.09, 'US').round(5, 'trunc').value()).toBe(10.05);
  });

  it('should truncate a negative value toward zero', () => {
    expect(from(-10.09, 'US').round(5, 'trunc').value()).toBe(-10.05);
  });
});

describe('Money.round — expand (away from 0)', () => {
  it('should round a positive value away from zero', () => {
    expect(from(10.01, 'US').round(5, 'expand').value()).toBe(10.05);
  });

  it('should round a negative value away from zero', () => {
    expect(from(-10.01, 'US').round(5, 'expand').value()).toBe(-10.05);
  });

  it('should round a larger negative value away from zero', () => {
    expect(from(-10.09, 'US').round(5, 'expand').value()).toBe(-10.1);
  });
});

describe('Money.round — halfExpand (nearest, ties away from 0)', () => {
  it('should round a positive tie away from zero', () => {
    expect(from(10.05, 'US').round(10, 'halfExpand').value()).toBe(10.1);
  });

  it('should round a negative tie away from zero', () => {
    expect(from(-10.05, 'US').round(10, 'halfExpand').value()).toBe(-10.1);
  });

  it('should produce symmetric results for positive and negative ties', () => {
    const pos = from(10.05, 'US').round(10, 'halfExpand').value();
    const neg = from(-10.05, 'US').round(10, 'halfExpand').value();
    expect(pos).toBe(Math.abs(neg));
  });

  it('should behave like round when not on a tie', () => {
    expect(from(10.03, 'US').round(10, 'halfExpand').value()).toBe(10.0);
    expect(from(10.07, 'US').round(10, 'halfExpand').value()).toBe(10.1);
  });
});

describe("Money.round — halfEven (banker's rounding)", () => {
  it('should round half to nearest even — even floor wins', () => {
    expect(from(10.05, 'US').round(10, 'halfEven').value()).toBe(10.0);
  });

  it('should round half to nearest even — odd floor loses', () => {
    expect(from(10.15, 'US').round(10, 'halfEven').value()).toBe(10.2);
  });

  it('should round half to nearest even for a second even case', () => {
    expect(from(10.25, 'US').round(10, 'halfEven').value()).toBe(10.2);
  });

  it('should behave like round when not on a tie', () => {
    expect(from(10.03, 'US').round(10, 'halfEven').value()).toBe(10.0);
    expect(from(10.07, 'US').round(10, 'halfEven').value()).toBe(10.1);
  });

  it("should apply banker's rounding to a negative tie", () => {
    expect(from(-10.05, 'US').round(10, 'halfEven').value()).toBe(-10.0);
  });
});

describe('Money.round — guards', () => {
  it('should return the original value unchanged when step is 1', () => {
    expect(from(10.03, 'US').round(1).value()).toBe(10.03);
  });

  it('should return zero unchanged regardless of step', () => {
    expect(zero('US').round(5).isZero()).toBe(true);
  });

  it('should throw InvalidInputError for a non-integer step', () => {
    expect(() => from(10, 'US').round(0.5)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for step less than 1', () => {
    expect(() => from(10, 'US').round(0)).toThrow(InvalidInputError);
  });
});
