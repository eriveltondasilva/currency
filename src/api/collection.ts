import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract, MoneyInput } from '@/types';

import { isEmptyOrNonArray, resolveMinorUnits } from './_shared';
import { zero } from './creation';

import { resolveCurrency } from '@/lib/currencies';
import { InvalidRangeError } from '@/lib/errors';
import { Money } from '@/money';

export function sum(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (isEmptyOrNonArray(values)) return zero(country);

  const currency = resolveCurrency(country);

  const amount = values.reduce<number>((acc, value, i) => {
    return acc + resolveMinorUnits(value, currency, `sum(): index ${i}`);
  }, 0);

  return Money.fromMinorUnits(amount, currency);
}

export function average(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (isEmptyOrNonArray(values)) return zero(country);

  const currency = resolveCurrency(country);

  const amount = values.reduce<number>((acc, value, i) => {
    return acc + resolveMinorUnits(value, currency, `average(): index ${i}`);
  }, 0);

  return Money.fromMinorUnits(Math.round(amount / values.length), currency);
}

export function max(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (isEmptyOrNonArray(values)) return zero(country);

  const currency = resolveCurrency(country);
  let result = -Infinity;

  for (const [i, value] of values.entries()) {
    const amount = resolveMinorUnits(value, currency, `max(): index ${i}`);
    if (amount > result) result = amount;
  }

  return Money.fromMinorUnits(result, currency);
}

export function min(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (isEmptyOrNonArray(values)) return zero(country);

  const currency = resolveCurrency(country);
  let result = Infinity;

  for (const [i, value] of values.entries()) {
    const amount = resolveMinorUnits(value, currency, `min(): index ${i}`);
    if (amount < result) result = amount;
  }

  return Money.fromMinorUnits(result, currency);
}

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
