export type MoneyErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_PERCENTAGE'
  | 'DIVISION_BY_ZERO'
  | 'INVALID_ALLOCATION'
  | 'INVALID_RANGE'
  | 'CURRENCY_MISMATCH'
  | 'UNSUPPORTED_CURRENCY';

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface MoneyErrorOptions extends ErrorOptions {
  input?: unknown;
}

export class MoneyError extends Error {
  readonly code: MoneyErrorCode;
  readonly input?: unknown;

  constructor(message: string, code: MoneyErrorCode, options?: MoneyErrorOptions) {
    super(message, options);

    this.name = 'MoneyError';
    this.code = code;
    this.input = options?.input;
  }
}

// ─── Subclasses ──────────────────────────────────────────────────────────────

export class InvalidInputError extends MoneyError {
  constructor(message: string, options?: MoneyErrorOptions) {
    super(message, 'INVALID_INPUT', options);

    this.name = 'InvalidInputError';
  }
}

export class InvalidPercentageError extends MoneyError {
  constructor(message: string, options?: MoneyErrorOptions) {
    super(message, 'INVALID_PERCENTAGE', options);

    this.name = 'InvalidPercentageError';
  }
}

export class DivisionByZeroError extends MoneyError {
  constructor(options?: MoneyErrorOptions) {
    super('Cannot divide by zero.', 'DIVISION_BY_ZERO', options);

    this.name = 'DivisionByZeroError';
  }
}

export class InvalidAllocationError extends MoneyError {
  constructor(options?: MoneyErrorOptions) {
    super('Number of parts must be a positive integer.', 'INVALID_ALLOCATION', options);

    this.name = 'InvalidAllocationError';
  }
}

export class InvalidRangeError extends MoneyError {
  constructor(options?: MoneyErrorOptions) {
    super('The minimum value cannot be greater than the maximum value.', 'INVALID_RANGE', options);

    this.name = 'InvalidRangeError';
  }
}

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
