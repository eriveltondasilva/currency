import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract, MoneyInput, PricedItem } from '@/types';

import { hasNoItems, resolveMinorUnits } from './_shared';
import { zero } from './creation';

import { resolveCurrency } from '@/lib/currencies';
import { DivisionByZeroError, InvalidInputError } from '@/lib/errors';
import { Money } from '@/lib/money';
import { isRecord } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the total cost of a list of priced items.
 *
 * Each item must have a `price` (`number` in major units or `MoneyContract`)
 * and an optional `quantity` (non-negative integer, defaults to `1`).
 * Returns `zero(country)` when `items` is empty.
 *
 * @param items - Array of `{ price, quantity? }` objects. See {@link PricedItem}.
 * @param country - Supported country code that defines the output currency.
 *
 * @returns A new `MoneyContract` with the total amount.
 *
 * @throws `InvalidInputError` - when any item is not a plain object, or `quantity` is not a non-negative integer.
 * @throws `CurrencyMismatchError` - when any `price` is a `MoneyContract` with a different currency.
 * @throws `UnsupportedCurrencyError` - when `country` is not a supported code.
 * @throws `UnsafeIntegerError` - when the accumulated total exceeds `Number.MAX_SAFE_INTEGER`.
 *
 * @example
 * const items = [
 *   { price: 29.90, quantity: 2 },
 *   { price: 9.99 },
 * ];
 *
 * total(items, 'BR').format()
 * // => 'R$ 69,79'
 */
export function total(items: PricedItem[], country: CountryCode): MoneyContract {
  if (hasNoItems(items)) return zero(country);

  const currency = resolveCurrency(country);

  const rawAmount = items.reduce((acc, item, i) => {
    if (!isRecord(item)) {
      throw new InvalidInputError(`total(): index ${i} — expected { price, quantity? }.`, {
        input: item,
      });
    }

    const { price, quantity = 1 } = item;

    const invalidQuantity = !Number.isInteger(quantity) || quantity < 0;
    if (invalidQuantity) {
      throw new InvalidInputError(
        `total(): index ${i} — quantity must be an integer. ` +
          `Fractional quantities produce ambiguous sub-minor-unit values.`,
        { input: quantity },
      );
    }

    const unitAmount = resolveMinorUnits(price, currency, `total(): index ${i} — price`);

    return acc + unitAmount * quantity;
  }, 0);

  return Money.fromMinorUnits(rawAmount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

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
