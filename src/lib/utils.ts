import type { MoneyContract } from '@/types';

export const tag = Symbol('@eriveltondasilva/currency');

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

/**
 * Returns `true` if `value` is a `MoneyContract` instance.
 *
 * Use this as a type guard to distinguish `MoneyContract` from plain `number`
 * when handling {@link MoneyInput}.
 *
 * @param value — Any value to test.
 * @returns `true` when `value` is an instance of `Money`.
 *
 * @example
 * isMoney(from(10, 'BR')) // => true
 * isMoney(10)             // => false
 * isMoney(null)           // => false
 */
export function isMoney(value: unknown): value is MoneyContract {
  return isRecord(value) && tag in value;
}

export function isMoneyInput(value: unknown): value is number | MoneyContract {
  return typeof value === 'number' || isMoney(value);
}
