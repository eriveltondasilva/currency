import { UnsupportedCurrencyError } from './errors';

// #region Types

export type CountryCode =
  | 'AU'
  | 'BR'
  | 'CA'
  | 'CH'
  | 'CN'
  | 'DE'
  | 'FR'
  | 'GB'
  | 'IN'
  | 'JP'
  | 'MX'
  | 'SG'
  | 'PT'
  | 'US';

export type CurrencyCode =
  | 'AUD'
  | 'BRL'
  | 'CAD'
  | 'CHF'
  | 'CNY'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'JPY'
  | 'MXN'
  | 'SGD'
  | 'USD';

// #endregion

// #region Interfaces

interface CurrencyDef {
  name: string;
  fractionDigits: number;
}

interface CountryDef {
  name: string;
  locale: string;
  currency: CurrencyCode;
  decimal: string;
  group: string;
}

export interface Currency {
  locale: string;
  code: CurrencyCode;
  fractionDigits: number;
  decimal: string;
  group: string;
}

// #endregion

// #region Definitions

const COUNTRY_DEFS = {
  AU: { name: 'Australia', locale: 'en-AU', currency: 'AUD', decimal: '.', group: ',' },
  BR: { name: 'Brazil', locale: 'pt-BR', currency: 'BRL', decimal: ',', group: '.' },
  CA: { name: 'Canada', locale: 'en-CA', currency: 'CAD', decimal: '.', group: ',' },
  CH: { name: 'Switzerland', locale: 'de-CH', currency: 'CHF', decimal: '.', group: "'" },
  CN: { name: 'China', locale: 'zh-CN', currency: 'CNY', decimal: '.', group: ',' },
  DE: { name: 'Germany', locale: 'de-DE', currency: 'EUR', decimal: ',', group: '.' },
  FR: { name: 'France', locale: 'fr-FR', currency: 'EUR', decimal: ',', group: ' ' },
  GB: { name: 'United Kingdom', locale: 'en-GB', currency: 'GBP', decimal: '.', group: ',' },
  IN: { name: 'India', locale: 'en-IN', currency: 'INR', decimal: '.', group: ',' },
  JP: { name: 'Japan', locale: 'ja-JP', currency: 'JPY', decimal: '.', group: ',' },
  MX: { name: 'Mexico', locale: 'es-MX', currency: 'MXN', decimal: '.', group: ',' },
  PT: { name: 'Portugal', locale: 'pt-PT', currency: 'EUR', decimal: ',', group: '.' },
  SG: { name: 'Singapore', locale: 'en-SG', currency: 'SGD', decimal: '.', group: ',' },
  US: { name: 'United States', locale: 'en-US', currency: 'USD', decimal: '.', group: ',' },
} as const satisfies Record<CountryCode, CountryDef>;

const CURRENCY_DEFS = {
  AUD: { name: 'Australian Dollar', fractionDigits: 2 },
  BRL: { name: 'Brazilian Real', fractionDigits: 2 },
  CAD: { name: 'Canadian Dollar', fractionDigits: 2 },
  CHF: { name: 'Swiss Franc', fractionDigits: 2 },
  CNY: { name: 'Chinese Yuan', fractionDigits: 2 },
  EUR: { name: 'Euro', fractionDigits: 2 },
  GBP: { name: 'British Pound', fractionDigits: 2 },
  INR: { name: 'Indian Rupee', fractionDigits: 2 },
  JPY: { name: 'Japanese Yen', fractionDigits: 0 },
  MXN: { name: 'Mexican Peso', fractionDigits: 2 },
  SGD: { name: 'Singapore Dollar', fractionDigits: 2 },
  USD: { name: 'US Dollar', fractionDigits: 2 },
} as const satisfies Record<CurrencyCode, CurrencyDef>;

// #endregion

// #region Utils

export const SUPPORTED_CODES = Object.keys(COUNTRY_DEFS).join(', ');
export const DEFAULT_COUNTRY_CODE: CountryCode = 'US';

export function resolveCurrency(country: CountryCode): Currency {
  const countryDef = COUNTRY_DEFS[country];

  if (!countryDef) throw new UnsupportedCurrencyError(country, SUPPORTED_CODES);

  const { locale, currency, decimal, group } = countryDef;
  const { fractionDigits } = CURRENCY_DEFS[currency];

  return { locale, code: currency, decimal, group, fractionDigits };
}

// #endregion
