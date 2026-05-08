import type { Currency } from './currencies';

import { InvalidInputError } from './errors';

export function numberToMinorUnit(input: number, fractionDigits: number): number {
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

export function stringToMinorUnit(input: string, currency: Currency): number {
  const { group, decimal, fractionDigits } = currency;

  const regex = /[^\d.,+-]/g;
  const cleaned = input.trim().replace(regex, '');

  const normalized = cleaned.replaceAll(group, '').replace(decimal, '.');
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    throw new InvalidInputError(
      `Cannot parse "${input}" as a monetary value. ` +
        `Expected a number using "${decimal}" as decimal separator.`,
      { input },
    );
  }

  return numberToMinorUnit(parsed, fractionDigits);
}
