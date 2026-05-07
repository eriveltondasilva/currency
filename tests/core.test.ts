import { describe, expect, it } from 'vitest';

import { from, fromMinorUnits, zero } from '@/api/creation';
import { InvalidInputError } from '@/lib/errors';

// ─── amount() and value() ─────────────────────────────────────────────────────

describe('Money.amount and value', () => {
  it('should return minor units from amount()', () => {
    const money = from(10.5, 'US');
    expect(money.amount()).toBe(1050);
  });

  it('should return the decimal value from value()', () => {
    const money = from(10.5, 'US');
    expect(money.value()).toBe(10.5);
  });

  it('should return 0 for amount() and value() when created from zero', () => {
    const money = zero('US');
    expect(money.amount()).toBe(0);
    expect(money.value()).toBe(0);
  });

  it('should return negative minor units for a negative value', () => {
    const money = from(-25, 'US');
    expect(money.amount()).toBe(-2500);
  });

  it('should return the full integer value as minor units for JPY', () => {
    const money = from(1500, 'JP');
    expect(money.amount()).toBe(1500);
    expect(money.value()).toBe(1500);
  });
});

// ─── integer() and cents() ────────────────────────────────────────────────────

describe('Money.integer and cents', () => {
  it('should return the integer part of a positive value', () => {
    const money = from(10.75, 'US');
    expect(money.integer()).toBe(10);
  });

  it('should return the fractional part of a positive value', () => {
    const money = from(10.75, 'US');
    expect(money.cents()).toBe(75);
  });

  it('should return the absolute integer part for a negative value', () => {
    const money = from(-10.75, 'US');
    expect(money.integer()).toBe(10);
  });

  it('should return the absolute fractional part for a negative value', () => {
    const money = from(-10.75, 'US');
    expect(money.cents()).toBe(75);
  });

  it('should return 0 cents for a whole number', () => {
    const money = from(5, 'US');
    expect(money.cents()).toBe(0);
  });

  it('should return 0 cents for JPY since it has no fractionDigits', () => {
    const money = from(1500, 'JP');
    expect(money.cents()).toBe(0);
  });
});

// ─── units() ─────────────────────────────────────────────────────────────────

describe('Money.units', () => {
  it('should return [integer, cents] tuple for a positive value', () => {
    const money = from(19.99, 'US');
    expect(money.units()).toEqual([19, 99]);
  });

  it('should return absolute [integer, cents] for a negative value', () => {
    const money = from(-19.99, 'US');
    expect(money.units()).toEqual([19, 99]);
  });

  it('should return [0, 0] for zero', () => {
    expect(zero('US').units()).toEqual([0, 0]);
  });
});

// ─── currencyCode() and locale() ─────────────────────────────────────────────

describe('Money.currencyCode and locale', () => {
  it('should return USD for a US money instance', () => {
    expect(from(1, 'US').currencyCode()).toBe('USD');
  });

  it('should return BRL for a BR money instance', () => {
    expect(from(1, 'BR').currencyCode()).toBe('BRL');
  });

  it('should return JPY for a JP money instance', () => {
    expect(from(1, 'JP').currencyCode()).toBe('JPY');
  });

  it('should return en-US locale for a US money instance', () => {
    expect(from(1, 'US').locale()).toBe('en-US');
  });

  it('should return pt-BR locale for a BR money instance', () => {
    expect(from(1, 'BR').locale()).toBe('pt-BR');
  });
});

// ─── isZero / isPositive / isNegative ────────────────────────────────────────

describe('Money.isZero', () => {
  it('should return true for a zero value', () => {
    expect(zero('US').isZero()).toBe(true);
  });

  it('should return false for a positive value', () => {
    expect(from(1, 'US').isZero()).toBe(false);
  });

  it('should return false for a negative value', () => {
    expect(from(-1, 'US').isZero()).toBe(false);
  });
});

describe('Money.isPositive', () => {
  it('should return true for a positive value', () => {
    expect(from(0.01, 'US').isPositive()).toBe(true);
  });

  it('should return false for zero', () => {
    expect(zero('US').isPositive()).toBe(false);
  });

  it('should return false for a negative value', () => {
    expect(from(-1, 'US').isPositive()).toBe(false);
  });
});

describe('Money.isNegative', () => {
  it('should return true for a negative value', () => {
    expect(from(-0.01, 'US').isNegative()).toBe(true);
  });

  it('should return false for zero', () => {
    expect(zero('US').isNegative()).toBe(false);
  });

  it('should return false for a positive value', () => {
    expect(from(1, 'US').isNegative()).toBe(false);
  });
});

// ─── clone() ─────────────────────────────────────────────────────────────────

describe('Money.clone', () => {
  it('should return a new instance with the same value', () => {
    const money = from(42.5, 'US');
    const cloned = money.clone();
    expect(cloned.value()).toBe(42.5);
  });

  it('should return a different reference than the original', () => {
    const money = from(42.5, 'US');
    expect(money.clone()).not.toBe(money);
  });

  it('should preserve currency code in the clone', () => {
    const money = from(100, 'BR');
    expect(money.clone().currencyCode()).toBe('BRL');
  });
});

// ─── toJSON() ────────────────────────────────────────────────────────────────

describe('Money.toJSON', () => {
  it('should return amount in minor units and currencyCode', () => {
    const money = from(10.5, 'US');
    expect(money.toJSON()).toEqual({ amount: 1050, currencyCode: 'USD' });
  });

  it('should return amount 0 for zero value', () => {
    expect(zero('BR').toJSON()).toEqual({ amount: 0, currencyCode: 'BRL' });
  });

  it('should return negative minor units for a negative value', () => {
    expect(from(-5, 'US').toJSON()).toEqual({ amount: -500, currencyCode: 'USD' });
  });
});

// ─── toString() ──────────────────────────────────────────────────────────────

describe('Money.toString', () => {
  it('should return the decimal string with 2 fraction digits for USD', () => {
    expect(from(10.5, 'US').toString()).toBe('10.50');
  });

  it('should return the decimal string with 2 fraction digits for a whole number', () => {
    expect(from(100, 'US').toString()).toBe('100.00');
  });

  it('should return a string with 0 fraction digits for JPY', () => {
    expect(from(1500, 'JP').toString()).toBe('1500');
  });

  it('should return the decimal string for a negative value', () => {
    expect(from(-9.99, 'US').toString()).toBe('-9.99');
  });
});

// ─── valueOf() ───────────────────────────────────────────────────────────────

describe('Money.valueOf', () => {
  it('should return the same result as value()', () => {
    const money = from(10.5, 'US');
    expect(money.valueOf()).toBe(money.value());
  });

  it('should allow numeric coercion via valueOf()', () => {
    const money = from(10, 'US');
    expect(+money).toBe(10);
  });
});

// ─── fromMinorUnits() ─────────────────────────────────────────────────────────

describe('Money.fromMinorUnits', () => {
  it('should create a money instance from integer minor units', () => {
    expect(fromMinorUnits(1050, 'US').value()).toBe(10.5);
  });

  it('should create a zero instance from 0 minor units', () => {
    expect(fromMinorUnits(0, 'US').isZero()).toBe(true);
  });

  it('should throw InvalidInputError for a float input', () => {
    expect(() => fromMinorUnits(10.5, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for Infinity', () => {
    expect(() => fromMinorUnits(Infinity, 'US')).toThrow(InvalidInputError);
  });
});
