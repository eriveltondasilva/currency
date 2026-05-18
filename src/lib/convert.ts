import type { Currency } from './currencies';

import { InvalidInputError } from './errors';
import { DEFAULT_ROUND_FN } from './rounding';

// ─────────────────────────────────────────────────────────────────────────────

const ASCII_0 = 48;
const ASCII_9 = 57;
const ASCII_MINUS = 45;
const ASCII_PLUS = 43;

function normalizeNumericString(value: string, decimal: string): string | null {
  let result = '';
  let decimalCount = 0;
  const decimalCode = decimal.charCodeAt(0);

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);

    if (code >= ASCII_0 && code <= ASCII_9) {
      result += value[i];
    } else if (code === decimalCode) {
      if (++decimalCount > 1) return null;
      result += '.';
    }
  }

  return result;
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

export function stringToMinorUnit(input: string, currency: Currency): number {
  const { decimal, fractionDigits } = currency;

  const trimmed = input.trim();
  const firstCode = trimmed.charCodeAt(0);
  const sign = firstCode === ASCII_MINUS ? '-' : firstCode === ASCII_PLUS ? '+' : '';
  const rest = sign ? trimmed.slice(1) : trimmed;

  const normalized = normalizeNumericString(rest, decimal);

  if (normalized === null) {
    throw new InvalidInputError(
      'Cannot parse value as a monetary amount: multiple decimal separators found.',
      { input },
    );
  }

  const parsed = Number.parseFloat(sign + normalized);

  if (Number.isNaN(parsed)) {
    throw new InvalidInputError(
      `Cannot parse value as a monetary amount. Expected "${decimal}" as decimal separator.`,
      { input },
    );
  }

  return numberToMinorUnit(parsed, fractionDigits);
}
