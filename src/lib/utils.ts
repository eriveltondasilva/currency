export const TAG = Symbol('Currency');

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
