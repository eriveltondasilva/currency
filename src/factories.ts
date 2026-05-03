import type { FormatOptions, Maybe, MoneyInput, PricedItem } from './types';
import type { MoneyContract } from './types/money';

import { toMinorUnit } from './lib/convert';
import { Money } from './money';
import { isEmpty, isMoney as isMoneyGuard, isNil } from './utils';

// ─── Type guard ───────────────────────────────────────────────────────────────

/**
 * Returns true if `value` is a Money instance created by this library.
 * Safe to use across module boundaries.
 *
 * @example
 * isMoney(money(10))    // -> true
 * isMoney(10)           // -> false
 * isMoney(null)         // -> false
 */
function isMoney(value: unknown): value is MoneyContract {
  return isMoneyGuard(value);
}

// ─── Creation ─────────────────────────────────────────────────────────

/**
 * Creates a Money instance. Shorthand for `new Money(value, options)`.
 *
 * @example
 * money(10.99)
 * money('R$ 1.234,56', { currencyCode: 'BRL' })
 */
function from(value: MoneyInput = 0, options: Partial<FormatOptions> = {}): MoneyContract {
  return new Money(value, options);
}

/**
 * Creates a Money instance from an integer cent value.
 * Alias for `Money.fromCents`.
 *
 * @example
 * fromCents(1099)  // -> Money representing $10.99
 */
function fromCents(cents: number, options: Partial<FormatOptions> = {}): MoneyContract {
  return Money.fromCents(cents, options);
}

/**
 * Creates a Money instance representing zero.
 * Alias for `Money.zero`.
 *
 * @example
 * zero()                          // -> Money(0)
 * zero({ currencyCode: 'BRL' })  // -> Money(0, BRL)
 */
function zero(options: Partial<FormatOptions>): MoneyContract {
  return Money.zero(options);
}

// ─── Arithmetic ───────────────────────────────────────────────────────────────

/**
 * Returns the sum of two monetary values as a new Money instance.
 *
 * @example
 * add(10, 5)          // -> Money(15)
 * add('R$10,00', 5)   // -> Money(15)
 */
function add(a: MoneyInput, b: MoneyInput, options: FormatOptions = {}): MoneyContract {
  return Money.fromCents(toMinorUnit(a) + toMinorUnit(b), options);
}

/**
 * Returns the difference of two monetary values as a new Money instance.
 *
 * @example
 * subtract(10, 3)  // -> Money(7)
 */
function subtract(a: MoneyInput, b: MoneyInput, options: FormatOptions = {}): MoneyContract {
  return Money.fromCents(toMinorUnit(a) - toMinorUnit(b), options);
}

/**
 * Returns a monetary value multiplied by a numeric factor.
 *
 * @example
 * multiply(10, 3)   // -> Money(30)
 * multiply(10, 0.5) // -> Money(5)
 */
function multiply(value: MoneyInput, factor: number, options: FormatOptions = {}): MoneyContract {
  return from(value, options).times(factor);
}

/**
 * Returns a monetary value divided by a numeric divisor.
 *
 * @throws {DivisionByZeroError} if divisor is 0.
 *
 * @example
 * divide(30, 3)  // -> Money(10)
 */
function divide(value: MoneyInput, divisor: number, options: FormatOptions = {}): MoneyContract {
  return from(value, options).dividedBy(divisor);
}

/**
 * Computes percent% of a monetary value.
 *
 * @throws {InvalidPercentageError} if percent <= 0.
 *
 * @example
 * percentage(200, 10)  // -> Money(20)
 */
function percentage(
  value: MoneyInput,
  percent: number,
  options: FormatOptions = {},
): MoneyContract {
  return from(value, options).percentage(percent);
}

// ─── Business utilities ───────────────────────────────────────────────────────

/**
 * Computes the total price of a list of priced items (price * quantity each).
 * Items with null/undefined prices are silently skipped.
 *
 * @example
 * calculateTotal([
 *   { price: 10, quantity: 2 },
 *   { price: 5  },
 * ])
 * // -> Money(25)
 */
function calculateTotal(
  items: PricedItem[] | null | undefined,
  options: FormatOptions = {},
): MoneyContract {
  if (isNil(items) || isEmpty(items)) return Money.zero(options);

  const totalCents = items.reduce((sum, { price, quantity = 1 }) => {
    if (isNil(price)) return sum;
    return sum + toMinorUnit(price) * quantity;
  }, 0);

  return Money.fromCents(totalCents, options);
}

/**
 * Computes the subtotal of a single priced item (price * quantity).
 *
 * @example
 * calculateSubtotal({ price: 10, quantity: 3 })  // -> Money(30)
 * calculateSubtotal({ price: 10 })               // -> Money(10)
 */
function calculateSubtotal(item: PricedItem, options: FormatOptions = {}): MoneyContract {
  const { price, quantity = 1 } = item;
  if (isNil(price)) return Money.zero(options);
  return Money.fromCents(toMinorUnit(price) * quantity, options);
}

/**
 * Computes the arithmetic mean of a list of monetary values.
 * Null/undefined values are skipped. Returns zero for empty lists.
 *
 * @example
 * calculateAverage([10, 20, 30])  // -> Money(20)
 */
function calculateAverage(values: Maybe<MoneyInput>[], options: FormatOptions = {}): MoneyContract {
  if (isEmpty(values)) return Money.zero(options);

  const validValues = values.filter((value): value is MoneyInput => !isNil(value));

  if (isEmpty(validValues)) return Money.zero(options);

  const totalCents = validValues.reduce<number>((sum, value) => sum + toMinorUnit(value), 0);
  return Money.fromCents(totalCents / validValues.length, options);
}

/**
 * Splits a monetary value into `parts` installments as evenly as possible.
 * Remainder cents are distributed to the first installments so the sum
 * always equals the original amount exactly.
 *
 * Alias for `money(value).allocate(parts)` with standalone function ergonomics.
 *
 * @throws {InvalidAllocationError} if parts is not a positive integer.
 *
 * @example
 * distributeInstallments(10, 3)
 * // -> [Money(3.34), Money(3.33), Money(3.33)]
 */
function distributeInstallments(
  value: MoneyInput,
  parts: number,
  options: FormatOptions = {},
): MoneyContract[] {
  return from(value, options).allocate(parts);
}

// biome-ignore format: off
export const factories = {
  // Type guard
  isMoney,
  // Creation
  from,
  fromCents,
  zero,
  // Arithmetic
  add,
  subtract,
  multiply,
  divide,
  percentage,
  // Business utilities
  calculateTotal,
  calculateSubtotal,
  calculateAverage,
  distributeInstallments,
};
