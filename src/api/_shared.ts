import type { Currency } from '@/lib/currencies';
import type { MoneyInput } from '@/types';

import { isMoney } from './type-guards';

import { numberToMinorUnit } from '@/lib/convert';
import { CurrencyMismatchError, InvalidInputError, MoneyError } from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

export function hasNoItems(value: unknown): value is [] {
  return !Array.isArray(value) || value.length === 0;
}

// ─────────────────────────────────────────────────────────────────────────────

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
