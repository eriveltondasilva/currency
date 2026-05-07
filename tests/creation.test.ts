import { describe, expect, it } from 'vitest';

import { from, fromMinorUnits, zero } from '@/api/creation';
import { InvalidInputError, UnsupportedCurrencyError } from '@/lib/errors';

// ─── from() ───────────────────────────────────────────────────────────────────

describe('from — number input', () => {
  it('should create a money instance from a positive number', () => {
    expect(from(10.5, 'US').value()).toBe(10.5);
  });

  it('should create a money instance from zero', () => {
    expect(from(0, 'US').isZero()).toBe(true);
  });

  it('should create a money instance from a negative number', () => {
    expect(from(-25, 'US').value()).toBe(-25);
  });

  it('should default to US when no country is provided', () => {
    expect(from(10).currencyCode()).toBe('USD');
  });

  it('should use the provided country to set the currency code', () => {
    expect(from(10, 'BR').currencyCode()).toBe('BRL');
  });

  it('should use the provided country to set the locale', () => {
    expect(from(10, 'BR').locale()).toBe('pt-BR');
  });

  it('should throw InvalidInputError for NaN', () => {
    expect(() => from(NaN, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for Infinity', () => {
    expect(() => from(Infinity, 'US')).toThrow(InvalidInputError);
  });
});

describe('from — string input', () => {
  it('should create a money instance from a plain decimal string', () => {
    expect(from('10.50', 'US').value()).toBe(10.5);
  });

  it('should create a money instance from a BRL formatted string', () => {
    expect(from('1.500,00', 'BR').value()).toBe(1500);
  });

  it('should create a money instance from a string with currency symbol', () => {
    expect(from('$19.99', 'US').value()).toBe(19.99);
  });

  it('should create a money instance from a negative string', () => {
    expect(from('-50.00', 'US').value()).toBe(-50);
  });

  it('should throw InvalidInputError for a non-numeric string', () => {
    expect(() => from('abc', 'US')).toThrow(InvalidInputError);
  });
});

describe('from — MoneyContract input', () => {
  it('should create a money instance from an existing MoneyContract', () => {
    const original = from(42, 'US');
    expect(from(original, 'US').value()).toBe(42);
  });

  it('should return a new instance distinct from the original', () => {
    const original = from(42, 'US');
    expect(from(original, 'US')).not.toBe(original);
  });

  it('should preserve the value when wrapping a MoneyContract', () => {
    const original = from(99.99, 'US');
    expect(from(original, 'US').amount()).toBe(original.amount());
  });
});

describe('from — country resolution', () => {
  it('should resolve JP to JPY with fractionDigits 0', () => {
    const money = from(1500, 'JP');
    expect(money.currencyCode()).toBe('JPY');
    expect(money.amount()).toBe(1500);
  });

  it('should resolve DE to EUR', () => {
    expect(from(10, 'DE').currencyCode()).toBe('EUR');
  });

  it('should throw UnsupportedCurrencyError for an unknown country code', () => {
    expect(() => from(10, 'XX' as never)).toThrow(UnsupportedCurrencyError);
  });
});

// ─── fromMinorUnits() ─────────────────────────────────────────────────────────

describe('fromMinorUnits', () => {
  it('should create a money instance from integer minor units', () => {
    expect(fromMinorUnits(1050, 'US').value()).toBe(10.5);
  });

  it('should create a zero instance from 0', () => {
    expect(fromMinorUnits(0, 'US').isZero()).toBe(true);
  });

  it('should create a money instance from negative minor units', () => {
    expect(fromMinorUnits(-500, 'US').value()).toBe(-5);
  });

  it('should default to US when no country is provided', () => {
    expect(fromMinorUnits(100).currencyCode()).toBe('USD');
  });

  it('should work with JPY where 1500 minor units equals 1500 value', () => {
    const money = fromMinorUnits(1500, 'JP');
    expect(money.value()).toBe(1500);
    expect(money.amount()).toBe(1500);
  });

  it('should set the correct currency code for the given country', () => {
    expect(fromMinorUnits(100, 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw InvalidInputError for a float amount', () => {
    expect(() => fromMinorUnits(10.5, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for Infinity', () => {
    expect(() => fromMinorUnits(Infinity, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for NaN', () => {
    expect(() => fromMinorUnits(NaN, 'US')).toThrow(InvalidInputError);
  });

  it('should throw UnsupportedCurrencyError for an unknown country code', () => {
    expect(() => fromMinorUnits(100, 'XX' as never)).toThrow(UnsupportedCurrencyError);
  });
});

// ─── zero() ───────────────────────────────────────────────────────────────────

describe('zero', () => {
  it('should return a money instance with isZero() true', () => {
    expect(zero('US').isZero()).toBe(true);
  });

  it('should return a money instance with value 0', () => {
    expect(zero('US').value()).toBe(0);
  });

  it('should return a money instance with amount 0', () => {
    expect(zero('US').amount()).toBe(0);
  });

  it('should default to US when no country is provided', () => {
    expect(zero().currencyCode()).toBe('USD');
  });

  it('should use the provided country to set the currency code', () => {
    expect(zero('JP').currencyCode()).toBe('JPY');
  });

  it('should return a non-positive and non-negative instance', () => {
    expect(zero('US').isPositive()).toBe(false);
    expect(zero('US').isNegative()).toBe(false);
  });

  it('should throw UnsupportedCurrencyError for an unknown country code', () => {
    expect(() => zero('XX' as never)).toThrow(UnsupportedCurrencyError);
  });
});
