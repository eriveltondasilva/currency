import type { MoneyContract } from "@/types";

export const TAG = Symbol('@eriveltondasilva/currency');

/**
 * Returns `true` if `value` is a non-null, non-array plain object.
 *
 * Used internally to validate structured inputs such as {@link PricedItem}
 * before destructuring their properties.
 *
 * @param value — Any value to test.
 * @returns `true` when `value` is a plain object record.
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
  return isRecord(value) && TAG in value;
}