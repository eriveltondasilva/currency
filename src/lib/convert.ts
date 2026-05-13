import type { Currency } from './currencies';

import { InvalidInputError } from './errors';
import { DEFAULT_ROUND_FN } from './rounding';

// ─────────────────────────────────────────────────────────────────────────────

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const regexCache = new Map<string, RegExp>();

function getAllowedPattern(group: string, decimal: string): RegExp {
  const key = `${group}\x00${decimal}`;

  if (!regexCache.has(key)) {
    regexCache.set(key, new RegExp(`[^\\d${escapeRegex(group)}${escapeRegex(decimal)}]`, 'g'));
  }

  // biome-ignore lint/style/noNonNullAssertion: map never returns null
  return regexCache.get(key)!;
}

// ─────────────────────────────────────────────────────────────────────────────

export function numberToMinorUnit(input: number, fractionDigits: number): number {
  if (!Number.isFinite(input)) {
    throw new InvalidInputError('Value must be a finite number.', { input });
  }

  if (input === 0) return 0;

  const result = DEFAULT_ROUND_FN(Number(`${input}e${fractionDigits}`));

  if (!Number.isFinite(result)) {
    throw new InvalidInputError('Value is too large to be represented as a monetary amount.', {
      input,
    });
  }

  if (!Number.isSafeInteger(result)) {
    throw new InvalidInputError(
      'Value exceeds safe integer range after conversion to minor units.',
      { input },
    );
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────

export function stringToMinorUnit(input: string, currency: Currency): number {
  const { group, decimal, fractionDigits } = currency;

  const [, sign = '', rest = ''] = /^([+-]?)(.*)$/.exec(input.trim()) ?? [];

  const allowedPattern = getAllowedPattern(group, decimal);
  const sanitizedValue = rest.replace(allowedPattern, '');
  const withoutGroup = sanitizedValue.replaceAll(group, '');

  const hasMultipleDecimals = withoutGroup.indexOf(decimal) !== withoutGroup.lastIndexOf(decimal);

  if (hasMultipleDecimals) {
    throw new InvalidInputError(
      'Cannot parse value as a monetary amount: multiple decimal separators found.',
      { input },
    );
  }

  const normalized = sign + withoutGroup.replace(decimal, '.');
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    throw new InvalidInputError(
      `Cannot parse value as a monetary amount. Expected "${decimal}" as decimal separator.`,
      { input },
    );
  }

  return numberToMinorUnit(parsed, fractionDigits);
}
