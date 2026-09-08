import type { MoneyContract } from '@/types';

/** @internal */
export const TAG = Symbol.for('@eriveltondasilva/currency');

/**
 * Returns `true` if `value` is a non-null, non-array plain object.
 *
 * @internal
 *
 * @param value {unknown} - Any value to test.
 *
 * @example
 * isRecord({ price: 10 }) // => true
 * isRecord([1, 2, 3])     // => false
 * isRecord(null)          // => false
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

/**
 * Returns `true` if `value` is a `MoneyContract` instance.
 *
 * @internal
 *
 * @param value {unknown} - Any value to test.
 *
 * @example
 * isMoney(from(10, 'BR')) // => true
 * isMoney(10)             // => false
 * isMoney(null)           // => false
 */
export function isMoney(value: unknown): value is MoneyContract {
  return isRecord(value) && TAG in value;
}

/**
 * Returns `true` if `value` is an empty array.
 *
 * @internal
 *
 * @param value {unknown} - Any value to test.
 *
 * @example
 * hasNoItems([]) // => true
 * hasNoItems([1, 2, 3]) // => false
 */
export function hasNoItems(value: unknown): value is [] {
  return !Array.isArray(value) || value.length === 0;
}
