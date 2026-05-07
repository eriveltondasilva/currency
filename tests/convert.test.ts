import { describe, expect, it } from 'vitest';

import { from } from '@/api/creation';
import { toMinorUnit } from '@/lib/convert';
import { resolveCurrency } from '@/lib/currencies';
import { InvalidInputError } from '@/lib/errors';

const usd = resolveCurrency('US');
const brl = resolveCurrency('BR');
const jpy = resolveCurrency('JP');
const chf = resolveCurrency('CH');
const de = resolveCurrency('DE');

// ─── number input ─────────────────────────────────────────────────────────────

describe('toMinorUnit — number', () => {
  it('should convert a positive integer to minor units', () => {
    expect(toMinorUnit(10, usd)).toBe(1000);
  });

  it('should convert zero to 0', () => {
    expect(toMinorUnit(0, usd)).toBe(0);
  });

  it('should convert a negative decimal to minor units preserving sign', () => {
    expect(toMinorUnit(-5.5, usd)).toBe(-550);
  });

  it('should convert 0.1 without floating-point error', () => {
    expect(toMinorUnit(0.1, usd)).toBe(10);
  });

  it('should convert 0.2 without floating-point error', () => {
    expect(toMinorUnit(0.2, usd)).toBe(20);
  });

  it('should convert 0.1 + 0.2 without floating-point error', () => {
    expect(toMinorUnit(0.1 + 0.2, usd)).toBe(30);
  });

  it('should convert a JPY amount as a whole unit when fractionDigits is 0', () => {
    expect(toMinorUnit(1500, jpy)).toBe(1500);
  });

  it('should throw InvalidInputError for NaN', () => {
    expect(() => toMinorUnit(NaN, usd)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for +Infinity', () => {
    expect(() => toMinorUnit(Infinity, usd)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for -Infinity', () => {
    expect(() => toMinorUnit(-Infinity, usd)).toThrow(InvalidInputError);
  });
});

// ─── string input ─────────────────────────────────────────────────────────────

describe('toMinorUnit — string', () => {
  it('should parse a plain decimal string for USD', () => {
    expect(toMinorUnit('10.50', usd)).toBe(1050);
  });

  it('should parse a USD string with grouping separator', () => {
    expect(toMinorUnit('1,500.00', usd)).toBe(150000);
  });

  it('should parse a string with $ currency symbol', () => {
    expect(toMinorUnit('$10.99', usd)).toBe(1099);
  });

  it('should parse a BRL string with comma as decimal and dot as group separator', () => {
    expect(toMinorUnit('1.500,00', brl)).toBe(150000);
  });

  it('should parse a BRL string with R$ currency symbol', () => {
    expect(toMinorUnit('R$ 1.500,00', brl)).toBe(150000);
  });

  it('should parse a CHF string with apostrophe as grouping separator', () => {
    expect(toMinorUnit("1'000.50", chf)).toBe(100050);
  });

  it('should parse a DE (EUR) string with dot as group and comma as decimal separator', () => {
    expect(toMinorUnit('1.500,99', de)).toBe(150099);
  });

  it('should parse a negative string value', () => {
    expect(toMinorUnit('-25.00', usd)).toBe(-2500);
  });

  it('should throw InvalidInputError for a fully non-numeric string', () => {
    expect(() => toMinorUnit('abc', usd)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a string with only currency symbol', () => {
    expect(() => toMinorUnit('R$', brl)).toThrow(InvalidInputError);
  });
});

// ─── null / undefined ─────────────────────────────────────────────────────────

describe('toMinorUnit — null and undefined', () => {
  it('should throw InvalidInputError for null', () => {
    expect(() => toMinorUnit(null, usd)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for undefined', () => {
    expect(() => toMinorUnit(undefined, usd)).toThrow(InvalidInputError);
  });
});

// ─── unsupported types ────────────────────────────────────────────────────────

describe('toMinorUnit — unsupported types', () => {
  it('should throw InvalidInputError for a boolean', () => {
    expect(() => toMinorUnit(true, usd)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a plain object', () => {
    expect(() => toMinorUnit({}, usd)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for an array', () => {
    expect(() => toMinorUnit([10], usd)).toThrow(InvalidInputError);
  });
});

// ─── MoneyContract input ──────────────────────────────────────────────────────

describe('toMinorUnit — MoneyContract', () => {
  it('should return amount() of a positive MoneyContract without re-converting', () => {
    const money = from(10.5, 'US');
    expect(toMinorUnit(money, usd)).toBe(1050);
  });

  it('should return amount() of a zero MoneyContract', () => {
    const money = from(0, 'US');
    expect(toMinorUnit(money, usd)).toBe(0);
  });

  it('should return amount() of a negative MoneyContract', () => {
    const money = from(-5, 'US');
    expect(toMinorUnit(money, usd)).toBe(-500);
  });
});
