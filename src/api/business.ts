import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract, MoneyInput, PricedItem } from '@/types';

import { hasNoItems, resolveMinorUnits } from './_shared';
import { zero } from './creation';

import { resolveCurrency } from '@/lib/currencies';
import { DivisionByZeroError, InvalidInputError } from '@/lib/errors';
import { isRecord } from '@/lib/utils';
import { Money } from '@/money';

// ─────────────────────────────────────────────────────────────────────────────

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

export function percent(portion: MoneyInput, base: MoneyInput, country: CountryCode): number {
  const currency = resolveCurrency(country);
  const baseAmount = resolveMinorUnits(base, currency, 'percent(): whole');

  if (baseAmount === 0) throw new DivisionByZeroError();

  const portionAmount = resolveMinorUnits(portion, currency, 'percent(): part');

  return (portionAmount / baseAmount) * 100;
}
