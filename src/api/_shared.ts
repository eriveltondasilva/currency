import type { Currency } from '@/lib/currencies';
import type { MoneyInput } from '@/types';

import { numberToMinorUnit } from '@/lib/convert';
import { CurrencyMismatchError, InvalidInputError } from '@/lib/errors';
import { isMoney } from '@/lib/utils';

export function isEmptyOrNonArray(value: unknown): value is [] {
  return !Array.isArray(value) || value.length === 0;
}

export function resolveMinorUnits(value: MoneyInput, currency: Currency, context: string): number {
  if (value == null) {
    throw new InvalidInputError(
      `${context} — value cannot be null or undefined. Received: ${value}.`,
      { input: value },
    );
  }

  if (isMoney(value) && value.currencyCode() !== currency.code) {
    throw new CurrencyMismatchError(currency.code, value.currencyCode());
  }

  if (isMoney(value)) {
    return value.amount();
  }

  if (typeof value !== 'number') {
    throw new InvalidInputError(
      `${context} — expected a number or MoneyContract, got ${typeof value}.`,
      { input: value },
    );
  }

  try {
    return numberToMinorUnit(value, currency.fractionDigits);
  } catch (cause) {
    throw new InvalidInputError(`${context} — invalid value.`, { input: value, cause });
  }
}
