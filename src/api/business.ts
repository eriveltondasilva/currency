import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract, MoneyInput, PricedItem } from '@/types';

import { isEmptyOrNonArray, resolveMinorUnits } from './_shared';
import { zero } from './creation';

import { DEFAULT_COUNTRY_CODE, resolveCurrency } from '@/lib/currencies';
import { DivisionByZeroError, InvalidInputError } from '@/lib/errors';
import { isNumber, isRecord } from '@/lib/utils';
import { Money } from '@/money';

export function total(
  items: PricedItem[],
  country: CountryCode = DEFAULT_COUNTRY_CODE,
): MoneyContract {
  if (isEmptyOrNonArray(items)) return zero(country);

  const currency = resolveCurrency(country);

  const amount = items.reduce((acc, item, i) => {
    if (!isRecord(item)) {
      throw new InvalidInputError(
        `total(): index ${i} — expected { price, quantity? }, got ${String(item)}.`,
        { input: item },
      );
    }

    const { price, quantity = 1 } = item;

    if (!isNumber(quantity) || !Number.isFinite(quantity) || quantity < 0) {
      throw new InvalidInputError(
        `total(): index ${i} — quantity must be a non-negative finite number, got ${String(quantity)}.`,
        { input: quantity },
      );
    }

    const unitAmount = resolveMinorUnits(price, currency, `total(): index ${i} — price`);

    return acc + Math.round(unitAmount * quantity);
  }, 0);

  return Money.fromMinorUnits(amount, currency);
}

export function percent(
  part: MoneyInput,
  whole: MoneyInput,
  country: CountryCode = DEFAULT_COUNTRY_CODE,
): number {
  const currency = resolveCurrency(country);
  const wholeAmount = resolveMinorUnits(whole, currency, 'percent(): whole');

  if (wholeAmount === 0) throw new DivisionByZeroError();

  const partAmount = resolveMinorUnits(part, currency, 'percent(): part');

  return (partAmount / wholeAmount) * 100;
}
