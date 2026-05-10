import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract, MoneyInput } from '@/types';

import { isEmptyOrNonArray, resolveMinorUnits } from './_shared';
import { zero } from './creation';

import { resolveCurrency } from '@/lib/currencies';
import { InvalidRangeError, UnsafeIntegerError } from '@/lib/errors';
import { DEFAULT_ROUND_FN } from '@/lib/rounding';
import { Money } from '@/money';

// ─────────────────────────────────────────────────────────────────────────────

export function sum(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (isEmptyOrNonArray(values)) return zero(country);

  const currency = resolveCurrency(country);

  const amount = values.reduce<number>((acc, value, i) => {
    return acc + resolveMinorUnits(value, currency, `sum(): index ${i}`);
  }, 0);

  if (!Number.isSafeInteger(amount)) {
    throw new UnsafeIntegerError({ input: amount });
  }

  return Money.fromMinorUnits(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

export function average(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (isEmptyOrNonArray(values)) return zero(country);

  const currency = resolveCurrency(country);

  const amount = values.reduce<number>((acc, value, i) => {
    return acc + resolveMinorUnits(value, currency, `average(): index ${i}`);
  }, 0);

  if (!Number.isSafeInteger(amount)) {
    throw new UnsafeIntegerError({ input: amount });
  }

  return Money.fromMinorUnits(DEFAULT_ROUND_FN(amount / values.length), currency);
}

// ─────────────────────────────────────────────────────────────────────────────

export function max(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (isEmptyOrNonArray(values)) return zero(country);

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

export function min(values: MoneyInput[], country: CountryCode): MoneyContract {
  if (isEmptyOrNonArray(values)) return zero(country);

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
