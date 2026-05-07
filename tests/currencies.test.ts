import { describe, expect, it } from 'vitest';

import { resolveCurrency, SUPPORTED_CODES } from '@/lib/currencies';
import { UnsupportedCurrencyError } from '@/lib/errors';

// ─── resolveCurrency — happy path ─────────────────────────────────────────────

describe('resolveCurrency — returned shape', () => {
  it('should return the correct currency code for US', () => {
    expect(resolveCurrency('US').code).toBe('USD');
  });

  it('should return the correct currency code for BR', () => {
    expect(resolveCurrency('BR').code).toBe('BRL');
  });

  it('should return the correct currency code for GB', () => {
    expect(resolveCurrency('GB').code).toBe('GBP');
  });

  it('should return the correct currency code for JP', () => {
    expect(resolveCurrency('JP').code).toBe('JPY');
  });

  it('should return the correct locale for US', () => {
    expect(resolveCurrency('US').locale).toBe('en-US');
  });

  it('should return the correct locale for BR', () => {
    expect(resolveCurrency('BR').locale).toBe('pt-BR');
  });

  it('should return the correct locale for DE', () => {
    expect(resolveCurrency('DE').locale).toBe('de-DE');
  });

  it('should return the correct locale for JP', () => {
    expect(resolveCurrency('JP').locale).toBe('ja-JP');
  });
});

// ─── resolveCurrency — fractionDigits ─────────────────────────────────────────

describe('resolveCurrency — fractionDigits', () => {
  it('should return fractionDigits 2 for USD', () => {
    expect(resolveCurrency('US').fractionDigits).toBe(2);
  });

  it('should return fractionDigits 2 for BRL', () => {
    expect(resolveCurrency('BR').fractionDigits).toBe(2);
  });

  it('should return fractionDigits 2 for EUR (via DE)', () => {
    expect(resolveCurrency('DE').fractionDigits).toBe(2);
  });

  it('should return fractionDigits 2 for EUR (via FR)', () => {
    expect(resolveCurrency('FR').fractionDigits).toBe(2);
  });

  it('should return fractionDigits 2 for EUR (via PT)', () => {
    expect(resolveCurrency('PT').fractionDigits).toBe(2);
  });

  it('should return fractionDigits 0 for JPY', () => {
    expect(resolveCurrency('JP').fractionDigits).toBe(0);
  });
});

// ─── resolveCurrency — separators ────────────────────────────────────────────

describe('resolveCurrency — decimal and group separators', () => {
  it('should return dot as decimal and comma as group for US', () => {
    const currency = resolveCurrency('US');
    expect(currency.decimal).toBe('.');
    expect(currency.group).toBe(',');
  });

  it('should return comma as decimal and dot as group for BR', () => {
    const currency = resolveCurrency('BR');
    expect(currency.decimal).toBe(',');
    expect(currency.group).toBe('.');
  });

  it('should return comma as decimal and dot as group for DE', () => {
    const currency = resolveCurrency('DE');
    expect(currency.decimal).toBe(',');
    expect(currency.group).toBe('.');
  });

  it('should return comma as decimal and space as group for FR', () => {
    const currency = resolveCurrency('FR');
    expect(currency.decimal).toBe(',');
    expect(currency.group).toBe(' ');
  });

  it('should return dot as decimal and apostrophe as group for CH', () => {
    const currency = resolveCurrency('CH');
    expect(currency.decimal).toBe('.');
    expect(currency.group).toBe("'");
  });
});

// ─── resolveCurrency — shared EUR countries ───────────────────────────────────

describe('resolveCurrency — countries sharing EUR', () => {
  it('should resolve DE, FR and PT all to EUR', () => {
    expect(resolveCurrency('DE').code).toBe('EUR');
    expect(resolveCurrency('FR').code).toBe('EUR');
    expect(resolveCurrency('PT').code).toBe('EUR');
  });

  it('should keep distinct locales for DE and FR despite sharing EUR', () => {
    expect(resolveCurrency('DE').locale).toBe('de-DE');
    expect(resolveCurrency('FR').locale).toBe('fr-FR');
  });
});

// ─── resolveCurrency — all supported country codes ───────────────────────────

describe('resolveCurrency — full country coverage', () => {
  const countries = [
    'AU',
    'BR',
    'CA',
    'CH',
    'CN',
    'DE',
    'FR',
    'GB',
    'IN',
    'JP',
    'MX',
    'PT',
    'SG',
    'US',
  ] as const;

  for (const country of countries) {
    it(`should resolve ${country} without throwing`, () => {
      const currency = resolveCurrency(country);
      expect(currency.code).toBeTruthy();
      expect(currency.locale).toBeTruthy();
    });
  }
});

// ─── resolveCurrency — unsupported code ───────────────────────────────────────

describe('resolveCurrency — unsupported country code', () => {
  it('should throw UnsupportedCurrencyError for an unknown code', () => {
    expect(() => resolveCurrency('XX' as never)).toThrow(UnsupportedCurrencyError);
  });

  it('should include the invalid code in the error message', () => {
    let error!: UnsupportedCurrencyError;
    try {
      resolveCurrency('ZZ' as never);
    } catch (e) {
      error = e as UnsupportedCurrencyError;
    }
    expect(error.message).toContain('ZZ');
  });

  it('should have code UNSUPPORTED_CURRENCY for an unknown country', () => {
    let error!: UnsupportedCurrencyError;
    try {
      resolveCurrency('YY' as never);
    } catch (e) {
      error = e as UnsupportedCurrencyError;
    }
    expect(error.code).toBe('UNSUPPORTED_CURRENCY');
  });
});

// ─── SUPPORTED_CODES ──────────────────────────────────────────────────────────

describe('SUPPORTED_CODES', () => {
  it('should contain all 14 supported country codes', () => {
    const codes = [
      'AU',
      'BR',
      'CA',
      'CH',
      'CN',
      'DE',
      'FR',
      'GB',
      'IN',
      'JP',
      'MX',
      'PT',
      'SG',
      'US',
    ];
    for (const code of codes) {
      expect(SUPPORTED_CODES).toContain(code);
    }
  });
});
