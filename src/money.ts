import type { DisplayOptions, FormatOptions, MoneyInput, RoundingMode } from './types';
import type { MoneyContract } from './types/money';

import { CENT_FACTOR, DEFAULT_FORMAT_OPTIONS, ROUNDING_MODES, TAG } from './constants';
import {
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  MoneyError,
} from './errors';
import { toMinorUnit } from './lib/convert';
import { formatMoney } from './lib/format';

const SKIP_CONVERT = Symbol('money.internal');

export class Money implements MoneyContract {
  /** @internal */
  readonly _tag = TAG;

  readonly #cents: number = 0;
  readonly #options: FormatOptions;

  // ─── Constructor ───────────────────────────────────────────────────────────

  constructor(value?: MoneyInput, options?: Partial<FormatOptions>);

  /** @internal */
  constructor(sentinel: typeof SKIP_CONVERT, options: Partial<FormatOptions>, rawCents: number);

  constructor(
    input: MoneyInput | typeof SKIP_CONVERT = 0,
    options: Partial<FormatOptions>,
    rawCents: number = 0,
  ) {
    if (input === SKIP_CONVERT) {
      this.#options = { ...DEFAULT_FORMAT_OPTIONS, ...options };
      this.#cents = rawCents;
      return;
    }

    this.#options = { ...DEFAULT_FORMAT_OPTIONS, ...options };
    this.#cents = toMinorUnit(input, this.#options.locale);
  }

  // ─── Static factories ─────────────────────────────────────────────────

  /**
   * Creates a Money instance directly from an integer cent value.
   *
   * @throws {InvalidInputError} if cents is not a finite number.
   *
   * @example
   * Money.fromCents(1050)                        // -> Money representing $10.50
   * Money.fromCents(1050, { currencyCode: 'BRL' })
   */
  static fromCents(cents: number, options: Partial<FormatOptions>): MoneyContract {
    if (!Number.isFinite(cents)) {
      throw new InvalidInputError(`Expected a finite number of cents, got ${cents}.`);
    }

    return new Money(SKIP_CONVERT, options, Math.round(cents));
  }

  /**
   * Creates a Money instance representing zero.
   *
   * @example
   * Money.zero()                          // -> Money(0)
   * Money.zero({ currencyCode: 'BRL' })   // -> Money(0, BRL)
   */
  static zero(options: Partial<FormatOptions>): MoneyContract {
    return new Money(SKIP_CONVERT, options, 0);
  }

  // ─── Accessors ────────────────────────────────────────────────────────

  /** Returns the raw integer cent value (e.g. 1099 for $10.99). */
  cents(): number {
    return this.#cents;
  }

  /** Returns the monetary value as a decimal number (e.g. 10.99). */
  value(): number {
    return this.#cents / CENT_FACTOR;
  }

