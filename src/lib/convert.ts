import { InvalidInputError } from './errors';
import { DEFAULT_ROUND_FN } from './rounding';

const ASCII = {
  DIGIT_0: 48,
  DIGIT_9: 57,
  MINUS: 45,
  PLUS: 43,
} as const;

function parseNumericString(value: string, decimalChar: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new InvalidInputError('Value cannot be empty or contain only whitespace.', {
      input: value,
    });
  }

  const decimalCode = decimalChar.charCodeAt(0);
  const first = trimmed.charCodeAt(0);
  const isNegative = first === ASCII.MINUS;
  const isPositive = first === ASCII.PLUS;
  const hasSign = isNegative || isPositive;
  const sign = isNegative ? '-' : '';

  let normalized = '';
  let decimalCount = 0;
  let hasDigits = false;

  for (let i = hasSign ? 1 : 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const code = trimmed.charCodeAt(i);

    if (code >= ASCII.DIGIT_0 && code <= ASCII.DIGIT_9) {
      normalized += char;
      hasDigits = true;
    } else if (code === decimalCode) {
      decimalCount += 1;

      if (decimalCount > 1) {
        throw new InvalidInputError(
          `Multiple decimal separators ('${decimalChar}') found in string.`,
          { input: value },
        );
      }

      normalized += '.';
    } else {
      // Silently ignores unknown characters (currency symbols, thousand separators, etc).
    }
  }

  if (!hasDigits) {
    throw new InvalidInputError('Value must contain at least one digit.', { input: value });
  }

  return sign + normalized;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a number to a raw integer in minor units.
 *
 * @internal
 *
 * @example
 * 19.99 with fractionDigits = 2 → 1999
 */
export function numberToMinorUnit(input: number, fractionDigits: number): number {
  if (!Number.isFinite(input)) {
    throw new InvalidInputError('Value must be a finite number (not NaN or Infinity).', { input });
  }

  if (input === 0) return 0;

  const inputAsString = `${input}`;

  if (inputAsString.includes('e')) {
    throw new InvalidInputError(
      'Value magnitude is too small or too large to convert safely (outside 1e-6..1e21 range).',
      { input },
    );
  }

  /**
   * Uses scientific notation string trick to avoid floating-point errors.
   *
   * @example
   * 19.99 with fractionDigits=2 → Number("19.99e2") → 1999 (exact)
   */
  const result = DEFAULT_ROUND_FN(Number(`${inputAsString}e${fractionDigits}`));

  if (!Number.isSafeInteger(result)) {
    throw new InvalidInputError(
      'Value cannot be represented as a monetary amount in minor units (i.e. safe integer).',
      { input },
    );
  }

  return result;
}

/**
 * Converts a locale-formatted string to a raw integer in minor units.
 *
 * @internal
 *
 * @example
 * "19.99" with fractionDigits = 2 → 1999
 */
export function stringToMinorUnit(input: string, decimal: string, fractionDigits: number): number {
  const parsed = Number.parseFloat(parseNumericString(input, decimal));
  return numberToMinorUnit(parsed, fractionDigits);
}
