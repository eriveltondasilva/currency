import { UnsupportedCurrencyError } from './errors';

// ─────────────────────────────────────────────────────────────────────────────

interface CurrencyDef {
  name: string;
  fractionDigits: number;
}

interface CountryDef {
  name: string;
  currency: CurrencyCode;
  locale: string;
  decimal: string;
}

export interface Currency {
  code: CurrencyCode;
  fractionDigits: number;
  locale: string;
  decimal: string;
}

// ─────────────────────────────────────────────────────────────────────────────

const CURRENCY_DEFS = {
  AED: { name: 'UAE Dirham', fractionDigits: 2 },
  ARS: { name: 'Argentine Peso', fractionDigits: 2 },
  AUD: { name: 'Australian Dollar', fractionDigits: 2 },
  BRL: { name: 'Brazilian Real', fractionDigits: 2 },
  CAD: { name: 'Canadian Dollar', fractionDigits: 2 },
  CHF: { name: 'Swiss Franc', fractionDigits: 2 },
  CLP: { name: 'Chilean Peso', fractionDigits: 0 },
  CNY: { name: 'Chinese Yuan', fractionDigits: 2 },
  COP: { name: 'Colombian Peso', fractionDigits: 0 },
  EUR: { name: 'Euro', fractionDigits: 2 },
  GBP: { name: 'British Pound', fractionDigits: 2 },
  INR: { name: 'Indian Rupee', fractionDigits: 2 },
  JPY: { name: 'Japanese Yen', fractionDigits: 0 },
  KRW: { name: 'South Korean Won', fractionDigits: 0 },
  MXN: { name: 'Mexican Peso', fractionDigits: 2 },
  NOK: { name: 'Norwegian Krone', fractionDigits: 2 },
  NZD: { name: 'New Zealand Dollar', fractionDigits: 2 },
  RUB: { name: 'Russian Ruble', fractionDigits: 2 },
  SAR: { name: 'Saudi Riyal', fractionDigits: 2 },
  SEK: { name: 'Swedish Krona', fractionDigits: 2 },
  SGD: { name: 'Singapore Dollar', fractionDigits: 2 },
  USD: { name: 'US Dollar', fractionDigits: 2 },
  ZAR: { name: 'South African Rand', fractionDigits: 2 },
} as const satisfies Record<string, CurrencyDef>;

export type CurrencyCode = keyof typeof CURRENCY_DEFS;

const COUNTRY_DEFS = {
  AE: { name: 'United Arab Emirates', locale: 'ar-AE', currency: 'AED', decimal: '.' },
  AR: { name: 'Argentina', locale: 'es-AR', currency: 'ARS', decimal: ',' },
  AU: { name: 'Australia', locale: 'en-AU', currency: 'AUD', decimal: '.' },
  BR: { name: 'Brazil', locale: 'pt-BR', currency: 'BRL', decimal: ',' },
  CA: { name: 'Canada', locale: 'en-CA', currency: 'CAD', decimal: '.' },
  CH: { name: 'Switzerland', locale: 'de-CH', currency: 'CHF', decimal: '.' },
  CL: { name: 'Chile', locale: 'es-CL', currency: 'CLP', decimal: ',' },
  CN: { name: 'China', locale: 'zh-CN', currency: 'CNY', decimal: '.' },
  CO: { name: 'Colombia', locale: 'es-CO', currency: 'COP', decimal: ',' },
  DE: { name: 'Germany', locale: 'de-DE', currency: 'EUR', decimal: ',' },
  FR: { name: 'France', locale: 'fr-FR', currency: 'EUR', decimal: ',' },
  GB: { name: 'United Kingdom', locale: 'en-GB', currency: 'GBP', decimal: '.' },
  IN: { name: 'India', locale: 'en-IN', currency: 'INR', decimal: '.' },
  JP: { name: 'Japan', locale: 'ja-JP', currency: 'JPY', decimal: '.' },
  KR: { name: 'South Korea', locale: 'ko-KR', currency: 'KRW', decimal: '.' },
  MX: { name: 'Mexico', locale: 'es-MX', currency: 'MXN', decimal: '.' },
  NO: { name: 'Norway', locale: 'nb-NO', currency: 'NOK', decimal: ',' },
  NZ: { name: 'New Zealand', locale: 'en-NZ', currency: 'NZD', decimal: '.' },
  PT: { name: 'Portugal', locale: 'pt-PT', currency: 'EUR', decimal: ',' },
  RU: { name: 'Russia', locale: 'ru-RU', currency: 'RUB', decimal: ',' },
  SA: { name: 'Saudi Arabia', locale: 'ar-SA', currency: 'SAR', decimal: '.' },
  SE: { name: 'Sweden', locale: 'sv-SE', currency: 'SEK', decimal: ',' },
  SG: { name: 'Singapore', locale: 'en-SG', currency: 'SGD', decimal: '.' },
  US: { name: 'United States', locale: 'en-US', currency: 'USD', decimal: '.' },
  ZA: { name: 'South Africa', locale: 'en-ZA', currency: 'ZAR', decimal: '.' },
} as const satisfies Record<string, CountryDef>;

export type CountryCode = keyof typeof COUNTRY_DEFS;

// ─────────────────────────────────────────────────────────────────────────────

export const SUPPORTED_CODES = Object.keys(COUNTRY_DEFS).join(', ');

export function resolveCurrency(country: CountryCode): Currency {
  const countryDef = COUNTRY_DEFS[country];

  if (!countryDef) throw new UnsupportedCurrencyError(country, SUPPORTED_CODES);

  const { locale, currency, decimal } = countryDef;
  const { fractionDigits } = CURRENCY_DEFS[currency];

  return { locale, code: currency, decimal, fractionDigits };
}
