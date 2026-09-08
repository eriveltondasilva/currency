import type { MoneyContract, RoundingMode } from '@/types';

import { InvalidInputError } from '@/lib/errors';
import { DEFAULT_ROUNDING_MODE } from '@/lib/rounding';
import { hasNoItems, isMoney } from '@/lib/utils';

/**
 * Sums an array of `MoneyContract` values.
 *
 * All items must share the same `currencyCode` — passing a mismatched
 * currency throws `CurrencyMismatchError`.
 *
 * @param values - Non-empty array of `MoneyContract` instances, all in the same currency.
 *
 * @returns A new `MoneyContract` with the total sum.
 *
 * @throws `InvalidInputError` - when `values` is empty or contains a non-`MoneyContract` item.
 * @throws `CurrencyMismatchError` - when any item has a different `currencyCode`.
 *
 * @example
 * sum([from(10, 'BR'), from(20.50, 'BR'), from(5, 'BR')]).format() // => 'R$ 35,50'
 */
export function sum(values: MoneyContract[]): MoneyContract {
  if (hasNoItems(values) || !values.every(isMoney)) {
    throw new InvalidInputError('sum(): expected a non-empty array of Money.', {
      input: values,
    });
  }

  const [firstValue, ...rest] = values;

  return rest.reduce<MoneyContract>((acc, value) => acc.plus(value), firstValue as MoneyContract);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the arithmetic mean of an array of `MoneyContract` values.
 *
 * The result is rounded to the nearest minor unit using `roundingMode`.
 * All items must share the same `currencyCode`.
 *
 * @param values - Non-empty array of `MoneyContract` instances, all in the same currency.
 * @param roundingMode - Rounding strategy applied to the result. Defaults to `'halfExpand'`.
 *
 * @returns A new `MoneyContract` with the average amount.
 *
 * @throws `InvalidInputError` - when `values` is empty or contains a non-`MoneyContract` item.
 * @throws `CurrencyMismatchError` - when any item has a different `currencyCode`.
 *
 * @example
 * average([from(10, 'US'), from(20, 'US'), from(30, 'US')]).amount() // => 20
 */
export function average(
  values: MoneyContract[],
  roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE,
): MoneyContract {
  if (hasNoItems(values) || !values.every(isMoney)) {
    throw new InvalidInputError('average(): expected a non-empty array of MoneyContract.', {
      input: values,
    });
  }

  const [firstValue, ...rest] = values;
  const total = rest.reduce<MoneyContract>(
    (acc, value) => acc.plus(value),
    firstValue as MoneyContract,
  );

  return total.divide(values.length, roundingMode);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the largest value in an array of `MoneyContract` values.
 *
 * @param values - Non-empty array of `MoneyContract` instances, all in the same currency.
 *
 * @returns The `MoneyContract` instance with the highest amount.
 *
 * @throws `InvalidInputError` - when `values` is empty or contains a non-`MoneyContract` item.
 * @throws `CurrencyMismatchError` - when any item has a different `currencyCode`.
 *
 * @example
 * max([from(5, 'US'), from(30, 'US'), from(10, 'US')]).amount() // => 30
 */
export function max(values: MoneyContract[]): MoneyContract {
  if (hasNoItems(values) || !values.every(isMoney)) {
    throw new InvalidInputError('max(): expected a non-empty array of MoneyContract.', {
      input: values,
    });
  }

  const [firstValue, ...rest] = values;

  return rest.reduce<MoneyContract>((acc, value) => acc.max(value), firstValue as MoneyContract);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the smallest value in an array of `MoneyContract` values.
 *
 * @param values - Non-empty array of `MoneyContract` instances, all in the same currency.
 *
 * @returns The `MoneyContract` instance with the lowest amount.
 *
 * @throws `InvalidInputError` - when `values` is empty or contains a non-`MoneyContract` item.
 * @throws `CurrencyMismatchError` - when any item has a different `currencyCode`.
 *
 * @example
 * min([from(5, 'US'), from(30, 'US'), from(10, 'US')]).amount() // => 5
 */
export function min(values: MoneyContract[]): MoneyContract {
  if (hasNoItems(values) || !values.every(isMoney)) {
    throw new InvalidInputError('min(): expected a non-empty array of MoneyContract.', {
      input: values,
    });
  }

  const [firstValue, ...rest] = values;

  return rest.reduce<MoneyContract>((acc, value) => acc.min(value), firstValue as MoneyContract);
}
