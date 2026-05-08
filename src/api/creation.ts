import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract } from '@/types';

import { numberToMinorUnit, stringToMinorUnit } from '@/lib/convert';
import { resolveCurrency } from '@/lib/currencies';
import { InvalidInputError } from '@/lib/errors';
import { Money } from '@/money';

export function from(value: unknown, country: CountryCode): MoneyContract {
  if (value == null) {
    throw new InvalidInputError('Value cannot be null or undefined.', { input: value });
  }

  if (typeof value !== 'number') {
    throw new InvalidInputError(`Expected a number, got ${typeof value}.`, { input: value });
  }

  const currency = resolveCurrency(country);
  const amount = numberToMinorUnit(value, currency.fractionDigits);

  return Money.fromMinorUnits(amount, currency);
}

export function parse(value: unknown, country: CountryCode): MoneyContract {
  if (value == null) {
    throw new InvalidInputError(`Value cannot be null or undefined.`, { input: value });
  }

  if (typeof value !== 'string') {
    throw new InvalidInputError(`Expected a string, got ${typeof value}.`, { input: value });
  }

  const currency = resolveCurrency(country);
  const amount = stringToMinorUnit(value, currency);

  return Money.fromMinorUnits(amount, currency);
}

export function fromMinorUnits(value: number, country: CountryCode): MoneyContract {
  const currency = resolveCurrency(country);
  return Money.fromMinorUnits(value, currency);
}

export function zero(country: CountryCode): MoneyContract {
  const currency = resolveCurrency(country);
  return Money.zero(currency);
}