  /**
   * Returns the integer part of the absolute monetary value.
   * @example money(10.99).integer() // -> 10
   */
  integer(): number {
    return Math.floor(Math.abs(this.#cents) / CENT_FACTOR);
  }

  /**
   * Returns the fractional part of the absolute monetary value as a decimal.
   * @example money(10.99).decimal() // -> 0.99
   */
  fraction(): number {
    return this.integer() === 0 ? 0 : this.value() - this.integer();
  }

  units(): [number, number] {
    return [this.integer(), this.fraction()];
  }

  // ─── State ────────────────────────────────────────────────────────────

  isZero(): boolean {
    return this.#cents === 0;
  }
  isPositive(): boolean {
    return this.#cents > 0;
  }
  isNegative(): boolean {
    return this.#cents < 0;
  }

  // ─── Arithmetic ───────────────────────────────────────────────────────

  /** Returns a new Money equal to this + value. */
  plus(value: MoneyInput): MoneyContract {
    const addend = toMinorUnit(value, this.#options.locale);
    return addend === 0 ? this.#clone() : this.#make(this.#cents + addend);
  }

  /** Returns a new Money equal to this - value. */
  minus(value: MoneyInput): MoneyContract {
    const subtrahend = toMinorUnit(value, this.#options.locale);
    return subtrahend === 0 ? this.#clone() : this.#make(this.#cents - subtrahend);
  }

  /**
   * Returns a new Money equal to this * factor.
   * Negative factors are allowed (they flip the sign).
   *
   * @throws {InvalidInputError} if factor is not finite.
   */
  times(factor: number): MoneyContract {
    if (!Number.isFinite(factor)) {
      throw new InvalidInputError(`Factor must be a finite number, got ${factor}.`);
    }

    if (factor === 0) return Money.zero(this.#options);

    if (factor === 1) return this.#clone();

    return this.#make(this.#cents * factor);
  }

  /**
   * Returns a new Money equal to this / divisor.
   * Negative divisors are allowed (they flip the sign).
   *
   * @throws {DivisionByZeroError} if divisor is 0.
   * @throws {InvalidInputError}   if divisor is not finite.
   */
  dividedBy(divisor: number): MoneyContract {
    if (divisor === 0) throw new DivisionByZeroError();

    if (!Number.isFinite(divisor)) {
      throw new InvalidInputError(`Divisor must be a finite number, got ${divisor}.`);
    }

    if (divisor === 1) return this.#clone();

    return this.#make(this.#cents / divisor);
  }

  // ─── Transformation ───────────────────────────────────────────────────

  /** Returns the absolute value of this Money (always >= 0). */
  absolute(): MoneyContract {
    if (this.isPositive() || this.isZero()) return this.#clone();

    return this.#make(Math.abs(this.#cents));
  }

  /** Returns the negated value. Zero is returned unchanged. */
  negate(): MoneyContract {
    return this.isZero() ? this.#clone() : this.#make(-this.#cents);
  }

  /**
   * Returns the larger of this and value.
   * @example money(10).max(20) // -> Money(20)
   */
  max(value: MoneyInput): MoneyContract {
    const other = toMinorUnit(value, this.#options.locale);
    return this.#cents >= other ? this.#clone() : this.#make(other);
  }

  /**
   * Returns the smaller of this and value.
   * @example money(10).min(5) // -> Money(5)
   */
  min(value: MoneyInput): MoneyContract {
    const other = toMinorUnit(value, this.#options.locale);
    return this.#cents <= other ? this.#clone() : this.#make(other);
  }

  /**
   * Rounds to the nearest multiple of precision cents.
   *
   * @param precision - Rounding unit in cents (positive integer >= 1).
   * @param mode      - 'round' | 'floor' | 'ceil' | 'trunc'. Defaults to 'round'.
   *
   * @example
   * money(1.23).round(5)           // -> Money(1.25)  — nearest 5 cents
   * money(1.23).round(5, 'floor')  // -> Money(1.20)
   */
  round(precision: number, mode: RoundingMode = ROUNDING_MODES.ROUND): MoneyContract {
    if (!Number.isInteger(precision) || precision < 1) {
      throw new MoneyError(`Precision must be a positive integer, got ${precision}.`, precision);
    }

    if (precision === 1 || this.isZero()) return this.#clone();

    const roundFns: Record<RoundingMode, (v: number) => number> = {
      [ROUNDING_MODES.ROUND]: Math.round,
      [ROUNDING_MODES.FLOOR]: Math.floor,
      [ROUNDING_MODES.CEIL]: Math.ceil,
      [ROUNDING_MODES.TRUNC]: Math.trunc,
    };

    const abs = Math.abs(this.#cents);
    const result = roundFns[mode](abs / precision) * precision;
    const finalCents = this.#cents < 0 ? -result : result;

    return finalCents === this.#cents ? this.#clone() : this.#make(finalCents);
  }

  // ─── Comparison ───────────────────────────────────────────────────────

  equals(value: MoneyInput): boolean {
    return this.#cents === toMinorUnit(value, this.#options.locale);
  }
  greaterThan(value: MoneyInput): boolean {
    return this.#cents > toMinorUnit(value, this.#options.locale);
  }
  lessThan(value: MoneyInput): boolean {
    return this.#cents < toMinorUnit(value, this.#options.locale);
  }
  greaterThanOrEqual(value: MoneyInput): boolean {
    return this.#cents >= toMinorUnit(value, this.#options.locale);
  }
  lessThanOrEqual(value: MoneyInput): boolean {
    return this.#cents <= toMinorUnit(value, this.#options.locale);
  }

  /**
   * Returns true if this value is within [min, max] (inclusive).
   * @throws {InvalidRangeError} if min is greater than max.
   */
  isBetween(min: MoneyInput, max: MoneyInput): boolean {
    const minCents = toMinorUnit(min, this.#options.locale);
    const maxCents = toMinorUnit(max, this.#options.locale);
    if (minCents > maxCents) throw new InvalidRangeError();
    return this.#cents >= minCents && this.#cents <= maxCents;
  }

  // ─── Business ─────────────────────────────────────────────────────────

  /**
   * Computes percent% of this value.
   *
   * @throws {InvalidPercentageError} if percent <= 0.
   * @example money(200).percentage(10) // -> Money(20)
   */
  percentage(percent: number): MoneyContract {
    if (percent <= 0) {
      throw new InvalidPercentageError('Percentage must be greater than zero.');
    }
    if (percent === 100) return this.#clone();
    return this.times(percent / 100);
  }

  /**
   * Returns this value minus a percentage discount.
   *
   * @throws {InvalidPercentageError} if discount is not in (0, 100].
   * @example money(200).applyDiscount(10) // -> Money(180)
   */
  applyDiscount(discount: number): MoneyContract {
    if (discount <= 0) {
      throw new InvalidPercentageError('Discount must be greater than zero.');
    }

    if (discount > 100) {
      throw new InvalidPercentageError('Discount cannot exceed 100%.');
    }

    if (discount === 100) return Money.zero(this.#options);

    return this.minus(this.percentage(discount));
  }

  /**
   * Returns this value plus a percentage surcharge.
   *
   * @throws {InvalidPercentageError} if surcharge <= 0.
   * @example money(200).applySurcharge(10) // -> Money(220)
   */
  applySurcharge(surcharge: number): MoneyContract {
    if (surcharge <= 0) {
      throw new InvalidPercentageError('Surcharge must be greater than zero.');
    }

    return this.plus(this.percentage(surcharge));
  }

  /**
   * Splits this value into parts Money instances as evenly as possible.
   * Remainder cents are distributed to the first installments so the sum
   * always equals the original amount exactly.
   *
   * @throws {InvalidAllocationError} if parts is not a positive integer.
   *
   * @example
   * money(10).allocate(3)
   * // -> [Money(3.34), Money(3.33), Money(3.33)]
   */
  allocate(parts: number): MoneyContract[] {
    if (!Number.isInteger(parts) || parts <= 0) {
      throw new InvalidAllocationError();
    }

    if (this.isZero()) {
      return Array.from({ length: parts }, () => Money.zero(this.#options));
    }

    const isNegative = this.#cents < 0;
    const absoluteCents = Math.abs(this.#cents);

    const base = Math.floor(absoluteCents / parts);
    const remainder = absoluteCents % parts;

    return Array.from({ length: parts }, (_, i) => {
      const value = base + (i < remainder ? 1 : 0);
      return this.#make(isNegative ? -value : value);
    });
  }

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
  format(options: Partial<DisplayOptions> = {}): string {
    return formatMoney(this, { ...this.#options, ...options });
  }

  /** Returns a shallow copy of this instance. */
  clone(): MoneyContract {
    return this.#clone();
  }

  /**
   * Returns the display value as a fixed-decimal string.
   * @example money(10.5).toString() // -> '10.50'
   */
  toString(): string {
    return this.value().toFixed(2);
  }

  /**
   * Returns the numeric display value.
   * Prefer explicit .value() calls for clarity in most situations.
   */
  valueOf(): number {
    return this.value();
  }

  // ─── Private helpers ──────────────────────────────────────────────────

  #make(cents: number): MoneyContract {
    return new Money(SKIP_CONVERT, this.#options, Math.round(cents));
  }

  #clone(): MoneyContract {
    return new Money(SKIP_CONVERT, this.#options, this.#cents);
  }
}
