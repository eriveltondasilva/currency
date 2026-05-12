import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract, MoneyInput } from '@/types';

import { hasNoItems, resolveMinorUnits } from './_shared';
import { zero } from './creation';

import { resolveCurrency } from '@/lib/currencies';
import { InvalidInputError, InvalidRangeError } from '@/lib/errors';
import { DEFAULT_ROUND_FN } from '@/lib/rounding';
import { Money } from '@/money';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sums an array of monetary values.
 *
 * Returns `zero(country)` when `values` is empty.
 * All values must share the same currency as `country` — passing a
 * `MoneyContract` with a different currency throws `CurrencyMismatchError`.
 *
 * @param values — Array of amounts as numbers (major units) or `MoneyContract` instances.
 * @param country — Supported country code that defines the output currency.
 *
 * @returns A new `MoneyContract` with the total sum.
 *
 * @throws `CurrencyMismatchError` — when any `MoneyContract` in `values` has a different currency.
 * @throws `UnsupportedCurrencyError` — when `country` is not a supported code.
 * @throws `UnsafeIntegerError` — when the accumulated sum exceeds `Number.MAX_SAFE_INTEGER`.
 *
 * @example
 * sum([10, 20.50, 5], 'BR').format() // => 'R$ 35,50'
 * sum([], 'US').isZero()             // => true
 */
export function sum(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (hasNoItems(values)) return zero(country);

  const currency = resolveCurrency(country);

  const amount = values.reduce<number>((acc, value, i) => {
    return acc + resolveMinorUnits(value, currency, `sum(): index ${i}`);
  }, 0);

  return Money.fromMinorUnits(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the arithmetic mean of an array of monetary values.
 *
 * The result is rounded to the nearest minor unit using `'halfExpand'`.
 * Returns `zero(country)` when `values` is empty.
 *
 * @param values — Array of amounts as numbers (major units) or `MoneyContract` instances.
 * @param country — Supported country code that defines the output currency.
 *
 * @returns A new `MoneyContract` with the average amount.
 *
 * @throws `CurrencyMismatchError` — when any `MoneyContract` in `values` has a different currency.
 * @throws `UnsupportedCurrencyError` — when `country` is not a supported code.
 *
 * @example
 * average([10, 20, 30], 'US').amount() // => 20
 * average([1, 2], 'BR').amount()       // => 1.5
 */
export function average(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (hasNoItems(values)) return zero(country);

  const currency = resolveCurrency(country);

  const amount = values.reduce<number>((acc, value, i) => {
    return acc + resolveMinorUnits(value, currency, `average(): index ${i}`);
  }, 0);

  return Money.fromMinorUnits(DEFAULT_ROUND_FN(amount / values.length), currency);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the largest value in an array of monetary values.
 *
 * Unlike {@link sum} and {@link average}, `max` requires at least one element.
 *
 * @param values — Non-empty array of amounts as numbers (major units) or `MoneyContract` instances.
 * @param country — Supported country code that defines the output currency.
 *
 * @returns A new `MoneyContract` representing the maximum amount.
 *
 * @throws `InvalidInputError` — when `values` is empty.
 * @throws `CurrencyMismatchError` — when any `MoneyContract` in `values` has a different currency.
 * @throws `UnsupportedCurrencyError` — when `country` is not a supported code.
 *
 * @example
 * max([5, 30, 10], 'US').amount() // => 30
 */
export function max(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (hasNoItems(values)) {
    throw new InvalidInputError('max(): array must have at least one element.', { input: values });
  }

  const currency = resolveCurrency(country);

  const amount = values.slice(1).reduce<number>(
    (acc, value, i) => {
      const current = resolveMinorUnits(value, currency, `max(): index ${i + 1}`);
      return current > acc ? current : acc;
    },
    resolveMinorUnits(values[0] as MoneyInput, currency, 'max(): index 0'),
  );

  return Money.fromMinorUnits(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the smallest value in an array of monetary values.
 *
 * Unlike {@link sum} and {@link average}, `min` requires at least one element.
 *
 * @param values — Non-empty array of amounts as numbers (major units) or `MoneyContract` instances.
 * @param country — Supported country code that defines the output currency.
 *
 * @returns A new `MoneyContract` representing the minimum amount.
 *
 * @throws `InvalidInputError` — when `values` is empty.
 * @throws `CurrencyMismatchError` — when any `MoneyContract` in `values` has a different currency.
 * @throws `UnsupportedCurrencyError` — when `country` is not a supported code.
 *
 * @example
 * min([5, 30, 10], 'US').amount() // => 5
 */
export function min(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (hasNoItems(values)) {
    throw new InvalidInputError('min(): array must have at least one element.', { input: values });
  }

  const currency = resolveCurrency(country);

  const amount = values.slice(1).reduce<number>(
    (acc, value, i) => {
      const current = resolveMinorUnits(value, currency, `min(): index ${i + 1}`);
      return current < acc ? current : acc;
    },
    resolveMinorUnits(values[0] as MoneyInput, currency, 'min(): index 0'),
  );

  return Money.fromMinorUnits(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Constrains a monetary value within a `[min, max]` closed interval.
 *
 * - When `value < min`, returns `min`.
 * - When `value > max`, returns `max`.
 * - Otherwise, returns `value` unchanged.
 *
 * @param value — The amount to constrain.
 * @param min — Lower bound of the interval.
 * @param max — Upper bound of the interval.
 * @param country — Supported country code that defines the output currency.
 *
 * @returns A new `MoneyContract` clamped within `[min, max]`.
 *
 * @throws `InvalidRangeError` — when `min` is greater than `max`.
 * @throws `CurrencyMismatchError` — when any `MoneyContract` argument has a different currency.
 * @throws `UnsupportedCurrencyError` — when `country` is not a supported code.
 *
 * @example
 * clamp(150, 0, 100, 'US').amount() // => 100
 * clamp(-10, 0, 100, 'US').amount() // => 0
 * clamp(50, 0, 100, 'US').amount()  // => 50
 */
export function clamp(
  value: MoneyInput,
  min: MoneyInput,
  max: MoneyInput,
  country: CountryCode,
): MoneyContract {
  const currency = resolveCurrency(country);

  const minAmount = resolveMinorUnits(min, currency, 'clamp(): min');
  const maxAmount = resolveMinorUnits(max, currency, 'clamp(): max');

  if (minAmount > maxAmount) throw new InvalidRangeError();

  return Money.fromMinorUnits(
    Math.min(Math.max(resolveMinorUnits(value, currency, 'clamp(): value'), minAmount), maxAmount),
    currency,
  );
}
