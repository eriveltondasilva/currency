import type { FormatOptions } from './types';

export const TAG = Symbol('@eriveltondasilva/currency');

export const CENT_FACTOR = 100 as const;

export const ROUNDING_MODES = {
  ROUND: 'round',
  FLOOR: 'floor',
  CEIL: 'ceil',
  TRUNC: 'trunc',
} as const;

export const CURRENCY_LOCALES = {
  BRL: 'pt-BR',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
} as const;

export const FORMAT_STYLES = {
  CURRENCY: 'currency',
  DECIMAL: 'decimal',
} as const;

export const DEFAULT_FORMAT_OPTIONS = {
  currencyCode: 'USD',
  locale: CURRENCY_LOCALES.USD,
} as const satisfies FormatOptions;
