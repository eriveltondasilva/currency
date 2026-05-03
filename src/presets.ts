import type { FormatOptions, MoneyInput } from './types';

import { factories as Money } from './factories';

// ─── Currency presets ─────────────────────────────────────────────────────────

type PresetOptions = Omit<FormatOptions, 'currencyCode'>;

export const BRL = (value: MoneyInput, options: PresetOptions = {}) =>
  Money.from(value, { ...options, currencyCode: 'BRL' });

export const USD = (value: MoneyInput, options: PresetOptions = {}) =>
  Money.from(value, { ...options, currencyCode: 'USD' });

export const EUR = (value: MoneyInput, options: PresetOptions = {}) =>
  Money.from(value, { ...options, currencyCode: 'EUR' });

export const GBP = (value: MoneyInput, options: PresetOptions = {}) =>
  Money.from(value, { ...options, currencyCode: 'GBP' });

export const JPY = (value: MoneyInput, options: PresetOptions = {}) =>
  Money.from(value, { ...options, currencyCode: 'JPY' });

export const CNY = (value: MoneyInput, options: PresetOptions = {}) =>
  Money.from(value, { ...options, currencyCode: 'CNY' });
