import { describe, expect, it } from 'vitest';

import { from, fromMinorUnits, InvalidInputError, parse, zero } from '@/index';

describe('from', () => {
  it('should create a Money instance with the correct minor units', () => {
    expect(from(10.5, 'BR').minorUnits()).toBe(1050);
  });

  it('should create a Money instance with the correct currency code', () => {
    expect(from(10.5, 'BR').currencyCode()).toBe('BRL');
  });

  it('should handle a whole number without fractional part', () => {
    expect(from(100, 'US').minorUnits()).toBe(10000);
  });

  it('should handle a negative value', () => {
    expect(from(-19.99, 'US').minorUnits()).toBe(-1999);
  });

  it('should create a zero-amount instance from 0', () => {
    expect(from(0, 'US').isZero()).toBe(true);
  });

  it('should handle currencies with 0 fraction digits', () => {
    expect(from(1500, 'JP').minorUnits()).toBe(1500);
  });

  it('should throw InvalidInputError for null', () => {
    expect(() => from(null as unknown as number, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a non-number value', () => {
    expect(() => from('10' as unknown as number, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for Infinity', () => {
    expect(() => from(Infinity, 'US')).toThrow(InvalidInputError);
  });
});

describe('parse', () => {
  it('should parse a BRL-formatted string', () => {
    expect(parse('1.234,56', 'BR').minorUnits()).toBe(123456);
  });

  it('should parse a USD-formatted string', () => {
    expect(parse('1,234.56', 'US').minorUnits()).toBe(123456);
  });

  it('should parse a string with a currency symbol', () => {
    expect(parse('R$ 10,50', 'BR').minorUnits()).toBe(1050);
  });

  it('should parse a negative formatted string', () => {
    expect(parse('-10,50', 'BR').minorUnits()).toBe(-1050);
  });

  it('should assign the correct currency code to the parsed instance', () => {
    expect(parse('10.00', 'US').currencyCode()).toBe('USD');
  });

  it('should throw InvalidInputError for null', () => {
    expect(() => parse(null as unknown as string, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a non-string value', () => {
    expect(() => parse(10 as unknown as string, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for an unparseable string', () => {
    expect(() => parse('not-a-value', 'US')).toThrow(InvalidInputError);
  });
});

describe('fromMinorUnits', () => {
  it('should create a Money instance directly from minor units', () => {
    expect(fromMinorUnits(1050, 'BR').minorUnits()).toBe(1050);
  });

  it('should produce the correct decimal amount', () => {
    expect(fromMinorUnits(1050, 'BR').amount()).toBe(10.5);
  });

  it('should handle negative minor units', () => {
    expect(fromMinorUnits(-500, 'US').minorUnits()).toBe(-500);
  });

  it('should handle zero', () => {
    expect(fromMinorUnits(0, 'US').isZero()).toBe(true);
  });

  it('should throw InvalidInputError for a float', () => {
    expect(() => fromMinorUnits(10.5, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for null', () => {
    expect(() => fromMinorUnits(null as unknown as number, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for Infinity', () => {
    expect(() => fromMinorUnits(Infinity, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for NaN', () => {
    expect(() => fromMinorUnits(NaN, 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when the value exceeds Number.MAX_SAFE_INTEGER', () => {
    expect(() => fromMinorUnits(Number.MAX_SAFE_INTEGER + 1, 'US')).toThrow(InvalidInputError);
  });
});

describe('zero', () => {
  it('should produce an instance with zero minor units', () => {
    expect(zero('US').minorUnits()).toBe(0);
  });

  it('should produce an instance that reports isZero as true', () => {
    expect(zero('US').isZero()).toBe(true);
  });

  it('should assign the correct currency code for the given country', () => {
    expect(zero('BR').currencyCode()).toBe('BRL');
    expect(zero('JP').currencyCode()).toBe('JPY');
    expect(zero('GB').currencyCode()).toBe('GBP');
  });
});
