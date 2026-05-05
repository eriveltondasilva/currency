import type { MoneyContract } from '@/types/money';

import { type CountryCode, CURRENCIES, type CurrencyConfig, SUPPORTED_CODES } from './currencies';
import { InvalidInputError } from './errors';
import { TAG } from '@/lib/constants';

export function isNil(value: unknown): value is null | undefined {
  return value == null;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isMoney(value: unknown): value is MoneyContract {
  return isRecord(value) && '_tag' in value && value._tag === TAG;
}

export function resolveCurrency(region: string): CurrencyConfig {
  const config = CURRENCIES[region as CountryCode];

  if (!config) {
    throw new InvalidInputError(
      `'${region}' is not a supported currency region. Supported codes: ${SUPPORTED_CODES}.`,
      region,
    );
  }

  return config;
}
