import type { FormatOptions, MoneyInput, RoundingMode } from '@/types';

/**
 * Public contract for any monetary value object in this library.
 *
 * All methods that return a monetary value are covariant — implementations
 * must return an object that also satisfies `MoneyContract`, enabling fluent chaining
 * without depending on the concrete `Money` class.
 *
 * Use this interface:
 * - As the parameter type when a function accepts any monetary value.
 * - As the return type when a function produces a monetary value abstraction.
 * - To create test doubles (mocks/stubs) without instantiating `Money`.
 *
 * @example
 * function applyTax(amount: MoneyContract, rate: number): MoneyContract {
 *   return amount.applySurcharge(rate);
 * }
 */
export interface MoneyContract {
  // ─── Accessors ────────────────────────────────────────────────────────

  /** Returns the raw integer cent value (e.g. 1099 for $10.99). */
  cents(): number;

  /** Returns the monetary value as a decimal number (e.g. 10.99). */
  value(): number;

  /**
   * Returns the integer part of the absolute monetary value.
   * @example money(10.99).integer() // -> 10
   */
  integer(): number;

  /**
   * Returns the fractional part of the absolute monetary value as a decimal.
   * @example money(10.99).decimal() // -> 0.99
   */
  fraction(): number;

  units(): [number, number];

  // ─── State ────────────────────────────────────────────────────────────

  /** Returns true if the value is exactly zero. */
  isZero(): boolean;

  /** Returns true if the value is greater than zero. */
  isPositive(): boolean;

  /** Returns true if the value is less than zero. */
  isNegative(): boolean;

  // ─── Arithmetic ───────────────────────────────────────────────────────

  /** Returns a new MoneyContract equal to this + value. */
  plus(value: MoneyInput): MoneyContract;

  /** Returns a new MoneyContract equal to this - value. */
  minus(value: MoneyInput): MoneyContract;

  /**
   * Returns a new MoneyContract equal to this * factor.
   * Negative factors are allowed (they flip the sign).
   *
   * @throws {InvalidInputError} if factor is not finite.
   */
  times(factor: number): MoneyContract;

  /**
   * Returns a new MoneyContract equal to this / divisor.
   * Negative divisors are allowed (they flip the sign).
   *
   * @throws {DivisionByZeroError} if divisor is 0.
   * @throws {InvalidInputError}   if divisor is not finite.
   */
  dividedBy(divisor: number): MoneyContract;

  // ─── Transformation ───────────────────────────────────────────────────

  /** Returns the absolute value of this MoneyContract (always >= 0). */
  absolute(): MoneyContract;

  /** Returns the negated value. Zero is returned unchanged. */
  negate(): MoneyContract;

  /**
   * Returns the larger of this and value.
   * @example money(10).max(20) // -> MoneyContract(20)
   */
  max(value: MoneyInput): MoneyContract;

  /**
   * Returns the smaller of this and value.
   * @example money(10).min(5) // -> MoneyContract(5)
   */
  min(value: MoneyInput): MoneyContract;

  /**
   * Rounds to the nearest multiple of precision cents.
   *
   * @param precision - Rounding unit in cents (positive integer >= 1).
   * @param mode      - 'round' | 'floor' | 'ceil' | 'trunc'. Defaults to 'round'.
   *
   * @example
   * money(1.23).round(5)           // -> MoneyContract(1.25)  — nearest 5 cents
   * money(1.23).round(5, 'floor')  // -> MoneyContract(1.20)
   */
  round(precision: number, mode?: RoundingMode): MoneyContract;

  // ─── Comparison ───────────────────────────────────────────────────────

  /** Returns true if this value equals the given value. */
  equals(value: MoneyInput): boolean;

  /** Returns true if this value is strictly greater than the given value. */
  greaterThan(value: MoneyInput): boolean;

  /** Returns true if this value is strictly less than the given value. */
  lessThan(value: MoneyInput): boolean;

  /** Returns true if this value is greater than or equal to the given value. */
  greaterThanOrEqual(value: MoneyInput): boolean;

  /** Returns true if this value is less than or equal to the given value. */
  lessThanOrEqual(value: MoneyInput): boolean;

  /**
   * Returns true if this value is within [min, max] (inclusive).
   * @throws {InvalidRangeError} if min is greater than max.
   */
  isBetween(min: MoneyInput, max: MoneyInput): boolean;

  // ─── Business ─────────────────────────────────────────────────────────

  /**
   * Computes percent% of this value.
   *
   * @throws {InvalidPercentageError} if percent <= 0.
   * @example money(200).percentage(10) // -> MoneyContract(20)
   */
  percentage(percent: number): MoneyContract;

  /**
   * Returns this value minus a percentage discount.
   *
   * @throws {InvalidPercentageError} if discount is not in (0, 100].
   * @example money(200).applyDiscount(10) // -> MoneyContract(180)
   */
  applyDiscount(discount: number): MoneyContract;

  /**
   * Returns this value plus a percentage surcharge.
   *
   * @throws {InvalidPercentageError} if surcharge <= 0.
   * @example money(200).applySurcharge(10) // -> MoneyContract(220)
   */
  applySurcharge(surcharge: number): MoneyContract;

  /**
   * Splits this value into `parts` MoneyContract instances as evenly as possible.
   * Remainder cents are distributed to the first installments so the sum
   * always equals the original amount exactly.
   *
   * @throws {InvalidAllocationError} if parts is not a positive integer.
   *
   * @example
   * money(10).allocate(3)
   * // -> [MoneyContract(3.34), MoneyContract(3.33), MoneyContract(3.33)]
   */
  allocate(parts: number): MoneyContract[];

  // ─── Display / conversion ─────────────────────────────────────────────

  /**
   * Formats this value as a localized currency string.
   * Options passed here are merged over the instance-level options.
   *
   * @example
   * money(10.5, { currencyCode: 'BRL' }).format()                   // -> 'R$ 10,50'
   * money(10.5).format({ currencyCode: 'EUR' })                     // -> '€10.50'
   * money(10.5).format({ currencyCode: 'USD', showSymbol: false })  // -> '10.50'
   */
  format(options?: FormatOptions): string;

  /** Returns a shallow copy of this instance. */
  clone(): MoneyContract;

  /**
   * Returns the display value as a fixed-decimal string.
   * @example money(10.5).toString() // -> '10.50'
   */
  toString(): string;

  /**
   * Returns the numeric display value.
   * Prefer explicit .value() calls for clarity in most situations.
   */
  valueOf(): number;
}
