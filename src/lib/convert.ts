import type { Currency } from './currencies';

import { InvalidInputError } from './errors';
import { isMoney, isNil, isNumber, isString } from './utils';

// ─── Internal helpers ────────────────────────────────────────────────────────

function normalizeDecimal(input: string, group: string, decimal: string): string {
  return input.replaceAll(group, '').replace(decimal, '.');
}

function numberToMinorUnit(input: number, fractionDigits: number): number {
  if (Number.isNaN(input)) {
    throw new InvalidInputError('Expected a finite number, got NaN.', { input });
  }

  if (!Number.isFinite(input)) {
    throw new InvalidInputError(
      `Expected a finite number, got ${input > 0 ? '+Infinity' : '-Infinity'}.`,
      { input },
    );
  }

  if (input === 0) return 0;

  const result = Math.round(Number(`${input}e${fractionDigits}`));

  if (!Number.isFinite(result)) {
    throw new InvalidInputError(
      `Value ${input} is too large to be represented as a monetary amount.`,
      { input },
    );
  }

  return result;
}

function stringToMinorUnit(input: string, currency: Currency): number {
  const regex = /[^\d.,+-]/g;
  const cleaned = input.trim().replace(regex, '');

  const normalized = normalizeDecimal(cleaned, currency.group, currency.decimal);
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    throw new InvalidInputError(
      [
        `Cannot parse "${input}" as a monetary value. `,
        `Expected a number using "${currency.decimal}" as decimal separator.`,
      ].join(''),
      { input },
    );
  }

  return numberToMinorUnit(parsed, currency.fractionDigits);
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function toMinorUnit(input: unknown, currency: Currency): number {
  if (isNil(input)) {
    throw new InvalidInputError(`Value cannot be null or undefined. Received: ${input}.`, {
      input,
    });
  }

  if (isMoney(input)) return input.amount();
  if (isString(input)) return stringToMinorUnit(input, currency);
  if (isNumber(input)) return numberToMinorUnit(input, currency.fractionDigits);

  throw new InvalidInputError(
    `Unsupported input type for monetary value. Received: typeof ${typeof input}`,
    { input },
  );
}
