import type { MoneyContract } from '@/types';
import { InvalidInputError } from './errors';

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
 *
 * @internal
 *
 * @param value {unknown} - Any value to test.
 */
export function hasNoItems(value: unknown): value is [] {
  return !Array.isArray(value) || value.length === 0;
}

export function resolveMinorUnits(value: MoneyInput, currency: Currency, context: string): number {
  if (value == null) {
    throw new InvalidInputError(`${context} — value cannot be null or undefined.`, {
      input: value,
    });
  }

  if (isMoney(value)) {
    if (value.currencyCode() !== currency.code)
      throw new CurrencyMismatchError(currency.code, value.currencyCode());

    return value.minorUnits();
  }

  if (typeof value !== 'number') {
    throw new InvalidInputError(`${context} — expected a number or MoneyContract.`, {
      input: value,
    });
  }

  try {
    return numberToMinorUnit(value, currency.fractionDigits);
  } catch (cause) {
    if (cause instanceof MoneyError) throw cause;
    /* v8 ignore next -- @preserve */
    throw new InvalidInputError(`${context} — invalid value.`, { input: value, cause });
  }
}
