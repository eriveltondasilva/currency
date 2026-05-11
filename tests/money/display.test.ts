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

  it('should return the absolute whole unit for a negative amount', () => {
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

  it('should return the absolute fractional part for a negative amount', () => {
    expect(from(-10.5, 'US').subunits()).toBe(50);
  });

  it('should return 0 for JPY which has no subunits', () => {
    expect(from(1500, 'JP').subunits()).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Money.toParts', () => {
  it('should return a tuple of [units, subunits]', () => {
    expect(from(10.99, 'US').toParts()).toEqual([10, 99]);
  });

  it('should return [0, 0] for zero', () => {
    expect(zero('US').toParts()).toEqual([0, 0]);
  });

  it('should return absolute values for a negative amount', () => {
    expect(from(-10.5, 'US').toParts()).toEqual([10, 50]);
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
  it('should return a decimal string with the correct fraction digits', () => {
    expect(from(10.5, 'US').toString()).toBe('10.50');
  });

  it('should return 0 fraction digits for JPY', () => {
    expect(from(1500, 'JP').toString()).toBe('1500');
  });

  it('should include the minus sign for negative amounts', () => {
    expect(from(-10.5, 'US').toString()).toBe('-10.50');
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
    const formatted = from(1234.56, 'BR').format();
    expect(formatted).toContain('1.234,56');
  });

  it('should format a USD amount with the default locale', () => {
    const formatted = from(1234.56, 'US').format();
    expect(formatted).toContain('1,234.56');
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
    const formatted = from(10, 'US').format({ currencyDisplay: 'name' });
    expect(formatted.toLowerCase()).toContain('dollar');
  });

  it('should hide the currency symbol when currencyDisplay is "none"', () => {
    const formatted = from(10.5, 'US').format({ currencyDisplay: 'none' });
    expect(formatted).not.toContain('$');
    expect(formatted).toContain('10.50');
  });

  it('should render a compact notation for large amounts', () => {
    const formatted = from(1_500_000, 'US').format({ notation: 'compact' });
    expect(formatted).toMatch(/1[.,]?5\s?M/);
  });

  it('should show the sign for positive values when signDisplay is "always"', () => {
    expect(from(10, 'US').format({ signDisplay: 'always' })).toContain('+');
  });

  it('should override the locale for display without affecting the amount', () => {
    const money = from(1234.56, 'US');
    const formatted = money.format({ locale: 'de-DE' });
    expect(formatted).toContain('1.234,56');
    expect(money.currencyCode()).toBe('USD');
  });

  it('should format with a custom minimumFractionDigits', () => {
    const formatted = from(10, 'US').format({ minimumFractionDigits: 4, maximumFractionDigits: 4 });
    expect(formatted).toContain('10.0000');
  });
});
