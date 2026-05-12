import { describe, expect, it } from 'vitest';

import { numberToMinorUnit, stringToMinorUnit } from '@/lib/convert';
import { resolveCurrency } from '@/lib/currencies';
import { InvalidInputError } from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

describe('numberToMinorUnit', () => {
  it('should convert a standard decimal to minor units', () => {
    expect(numberToMinorUnit(10.5, 2)).toBe(1050);
  });

  it('should convert an integer amount with no fractional part', () => {
    expect(numberToMinorUnit(100, 2)).toBe(10000);
  });

  it('should return 0 for input 0', () => {
    expect(numberToMinorUnit(0, 2)).toBe(0);
  });

  it('should handle currencies with 0 fraction digits', () => {
    expect(numberToMinorUnit(1500, 0)).toBe(1500);
  });

  it('should handle negative values correctly', () => {
    expect(numberToMinorUnit(-19.99, 2)).toBe(-1999);
  });

  it('should apply rounding to resolve floating-point imprecision', () => {
    expect(numberToMinorUnit(1.005, 2)).toBe(101);
  });

  it('should throw InvalidInputError for Infinity', () => {
    expect(() => numberToMinorUnit(Infinity, 2)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for -Infinity', () => {
    expect(() => numberToMinorUnit(-Infinity, 2)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for NaN', () => {
    expect(() => numberToMinorUnit(NaN, 2)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when the result exceeds Number.MAX_SAFE_INTEGER', () => {
    expect(() => numberToMinorUnit(Number.MAX_SAFE_INTEGER, 2)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when the result is NaN after exponential conversion', () => {
    expect(() => numberToMinorUnit(1e308, 2)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for other large scientific-notation values', () => {
    expect(() => numberToMinorUnit(9.9e307, 2)).toThrow(InvalidInputError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('stringToMinorUnit', () => {
  it('should parse a BRL-formatted string (comma decimal, dot group)', () => {
    const currency = resolveCurrency('BR');
    expect(stringToMinorUnit('1.234,56', currency)).toBe(123456);
  });

  it('should parse a USD-formatted string (dot decimal, comma group)', () => {
    const currency = resolveCurrency('US');
    expect(stringToMinorUnit('1,234.56', currency)).toBe(123456);
  });

  it('should parse a CHF-formatted string (dot decimal, apostrophe group)', () => {
    const currency = resolveCurrency('CH');
    expect(stringToMinorUnit("1'234.56", currency)).toBe(123456);
  });

  it('should parse a EUR/FR-formatted string (comma decimal, space group)', () => {
    const currency = resolveCurrency('FR');
    expect(stringToMinorUnit('1 234,56', currency)).toBe(123456);
  });

  it('should parse a JPY amount with no decimal places', () => {
    const currency = resolveCurrency('JP');
    expect(stringToMinorUnit('1,500', currency)).toBe(1500);
  });

  it('should handle a negative value with a leading minus sign', () => {
    const currency = resolveCurrency('US');
    expect(stringToMinorUnit('-10.50', currency)).toBe(-1050);
  });

  it('should handle a positive value with a leading plus sign', () => {
    const currency = resolveCurrency('US');
    expect(stringToMinorUnit('+10.50', currency)).toBe(1050);
  });

  it('should strip unrecognized non-numeric characters like currency symbols', () => {
    const currency = resolveCurrency('US');
    expect(stringToMinorUnit('$1,234.56', currency)).toBe(123456);
  });

  it('should parse a value with no group separator', () => {
    const currency = resolveCurrency('US');
    expect(stringToMinorUnit('99.99', currency)).toBe(9999);
  });

  it('should throw InvalidInputError when multiple decimal separators are present', () => {
    const currency = resolveCurrency('US');
    expect(() => stringToMinorUnit('1.23.45', currency)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when the string is not parseable as a number', () => {
    const currency = resolveCurrency('US');
    expect(() => stringToMinorUnit('not-a-number', currency)).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when the string is empty after sanitization', () => {
    const currency = resolveCurrency('US');
    expect(() => stringToMinorUnit('$$$', currency)).toThrow(InvalidInputError);
  });
});
