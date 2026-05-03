import type { FormatOptions, MoneyInput } from './types';

import { factories as Money } from './factories';

// ─── Currency presets ─────────────────────────────────────────────────────────
//
// Convenience factories with a pre-configured currencyCode.
// Each preset accepts a value and returns a Money instance ready to format.
//
// @example
// BRL(10.5).format()  // -> 'R$ 10,50'
// USD(10.5).format()  // -> '$10.50'

export const BRL = (value: MoneyInput, options: Omit<FormatOptions, 'currencyCode'> = {}) =>
  Money.from(value, { ...options, currencyCode: 'BRL' });

export const USD = (value: MoneyInput, options: Omit<FormatOptions, 'currencyCode'> = {}) =>
  Money.from(value, { ...options, currencyCode: 'USD' });

export const EUR = (value: MoneyInput, options: Omit<FormatOptions, 'currencyCode'> = {}) =>
  Money.from(value, { ...options, currencyCode: 'EUR' });

export const GBP = (value: MoneyInput, options: Omit<FormatOptions, 'currencyCode'> = {}) =>
  Money.from(value, { ...options, currencyCode: 'GBP' });

export const JPY = (value: MoneyInput, options: Omit<FormatOptions, 'currencyCode'> = {}) =>
  Money.from(value, { ...options, currencyCode: 'JPY' });

export const CNY = (value: MoneyInput, options: Omit<FormatOptions, 'currencyCode'> = {}) =>
  Money.from(value, { ...options, currencyCode: 'CNY' });
