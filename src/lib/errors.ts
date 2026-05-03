/**
 * Base error for all errors thrown by this library.
 * Use `instanceof MoneyError` to catch any library error.
 */
export class MoneyError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'MoneyError';
  }
}

/**
 * Thrown when a value cannot be converted to a monetary amount.
 *
 * @example
 * toCents(null)       // → InvalidInputError
 * toCents('abc')      // → InvalidInputError
 * toCents(NaN)        // → InvalidInputError
 * toCents(Infinity)   // → InvalidInputError
 */
export class InvalidInputError extends MoneyError {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'InvalidInputError';
  }
}

/**
 * Thrown when a division by zero is attempted.
 *
 * @example
 * money(100).dividedBy(0)  // → DivisionByZeroError
 * divide(100, 0)            // → DivisionByZeroError
 */
export class DivisionByZeroError extends MoneyError {
  constructor() {
    super('Cannot divide by zero.');
    this.name = 'DivisionByZeroError';
  }
}

/**
 * Thrown when a percentage value is out of the valid range.
 *
 * @example
 * money(100).applyDiscount(0)    // → InvalidPercentageError
 * money(100).applyDiscount(110)  // → InvalidPercentageError
 */
export class InvalidPercentageError extends MoneyError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPercentageError';
  }
}

/**
 * Thrown when an allocation is requested with an invalid number of parts.
 *
 * @example
 * money(100).allocate(0)   // → InvalidAllocationError
 * money(100).allocate(-1)  // → InvalidAllocationError
 * money(100).allocate(1.5) // → InvalidAllocationError
 */
export class InvalidAllocationError extends MoneyError {
  constructor() {
    super('Number of parts must be a positive integer.');
    this.name = 'InvalidAllocationError';
  }
}

/**
 * Thrown when `isBetween` receives a min value greater than max.
 *
 * @example
 * money(50).isBetween(100, 10) // → InvalidRangeError
 */
export class InvalidRangeError extends MoneyError {
  constructor() {
    super('The minimum value cannot be greater than the maximum value.');
    this.name = 'InvalidRangeError';
  }
}
