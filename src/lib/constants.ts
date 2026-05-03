import type { MoneyOptions } from '../types';

export const TAG = Symbol('@eriveltondasilva/currency');

export const CENT_FACTOR = 100 as const;

export const ROUNDING_MODES = {
  ROUND: 'round',
  FLOOR: 'floor',
  CEIL: 'ceil',
  TRUNC: 'trunc',
} as const;
export type RoundingMode = (typeof ROUNDING_MODES)[keyof typeof ROUNDING_MODES];

export const CURRENCY_LOCALES = {
  BRL: 'pt-BR',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
} as const;
export type CurrencyCode = keyof typeof CURRENCY_LOCALES;
export type CurrencyLocale = (typeof CURRENCY_LOCALES)[CurrencyCode];

export const FORMAT_STYLES = {
  CURRENCY: 'currency',
  DECIMAL: 'decimal',
} as const;

export const DEFAULT_MONEY_OPTIONS = {
  currencyCode: 'USD',
} as const satisfies MoneyOptions;
