import type { CurrencyLocale } from '@/lib/constants';

import { CENT_FACTOR, CURRENCY_LOCALES, DEFAULT_MONEY_OPTIONS } from '@/lib/constants';
import { InvalidInputError } from '@/lib/errors';
import { isMoney, isNil, isString } from '@/lib/utils';

// ─── Internal helpers ────────────────────────────────────────────────────────

type Separators = { decimal: string; group: string };

const separatorCache = new Map<CurrencyLocale, Separators>();

const DEFAULT_LOCALE: CurrencyLocale = CURRENCY_LOCALES[DEFAULT_MONEY_OPTIONS.currencyCode];

function getSeparators(locale: CurrencyLocale): Separators {
  if (separatorCache.has(locale)) return separatorCache.get(locale) as Separators;

  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
  const result = {
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
  };

  separatorCache.set(locale, result);
  return result;
}

function normalizeDecimal(input: string, locale: CurrencyLocale): string {
  const { decimal, group } = getSeparators(locale);

  return input.replace(new RegExp(RegExp.escape(group), 'g'), '').replace(decimal, '.');
}

function numberToMinorUnit(input: number): number {
  if (!Number.isFinite(input)) {
    throw new InvalidInputError(`Expected a finite number, got ${input}.`);
  }
  return input === 0 ? 0 : Math.round(input * CENT_FACTOR);
}

function stringToMinorUnit(input: string, locale: CurrencyLocale): number {
  const cleaned = input.trim().replace(/[^\d.,+-]/g, '');

  if (cleaned === '' || cleaned === '-' || cleaned === '+') return 0;

  const normalized = normalizeDecimal(cleaned, locale);
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    throw new InvalidInputError(`Cannot parse "${input}" as a monetary value.`, input);
  }

  return numberToMinorUnit(parsed);
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function toMinorUnit(input: unknown, locale: CurrencyLocale = DEFAULT_LOCALE): number {
  if (isNil(input)) {
    throw new InvalidInputError('Value cannot be null or undefined.', input);
  }

  if (isMoney(input)) return input.cents();

  if (isString(input)) return stringToMinorUnit(input, locale);

  return numberToMinorUnit(Number(input));
}
