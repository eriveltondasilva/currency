import type { MoneyContract } from '@/types';

export const tag = Symbol('@eriveltondasilva/currency');

// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns `true` if `value` is a valid {@link MoneyInput} — either a `number`
 * or a `MoneyContract` instance.
 *
 * Use this to validate external inputs before passing them to API functions
 * that accept `MoneyInput`.
 *
 * @param value — Any value to test.
 * @returns `true` when `value` is a `number` or a `MoneyContract` instance.
 *
 * @example
 * isMoneyInput(19.99)          // => true
 * isMoneyInput(from(10, 'BR')) // => true
 * isMoneyInput('19.99')        // => false
 * isMoneyInput(null)           // => false
 */
export function isMoneyInput(value: unknown): value is number | MoneyContract {
  return typeof value === 'number' || isMoney(value);
}
