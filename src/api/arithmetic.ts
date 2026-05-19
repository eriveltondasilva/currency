import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract, MoneyInput } from '@/types';

import { resolveMinorUnits } from './_shared';

import { resolveCurrency } from '@/lib/currencies';
import { DivisionByZeroError, InvalidRangeError } from '@/lib/errors';
import { Money } from '@/lib/money';

/**
 * Calculates what percentage `portion` represents of `base`.
 *
 * Both arguments are resolved to minor units before division, ensuring
 * precision. The result is a plain `number`, not a `MoneyContract`.
 *
 * @param value - The partial amount (numerator).
 * @param total - The reference amount (denominator). Must be non-zero.
 * @param country - Supported country code used to resolve both amounts.
 *
 * @returns The percentage as a `number` (e.g. `25` for 25%).
 *
 * @throws `DivisionByZeroError` - when `base` resolves to zero.
 * @throws `CurrencyMismatchError` - when either argument is a `MoneyContract` with a different currency.
 * @throws `UnsupportedCurrencyError` - when `country` is not a supported code.
 *
 * @example
 * percent(25, 200, 'US') // => 12.5
 * percent(1, 3, 'BR')    // => 33.333...
 */
export function percent(value: MoneyInput, total: MoneyInput, country: CountryCode): number {
  const currency = resolveCurrency(country);
  const totalAmount = resolveMinorUnits(total, currency, 'percent(): total');

  if (totalAmount === 0) throw new DivisionByZeroError();

  const valueAmount = resolveMinorUnits(value, currency, 'percent(): part');

  return (valueAmount / totalAmount) * 100;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Constrains a monetary value within a `[min, max]` closed interval.
 *
 * - When `value < min`, returns `min`.
 * - When `value > max`, returns `max`.
 * - Otherwise, returns `value` unchanged.
 *
 * @param value - The amount to constrain.
 * @param min - Lower bound of the interval.
 * @param max - Upper bound of the interval.
 * @param country - Supported country code that defines the output currency.
 *
 * @returns A new `MoneyContract` clamped within `[min, max]`.
 *
 * @throws `InvalidRangeError` - when `min` is greater than `max`.
 * @throws `CurrencyMismatchError` - when any `MoneyContract` argument has a different currency.
 * @throws `UnsupportedCurrencyError` - when `country` is not a supported code.
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
