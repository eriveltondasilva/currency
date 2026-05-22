import type { Currency } from './currencies';

import { InvalidInputError } from './errors';
import { DEFAULT_ROUND_FN } from './rounding';

// ─────────────────────────────────────────────────────────────────────────────

const ASCII = {
  DIGIT_0: 48,
  DIGIT_9: 57,
  MINUS: 45,
  PLUS: 43,
} as const;

function parseNumericString(value: string, decimalChar: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const decimalCode = decimalChar.charCodeAt(0);
  const first = trimmed.charCodeAt(0);
  const hasSign = first === ASCII.MINUS || first === ASCII.PLUS;
  const sign = first === ASCII.MINUS ? '-' : '';

  let result = '';
  let decimalCount = 0;
  let hasDigits = false;

  for (let i = hasSign ? 1 : 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);

    if (code >= ASCII.DIGIT_0 && code <= ASCII.DIGIT_9) {
      result += trimmed[i];
      hasDigits = true;
    } else if (code === decimalCode) {
      if (++decimalCount > 1) return null;
      result += '.';
    }
  }

  return hasDigits ? sign + result : null;
}

// ─────────────────────────────────────────────────────────────────────────────

export function numberToMinorUnit(input: number, fractionDigits: number): number {
  if (!Number.isFinite(input)) {
    throw new InvalidInputError('Value must be a finite number.', { input });
  }

  if (input === 0) return 0;

  /**
   * Uses scientific notation string trick to avoid floating-point errors.
   * @example 19.99 with fractionDigits=2 → Number("19.99e2") → 1999 (exact)
   */
  const result = DEFAULT_ROUND_FN(Number(`${input}e${fractionDigits}`));

  if (!Number.isSafeInteger(result)) {
    throw new InvalidInputError(
      'Value cannot be represented as a monetary amount in minor units.',
      { input },
    );
  }

  return result;
}

export function stringToMinorUnit(input: string, currency: Currency): number {
  const { decimal, fractionDigits } = currency;
  const normalized = parseNumericString(input, decimal);

  if (normalized === null) {
    throw new InvalidInputError(
      `Cannot parse value as a monetary amount. Expected "${decimal}" as decimal separator.`,
      { input },
    );
  }

  const parsed = Number.parseFloat(normalized);

  return numberToMinorUnit(parsed, fractionDigits);
}
