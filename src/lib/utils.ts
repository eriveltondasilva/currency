/** Internal utility functions. */

import type { MoneyOptions } from '@/types';
import type { MoneyContract } from '@/types/money';

import { CURRENCY_LOCALES, type CurrencyLocale, TAG } from '@/lib/constants';

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

export function isEmpty(value: unknown): boolean {
  if (isNil(value)) return true;
  if (isString(value)) return value.trim().length === 0;
  if (isArray(value)) return value.length === 0;
  if (isRecord(value)) return Object.keys(value).length === 0;
  return false;
}

export function isFiniteNumber(value: unknown): value is number {
  return isNumber(value) && Number.isFinite(value);
}

export function isMoney(value: unknown): value is MoneyContract {
  return isRecord(value) && '_tag' in value && value._tag === TAG;
}

export function resolveLocale(options: MoneyOptions): CurrencyLocale {
  return options.locale ?? CURRENCY_LOCALES[options.currencyCode];
}
