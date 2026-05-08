import type { MoneyContract } from '@/types';

import { TAG } from './constants';

export function isNil(value: unknown): value is null | undefined {
  return value == null;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

export function isMoney(value: unknown): value is MoneyContract {
  return isRecord(value) && '_tag' in value && value._tag === TAG;
}

export function isMoneyInput(value: unknown): value is number | MoneyContract {
  return isNumber(value) || isMoney(value);
}
