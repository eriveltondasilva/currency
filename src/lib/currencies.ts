import { UnsupportedCurrencyError } from './errors';

interface CurrencyDef {
  name: string;
  fractionDigits: number;
}

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
} as const satisfies Record<Uppercase<string>, CurrencyDef>;

export type CurrencyCode = keyof typeof CURRENCY_DEFS;

interface CountryDef {
  name: string;
  currencyCode: CurrencyCode;
  locale: string;
  decimal: string;
}

const COUNTRY_DEFS = {
  AE: { name: 'United Arab Emirates', locale: 'ar-AE', currencyCode: 'AED', decimal: '.' },
  AR: { name: 'Argentina', locale: 'es-AR', currencyCode: 'ARS', decimal: ',' },
  AU: { name: 'Australia', locale: 'en-AU', currencyCode: 'AUD', decimal: '.' },
  BR: { name: 'Brazil', locale: 'pt-BR', currencyCode: 'BRL', decimal: ',' },
  CA: { name: 'Canada', locale: 'en-CA', currencyCode: 'CAD', decimal: '.' },
  CH: { name: 'Switzerland', locale: 'de-CH', currencyCode: 'CHF', decimal: '.' },
  CL: { name: 'Chile', locale: 'es-CL', currencyCode: 'CLP', decimal: ',' },
  CN: { name: 'China', locale: 'zh-CN', currencyCode: 'CNY', decimal: '.' },
  CO: { name: 'Colombia', locale: 'es-CO', currencyCode: 'COP', decimal: ',' },
  DE: { name: 'Germany', locale: 'de-DE', currencyCode: 'EUR', decimal: ',' },
  FR: { name: 'France', locale: 'fr-FR', currencyCode: 'EUR', decimal: ',' },
  GB: { name: 'United Kingdom', locale: 'en-GB', currencyCode: 'GBP', decimal: '.' },
  IN: { name: 'India', locale: 'en-IN', currencyCode: 'INR', decimal: '.' },
  JP: { name: 'Japan', locale: 'ja-JP', currencyCode: 'JPY', decimal: '.' },
  KR: { name: 'South Korea', locale: 'ko-KR', currencyCode: 'KRW', decimal: '.' },
  MX: { name: 'Mexico', locale: 'es-MX', currencyCode: 'MXN', decimal: '.' },
  NO: { name: 'Norway', locale: 'nb-NO', currencyCode: 'NOK', decimal: ',' },
  NZ: { name: 'New Zealand', locale: 'en-NZ', currencyCode: 'NZD', decimal: '.' },
  PT: { name: 'Portugal', locale: 'pt-PT', currencyCode: 'EUR', decimal: ',' },
  RU: { name: 'Russia', locale: 'ru-RU', currencyCode: 'RUB', decimal: ',' },
  SA: { name: 'Saudi Arabia', locale: 'ar-SA', currencyCode: 'SAR', decimal: '.' },
  SE: { name: 'Sweden', locale: 'sv-SE', currencyCode: 'SEK', decimal: ',' },
  SG: { name: 'Singapore', locale: 'en-SG', currencyCode: 'SGD', decimal: '.' },
  US: { name: 'United States', locale: 'en-US', currencyCode: 'USD', decimal: '.' },
  ZA: { name: 'South Africa', locale: 'en-ZA', currencyCode: 'ZAR', decimal: '.' },
} as const satisfies Record<Uppercase<string>, CountryDef>;

export type CountryCode = keyof typeof COUNTRY_DEFS;

export const SUPPORTED_CODES = Object.keys(COUNTRY_DEFS).join(', ');

export interface Currency {
  currencyCode: CurrencyCode;
  locale: string;
  decimal: string;
  fractionDigits: number;
  scaleFactor: number;
}

export function resolveCurrency(country: CountryCode): Currency {
  const countryDef = COUNTRY_DEFS[country.toUpperCase() as CountryCode];

  if (!countryDef) {
    throw new UnsupportedCurrencyError(country, SUPPORTED_CODES);
  }

  const { currencyCode, locale, decimal } = countryDef;
  const { fractionDigits } = CURRENCY_DEFS[currencyCode];

  return { currencyCode, locale, decimal, fractionDigits, scaleFactor: 10 ** fractionDigits };
}
