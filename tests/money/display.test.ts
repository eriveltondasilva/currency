import { describe, expect, it } from 'vitest';

import { from, zero } from '@/api/creation';

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.minorUnits', () => {
  it('should return the raw integer minor unit value', () => {
    expect(from(10.5, 'US').minorUnits()).toBe(1050);
  });

  it('should return 0 for a zero amount', () => {
    expect(zero('US').minorUnits()).toBe(0);
  });

  it('should return a negative value for a negative amount', () => {
    expect(from(-10, 'US').minorUnits()).toBe(-1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.amount', () => {
  it('should return the decimal representation of the amount', () => {
    expect(from(10.5, 'US').amount()).toBe(10.5);
  });

  it('should return 0 for a zero amount', () => {
    expect(zero('US').amount()).toBe(0);
  });

  it('should return the correct amount for JPY with 0 fraction digits', () => {
    expect(from(1500, 'JP').amount()).toBe(1500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.units', () => {
  it('should return the whole unit part of the amount', () => {
    expect(from(10.99, 'US').units()).toBe(10);
  });

  it('should return 0 for a zero amount', () => {
    expect(zero('US').units()).toBe(0);
  });

  it('should return a positive whole unit for a negative amount', () => {
    expect(from(-10.5, 'US').units()).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.subunits', () => {
  it('should return the fractional part as an integer in minor units', () => {
    expect(from(10.99, 'US').subunits()).toBe(99);
  });

  it('should return 0 when there is no fractional part', () => {
    expect(from(10, 'US').subunits()).toBe(0);
  });

  it('should return a positive fractional part for a negative amount', () => {
    expect(from(-10.5, 'US').subunits()).toBe(50);
  });

  it('should return 0 for JPY which has no subunits', () => {
    expect(from(1500, 'JP').subunits()).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.toParts', () => {
  it('should return units, subunits and isNegative for a positive amount', () => {
    expect(from(10.99, 'US').toParts()).toEqual({ units: 10, subunits: 99, isNegative: false });
  });

  it('should return zeroed parts with isNegative false for zero', () => {
    expect(zero('US').toParts()).toEqual({ units: 0, subunits: 0, isNegative: false });
  });

  it('should return absolute parts with isNegative true for a negative amount', () => {
    expect(from(-10.5, 'US').toParts()).toEqual({ units: 10, subunits: 50, isNegative: true });
  });

  it('should preserve sign information when units is zero', () => {
    expect(from(-0.99, 'US').toParts()).toEqual({ units: 0, subunits: 99, isNegative: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.currencyCode', () => {
  it('should return the correct currency code for BR', () => {
    expect(from(10, 'BR').currencyCode()).toBe('BRL');
  });

  it('should return the correct currency code for JP', () => {
    expect(from(10, 'JP').currencyCode()).toBe('JPY');
  });

  it('should return EUR for both DE and FR', () => {
    expect(from(10, 'DE').currencyCode()).toBe('EUR');
    expect(from(10, 'FR').currencyCode()).toBe('EUR');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.locale', () => {
  it('should return the locale for BR', () => {
    expect(from(10, 'BR').locale()).toBe('pt-BR');
  });

  it('should return the locale for US', () => {
    expect(from(10, 'US').locale()).toBe('en-US');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.toString', () => {
  it('should return the currency code followed by the decimal amount', () => {
    expect(from(10.5, 'US').toString()).toBe('USD 10.50');
  });

  it('should return 0 fraction digits for JPY', () => {
    expect(from(1500, 'JP').toString()).toBe('JPY 1500');
  });

  it('should include the minus sign for negative amounts', () => {
    expect(from(-10.5, 'US').toString()).toBe('USD -10.50');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.toJSON', () => {
  it('should return an object with minorUnits and currencyCode', () => {
    expect(from(10.5, 'US').toJSON()).toEqual({ minorUnits: 1050, currencyCode: 'USD' });
  });

  it('should serialize correctly with JSON.stringify', () => {
    const json = JSON.parse(JSON.stringify(from(10.5, 'US')));
    expect(json).toEqual({ minorUnits: 1050, currencyCode: 'USD' });
  });

  it('should return minorUnits as 0 for a zero amount', () => {
    expect(zero('BR').toJSON()).toEqual({ minorUnits: 0, currencyCode: 'BRL' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.format', () => {
  it('should format a BRL amount with the default locale', () => {
    expect(from(1234.56, 'BR').format()).toContain('1.234,56');
  });

  it('should format a USD amount with the default locale', () => {
    expect(from(1234.56, 'US').format()).toContain('1,234.56');
  });

  it('should format JPY without decimal places', () => {
    const formatted = from(1500, 'JP').format();
    expect(formatted).toContain('1,500');
    expect(formatted).not.toContain('.');
  });

  it('should display the currency code when currencyDisplay is "code"', () => {
    expect(from(10, 'BR').format({ currencyDisplay: 'code' })).toContain('BRL');
  });

  it('should display the currency name when currencyDisplay is "name"', () => {
    expect(from(10, 'US').format({ currencyDisplay: 'name' }).toLowerCase()).toContain('dollar');
  });

  it('should hide the currency symbol when currencyDisplay is "none"', () => {
    const formatted = from(10.5, 'US').format({ currencyDisplay: 'none' });
    expect(formatted).not.toContain('$');
    expect(formatted).toContain('10.50');
  });

  it('should render compact notation for large amounts', () => {
    expect(from(1_500_000, 'US').format({ notation: 'compact' })).toMatch(/1[.,]?5\s?M/);
  });

  it('should show the sign for positive values when signDisplay is "always"', () => {
    expect(from(10, 'US').format({ signDisplay: 'always' })).toContain('+');
  });

  it('should override the locale for display without affecting the currency code', () => {
    const money = from(1234.56, 'US');
    expect(money.format({ locale: 'de-DE' })).toContain('1.234,56');
    expect(money.currencyCode()).toBe('USD');
  });

  it('should format with a custom number of fraction digits', () => {
    expect(from(10, 'US').format({ minimumFractionDigits: 4, maximumFractionDigits: 4 })).toContain(
      '10.0000',
    );
  });
});
