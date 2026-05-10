import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract } from '@/types';

import { numberToMinorUnit, stringToMinorUnit } from '@/lib/convert';
import { resolveCurrency } from '@/lib/currencies';
import { InvalidInputError } from '@/lib/errors';
import { Money } from '@/money';

function assertNotNull(value: unknown): void {
  if (value != null) return;
  throw new InvalidInputError('Value cannot be null or undefined.', { input: value });
}

// ─────────────────────────────────────────────────────────────────────────────
export function from(value: number, country: CountryCode): MoneyContract {
  assertNotNull(value);

  if (typeof value !== 'number') {
    throw new InvalidInputError(`Expected a number.`, { input: value });
  }

  const currency = resolveCurrency(country);
  const amount = numberToMinorUnit(value, currency.fractionDigits);

  return Money.fromMinorUnits(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

export function parse(value: string, country: CountryCode): MoneyContract {
  assertNotNull(value);

  if (typeof value !== 'string') {
    throw new InvalidInputError(`Expected a string.`, { input: value });
  }

  const currency = resolveCurrency(country);
  const amount = stringToMinorUnit(value, currency);

  return Money.fromMinorUnits(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

export function fromMinorUnits(value: number, country: CountryCode): MoneyContract {
  assertNotNull(value);

  if (!Number.isFinite(value)) {
    throw new InvalidInputError('fromMinorUnits(): value must be a finite number.', {
      input: value,
    });
  }

  if (!Number.isInteger(value)) {
    throw new InvalidInputError('fromMinorUnits(): value must be an integer.', { input: value });
  }

  if (!Number.isSafeInteger(value)) {
    throw new InvalidInputError('fromMinorUnits(): value exceeds safe integer range.', {
      input: value,
    });
  }

  const currency = resolveCurrency(country);
  return Money.fromMinorUnits(value, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

export function zero(country: CountryCode): MoneyContract {
  const currency = resolveCurrency(country);
  return Money.zero(currency);
}
