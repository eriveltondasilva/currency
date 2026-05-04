export class MoneyError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });

    this.name = this.constructor.name;
  }
}

export class InvalidInputError extends MoneyError {}

export class InvalidPercentageError extends MoneyError {}

export class DivisionByZeroError extends MoneyError {
  constructor() {
    super('Cannot divide by zero.');
  }
}

export class InvalidAllocationError extends MoneyError {
  constructor() {
    super('Number of parts must be a positive integer.');
  }
}

export class InvalidRangeError extends MoneyError {
  constructor() {
    super('The minimum value cannot be greater than the maximum value.');
  }
}

export class CurrencyMismatchError extends MoneyError {
  constructor(baseCode: string, otherCode: string) {
    super(`Cannot operate on mismatched currencies: ${baseCode} and ${otherCode}.`);
  }
}
