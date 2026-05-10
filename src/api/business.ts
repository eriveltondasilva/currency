import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract, MoneyInput, PricedItem } from '@/types';

import { isEmptyOrNonArray, resolveMinorUnits } from './_shared';
import { zero } from './creation';

import { resolveCurrency } from '@/lib/currencies';
import { DivisionByZeroError, InvalidInputError } from '@/lib/errors';
import { DEFAULT_ROUND_FN } from '@/lib/rounding';
import { isRecord } from '@/lib/utils';
import { Money } from '@/money';

// ─────────────────────────────────────────────────────────────────────────────

export function total(items: PricedItem[], country: CountryCode): MoneyContract {
  if (isEmptyOrNonArray(items)) return zero(country);

  const currency = resolveCurrency(country);

  const rawAmount = items.reduce((acc, item, i) => {
    if (!isRecord(item)) {
      throw new InvalidInputError(`total(): index ${i} — expected { price, quantity? }.`, {
        input: item,
      });
    }

    const { price, quantity = 1 } = item;

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new InvalidInputError(
        `total(): index ${i} — quantity must be an integer. ` +
          `Fractional quantities produce ambiguous sub-minor-unit values.`,
        { input: quantity },
      );
    }

    const unitAmount = resolveMinorUnits(price, currency, `total(): index ${i} — price`);

    return acc + unitAmount * quantity;
  }, 0);

  return Money.fromMinorUnits(DEFAULT_ROUND_FN(rawAmount), currency);
}

// ─────────────────────────────────────────────────────────────────────────────

export function percent(part: MoneyInput, whole: MoneyInput, country: CountryCode): number {
  const currency = resolveCurrency(country);
  const wholeAmount = resolveMinorUnits(whole, currency, 'percent(): whole');

  if (wholeAmount === 0) throw new DivisionByZeroError();

  const partAmount = resolveMinorUnits(part, currency, 'percent(): part');

  return (partAmount / wholeAmount) * 100;
}
