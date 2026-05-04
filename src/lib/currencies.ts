export const COUNTRY_CODE = {
  BR: 'BR',
  US: 'US',
  DE: 'DE',
  FR: 'FR',
  PT: 'PT',
  GB: 'GB',
  JP: 'JP',
  CN: 'CN',
} as const;
export type CountryCode = keyof typeof COUNTRY_CODE;

export interface CurrencyConfig {
  locale: string;
  code: string;
  minorUnit: number;
  fractionDigits: number;
  decimal: string;
  group: string;
}

export const CURRENCIES = {
  BR: { locale: 'pt-BR', code: 'BRL', minorUnit: 100, fractionDigits: 2, decimal: ',', group: '.' },
  US: { locale: 'en-US', code: 'USD', minorUnit: 100, fractionDigits: 2, decimal: '.', group: ',' },
  DE: { locale: 'de-DE', code: 'EUR', minorUnit: 100, fractionDigits: 2, decimal: ',', group: '.' },
  FR: { locale: 'fr-FR', code: 'EUR', minorUnit: 100, fractionDigits: 2, decimal: ',', group: ' ' },
  PT: { locale: 'pt-PT', code: 'EUR', minorUnit: 100, fractionDigits: 2, decimal: ',', group: '.' },
  GB: { locale: 'en-GB', code: 'GBP', minorUnit: 100, fractionDigits: 2, decimal: '.', group: ',' },
  JP: { locale: 'ja-JP', code: 'JPY', minorUnit: 1, fractionDigits: 0, decimal: '.', group: ',' },
  CN: { locale: 'zh-CN', code: 'CNY', minorUnit: 100, fractionDigits: 2, decimal: '.', group: ',' },
} as const satisfies Record<CountryCode, CurrencyConfig>;

export type CurrencyCode = (typeof CURRENCIES)[CountryCode]['code'];
export type CurrencyLocale = (typeof CURRENCIES)[CountryCode]['locale'];

export const SUPPORTED_CODES = Object.keys(COUNTRY_CODE).join(', ');
export const DEFAULT_CURRENCY = CURRENCIES.US;
