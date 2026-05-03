import type { CurrencyLocale, MoneyInput } from '@/types';

import { CENT_FACTOR } from '@/constants';
import { InvalidInputError } from '@/errors';
import { isMoney, isNil, isString } from '@/utils';

// ─── Internal helpers ─────────────────────────────────────────────────────────
type Separators = { decimal: string; group: string };

const separatorCache = new Map<string, Separators>();

function getSeparators(locale: string): Separators {
  if (separatorCache.has(locale)) return separatorCache.get(locale) as Separators;

  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
  const result = {
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
  };

  separatorCache.set(locale, result);
  return result;
}

function normalizeDecimal(input: string, locale: string): string {
  const { decimal, group } = getSeparators(locale);

  return input.replace(new RegExp(RegExp.escape(group), 'g'), '').replace(decimal, '.');
}

function numberToMinorUnit(input: number): number {
  if (!Number.isFinite(input)) {
    throw new InvalidInputError(`Expected a finite number, got ${input}.`);
  }
  return input === 0 ? 0 : Math.round(input * CENT_FACTOR);
}

function stringToMinorUnit(input: string, locale: string): number {
  const cleaned = input.trim().replace(/[^\d.,+-]/g, '');

  if (cleaned === '' || cleaned === '-' || cleaned === '+') return 0;

  const parsed = Number.parseFloat(normalizeDecimal(cleaned, locale));

  if (Number.isNaN(parsed)) {
    throw new InvalidInputError(`Cannot parse "${input}" as a monetary value.`);
  }

  return numberToMinorUnit(parsed);
}

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * Converts any accepted monetary input to integer minor units (e.g. cents).
 *
 * String parsing uses `locale` to detect separators automatically.
 *
 * @throws {InvalidInputError} if the value is null, undefined, NaN, or Infinity.
 */
export function toMinorUnit(input: MoneyInput, locale: CurrencyLocale): number {
  if (isNil(input)) {
    throw new InvalidInputError('Value cannot be null or undefined.', input);
  }

  if (isMoney(input)) return input.cents();

  if (isString(input)) return stringToMinorUnit(input, locale);

  return numberToMinorUnit(Number(input));
}
