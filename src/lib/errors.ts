/**
 * Discriminant union of all error codes produced by this library.
 * Available on every {@link MoneyError} instance via the `code` property,
 * enabling exhaustive error handling without `instanceof` checks.
 *
 * @example
 * try {
 *   from(10, 'BR').divide(0)
 * } catch (err) {
 *   if (err instanceof MoneyError) {
 *     switch (err.code) {
 *       case 'DIVISION_BY_ZERO': // handle
 *     }
 *   }
 * }
 */
export type MoneyErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_PERCENTAGE'
  | 'DIVISION_BY_ZERO'
  | 'INVALID_ALLOCATION'
  | 'INVALID_RANGE'
  | 'CURRENCY_MISMATCH'
  | 'UNSUPPORTED_CURRENCY'
  | 'UNSAFE_INTEGER';

/**
 * Options accepted by {@link MoneyError} and its subclasses.
 * Extends the native `ErrorOptions` (which includes `cause`).
 */
export interface MoneyErrorOptions extends ErrorOptions {
  /** The original input value that triggered the error, preserved for debugging. */
  input?: unknown;
}

/**
 * Base class for all errors thrown by this library.
 *
 * Extends the native `Error` with two additional properties:
 * - `code` — a machine-readable {@link MoneyErrorCode} for programmatic handling.
 * - `input` — the offending value, when available, for easier debugging.
 *
 * Use `instanceof MoneyError` to catch any library error in a single branch,
 * or check `error.code` to distinguish between specific cases.
 *
 * @example
 * import { MoneyError } from '@eriveltondasilva/currency'
 *
 * try {
 *   from(10, 'BR').plus(from(10, 'US'))
 * } catch (err) {
 *   if (err instanceof MoneyError) {
 *     console.error(err.code, err.message)
 *   }
 * }
 */
export abstract class MoneyError extends Error {
  /** Machine-readable error code. Use for programmatic error handling. */
  readonly code: MoneyErrorCode;

  /** The input value that caused the error, if available. */
  readonly input?: unknown;

  constructor(message: string, code: MoneyErrorCode, options?: MoneyErrorOptions) {
    super(message, options);

    this.name = 'MoneyError';
    this.code = code;
    this.input = options?.input;
  }
}

// ─── Specific Errors ─────────────────────────────────────────────────────────

/**
 * Thrown when a value fails basic input validation — wrong type, non-finite
 * number, unsafe integer, or a value that cannot be parsed as a monetary amount.
 *
 * `code`: `'INVALID_INPUT'`
 */
export class InvalidInputError extends MoneyError {
  constructor(message: string, options?: MoneyErrorOptions) {
    super(message, 'INVALID_INPUT', options);

    this.name = 'InvalidInputError';
  }
}

/**
 * Thrown when a percentage or discount/surcharge value is invalid —
 * negative, non-finite, or out of the expected range.
 *
 * `code`: `'INVALID_PERCENTAGE'`
 */
export class InvalidPercentageError extends MoneyError {
  constructor(message: string, options?: MoneyErrorOptions) {
    super(message, 'INVALID_PERCENTAGE', options);

    this.name = 'InvalidPercentageError';
  }
}

/**
 * Thrown when a division or percentage operation is attempted with a
 * denominator of zero.
 *
 * `code`: `'DIVISION_BY_ZERO'`
 *
 * @example
 * from(10, 'US').divide(0) // throws DivisionByZeroError
 * percent(5, 0, 'US')      // throws DivisionByZeroError
 */
export class DivisionByZeroError extends MoneyError {
  constructor(options?: MoneyErrorOptions) {
    super('Cannot divide by zero.', 'DIVISION_BY_ZERO', options);

    this.name = 'DivisionByZeroError';
  }
}

/**
 * Thrown when arguments passed to {@link MoneyContract.allocate} or
 * {@link MoneyContract.allocateByRatio} are invalid — non-integer parts,
 * negative ratios, zero-sum ratios, or an empty ratio array.
 *
 * `code`: `'INVALID_ALLOCATION'`
 */
export class InvalidAllocationError extends MoneyError {
  constructor(message: string, options?: MoneyErrorOptions) {
    super(message, 'INVALID_ALLOCATION', options);

    this.name = 'InvalidAllocationError';
  }
}

/**
 * Thrown when a `min` value is greater than a `max` value in range-based
 * operations such as {@link MoneyContract.isBetween} or `clamp`.
 *
 * `code`: `'INVALID_RANGE'`
 *
 * @example
 * from(5, 'US').isBetween(10, 1) // throws InvalidRangeError
 */
export class InvalidRangeError extends MoneyError {
  constructor(options?: MoneyErrorOptions) {
    super('The minimum value cannot be greater than the maximum value.', 'INVALID_RANGE', options);

    this.name = 'InvalidRangeError';
  }
}

/**
 * Thrown when an operation is attempted between two `MoneyContract` instances
 * with different currency codes.
 *
 * `code`: `'CURRENCY_MISMATCH'`
 *
 * @example
 * from(10, 'BR').plus(from(10, 'US')) // throws CurrencyMismatchError
 */
export class CurrencyMismatchError extends MoneyError {
  constructor(baseCode: string, otherCode: string, options?: MoneyErrorOptions) {
    super(
      `Cannot operate on mismatched currencies: ${baseCode} and ${otherCode}.`,
      'CURRENCY_MISMATCH',
      options,
    );

    this.name = 'CurrencyMismatchError';
  }
}

/**
 * Thrown when an unsupported country code is passed to any API function.
 *
 * Supported codes:
 * `AU`, `BR`, `CA`, `CH`, `CN`, `DE`, `FR`,
 * `GB`, `IN`, `JP`, `MX`, `PT`, `SG`, `US`.
 *
 * `code`: `'UNSUPPORTED_CURRENCY'`
 *
 * @example
 * from(10, 'XX' as any) // throws UnsupportedCurrencyError
 */
export class UnsupportedCurrencyError extends MoneyError {
  constructor(country: string, supportedCodes: string, options?: MoneyErrorOptions) {
    super(
      `'${country}' is not a supported currency country. Supported codes: ${supportedCodes}.`,
      'UNSUPPORTED_CURRENCY',
      options,
    );

    this.name = 'UnsupportedCurrencyError';
  }
}

/**
 * Thrown when an arithmetic operation produces a result that exceeds
 * `Number.MAX_SAFE_INTEGER`, which would compromise integer precision
 * in minor-unit calculations.
 *
 * `code`: `'UNSAFE_INTEGER'`
 */
export class UnsafeIntegerError extends MoneyError {
  constructor(options?: MoneyErrorOptions) {
    super(
      'The resulting amount exceeds the safe integer limit for precision.',
      'UNSAFE_INTEGER',
      options,
    );

    this.name = 'UnsafeIntegerError';
  }
}
