import type { Currency } from './currencies';

import { InvalidInputError } from './errors';
import { ROUND_FUNCTIONS } from './rounding';

const roundingFn = ROUND_FUNCTIONS.halfExpand;

// ─────────────────────────────────────────────────────────────────────────────

export function numberToMinorUnit(input: number, fractionDigits: number): number {
  if (Number.isNaN(input) || !Number.isFinite(input)) {
    throw new InvalidInputError('Value must be a finite number.', { input });
  }

  if (input === 0) return 0;

  const result = roundingFn(Number(`${input}e${fractionDigits}`));

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

  const signMatch = /^([+-]?)(.*)$/.exec(input.trim());
  const sign = signMatch?.[1] ?? '';
  const rest = signMatch?.[2] ?? '';

  const groupEscaped = group.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const decimalEscaped = decimal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const allowedPattern = new RegExp(`[^\\d${groupEscaped}${decimalEscaped}]`, 'g');
  const cleaned = rest.replace(allowedPattern, '');

  const withoutGroup = cleaned.replaceAll(group, '');

  const decimalCount = withoutGroup.split(decimal).length - 1;
  if (decimalCount > 1) {
    throw new InvalidInputError(
      `Cannot parse value as a monetary amount: multiple decimal separators found.`,
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
