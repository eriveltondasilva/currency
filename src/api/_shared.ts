import type { Currency } from '@/lib/currencies';
import type { MoneyInput } from '@/types';

import { toMinorUnit } from '@/lib/convert';
import { CurrencyMismatchError, InvalidInputError } from '@/lib/errors';
import { isMoney } from '@/lib/utils';

export function isEmptyOrNonArray(value: unknown): value is [] {
  return !Array.isArray(value) || value.length === 0;
}

export function resolveMinorUnits(value: MoneyInput, currency: Currency, context: string): number {
  if (isMoney(value) && value.currencyCode() !== currency.code) {
    throw new CurrencyMismatchError(currency.code, value.currencyCode());
  }

  try {
    return toMinorUnit(value, currency);
  } catch (cause) {
    throw new InvalidInputError(`${context} — invalid value.`, { input: value, cause });
  }
}
