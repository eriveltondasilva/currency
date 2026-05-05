import type { CurrencyConfig } from './currencies';

import { DEFAULT_CURRENCY } from '@/lib/currencies';
import { InvalidInputError } from '@/lib/errors';
import { isMoney, isNil, isString } from '@/lib/utils';

// ─── Internal helpers ────────────────────────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeDecimal(input: string, currency: CurrencyConfig): string {
  const { decimal, group } = currency;

  return input.replace(new RegExp(escapeRegex(group), 'g'), '').replace(decimal, '.');
}

function numberToMinorUnit(input: number, minorUnit: number): number {
  if (Number.isNaN(input)) {
    throw new InvalidInputError('Expected a finite number, got NaN.', input);
  }

  if (!Number.isFinite(input)) {
    throw new InvalidInputError(
      `Expected a finite number, got ${input > 0 ? '+Infinity' : '-Infinity'}.`,
      input,
    );
  }

  return input === 0 ? 0 : Math.round(input * minorUnit);
}

function stringToMinorUnit(input: string, currency: CurrencyConfig): number {
  const cleaned = input.trim().replace(/[^\d.,+-]/g, '');

  if (cleaned === '' || cleaned === '-' || cleaned === '+') return 0;

  const normalized = normalizeDecimal(cleaned, currency);
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    throw new InvalidInputError(
      `Cannot parse "${input}" as a monetary value. ` +
        `Expected a number using "${currency.decimal}" as decimal separator.`,
      input,
    );
  }

  return numberToMinorUnit(parsed, currency.minorUnit);
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function toMinorUnit(input: unknown, currency: CurrencyConfig = DEFAULT_CURRENCY): number {
  if (isNil(input)) {
    throw new InvalidInputError(`Value cannot be null or undefined. Received: ${input}.`, input);
  }

  if (isMoney(input)) return input.amount();

  if (isString(input)) return stringToMinorUnit(input, currency);

  return numberToMinorUnit(Number(input), currency.minorUnit);
}
