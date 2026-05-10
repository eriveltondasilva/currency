import type { Currency, CurrencyCode } from './lib/currencies';
import type {
  FormatOptions,
  MoneyContract,
  MoneyInput,
  MoneyJSON,
  MoneyParts,
  RoundingMode,
} from './types';

import { numberToMinorUnit } from './lib/convert';
import {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  UnsafeIntegerError,
} from './lib/errors';
import { formatMoney } from './lib/format';
import { DEFAULT_ROUNDING_MODE, ROUND_FUNCTIONS } from './lib/rounding';

export function isMoney(value: unknown): value is MoneyContract {
  return value instanceof Money;
}

export class Money implements MoneyContract {
  readonly #currency: Currency;
  readonly #scaleFactor: number;
  readonly #minorUnits: number;

  constructor(input: number, currency: Currency) {
    this.#scaleFactor = 10 ** currency.fractionDigits;
    this.#currency = currency;
    this.#minorUnits = input;
  }

  // #region Static factories

  static fromMinorUnits(input: number, currency: Currency): MoneyContract {
    if (!Number.isFinite(input)) {
      throw new InvalidInputError('Expected a finite number of minor units.', {
        input,
      });
    }

    if (!Number.isInteger(input)) {
      throw new InvalidInputError('Minor units must be an integer.', {
        input,
      });
    }

    if (!Number.isSafeInteger(input)) {
      throw new UnsafeIntegerError({ input });
    }

    return new Money(input, currency);
  }

  static zero(currency: Currency): MoneyContract {
    return new Money(0, currency);
  }

  // #endregion

  // #region Private helpers

  #assertSameCurrency(input: MoneyContract): void {
    if (input.currencyCode() === this.#currency.code) return;

    throw new CurrencyMismatchError(this.#currency.code, input.currencyCode());
  }

  #resolve(input: MoneyInput): number {
    if (isMoney(input)) {
      this.#assertSameCurrency(input);
      return input.minorUnits();
    }

    return numberToMinorUnit(input, this.#currency.fractionDigits);
  }

  #make(input: number): MoneyContract {
    if (!Number.isFinite(input)) {
      throw new InvalidInputError('Operation produced a non-finite result.', { input: input });
    }

    if (!Number.isSafeInteger(input)) {
      throw new UnsafeIntegerError({ input });
    }

    return new Money(input, this.#currency);
  }

  #zero() {
    return Money.zero(this.#currency);
  }

  // #endregion

  // #region Accessors

  minorUnits(): number {
    return this.#minorUnits;
  }

  amount(): number {
    return this.#minorUnits / this.#scaleFactor;
  }

  units(): number {
    return Math.floor(Math.abs(this.#minorUnits) / this.#scaleFactor);
  }

  subunits(): number {
    return Math.abs(this.#minorUnits % this.#scaleFactor);
  }

  toParts(): MoneyParts {
    return [this.units(), this.subunits()];
  }

  currencyCode(): CurrencyCode {
    return this.#currency.code;
  }

  locale(): string {
    return this.#currency.locale;
  }

  // #endregion

  // #region State

  isZero(): boolean {
    return this.#minorUnits === 0;
  }

  isPositive(): boolean {
    return this.#minorUnits > 0;
  }

  isNegative(): boolean {
    return this.#minorUnits < 0;
  }

  // #endregion

  // #region Arithmetic

  plus(input: MoneyInput): MoneyContract {
    return this.#make(this.#minorUnits + this.#resolve(input));
  }

  minus(input: MoneyInput): MoneyContract {
    return this.#make(this.#minorUnits - this.#resolve(input));
  }

  times(factor: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(factor)) {
      throw new InvalidInputError('Factor must be a finite number.', {
        input: factor,
      });
    }

    if (factor === 0) return this.#zero();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#minorUnits * factor));
  }

  divide(divisor: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (divisor === 0) throw new DivisionByZeroError();

    if (!Number.isFinite(divisor)) {
      throw new InvalidInputError('Divisor must be a finite number.', {
        input: divisor,
      });
    }

    if (divisor === 1) return this.clone();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#minorUnits / divisor));
  }

  // #endregion

  // #region Transformation

  abs(): MoneyContract {
    return this.#make(Math.abs(this.#minorUnits));
  }

  negate(): MoneyContract {
    return this.#make(-this.#minorUnits);
  }

  max(input: MoneyInput): MoneyContract {
    const other = this.#resolve(input);
    return this.#minorUnits >= other ? this.clone() : this.#make(other);
  }

  min(input: MoneyInput): MoneyContract {
    const other = this.#resolve(input);
    return this.#minorUnits <= other ? this.clone() : this.#make(other);
  }

  round(increment: number, mode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    const hasInvalidIncrement = !Number.isInteger(increment) || increment < 1;
    if (hasInvalidIncrement) {
      throw new InvalidInputError('Step must be a positive integer.', {
        input: increment,
      });
    }

    if (increment === 1 || this.isZero()) return this.clone();

    return this.#make(ROUND_FUNCTIONS[mode](this.#minorUnits / increment) * increment);
  }

  // #endregion

  // #region Comparison

  equals(input: MoneyInput): boolean {
    const hasDifferentCurrency = isMoney(input) && input.currencyCode() !== this.#currency.code;
    if (hasDifferentCurrency) return false;

    return this.#minorUnits === this.#resolve(input);
  }

  greaterThan(input: MoneyInput): boolean {
    return this.#minorUnits > this.#resolve(input);
  }

  lessThan(input: MoneyInput): boolean {
    return this.#minorUnits < this.#resolve(input);
  }

  greaterThanOrEqual(input: MoneyInput): boolean {
    return this.#minorUnits >= this.#resolve(input);
  }

  lessThanOrEqual(input: MoneyInput): boolean {
    return this.#minorUnits <= this.#resolve(input);
  }

  isBetween(min: MoneyInput, max: MoneyInput): boolean {
    const minAmount = this.#resolve(min);
    const maxAmount = this.#resolve(max);

    if (minAmount > maxAmount) throw new InvalidRangeError();

    return this.#minorUnits >= minAmount && this.#minorUnits <= maxAmount;
  }

  hasSameCurrency(input: MoneyContract): boolean {
    return this.#currency.code === input.currencyCode();
  }

  // #endregion

  // #region Business

  percentOf(percent: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(percent)) {
      throw new InvalidPercentageError('Percentage must be a finite number.', { input: percent });
    }

    if (percent < 0) {
      throw new InvalidPercentageError('Percentage must be non-negative.', { input: percent });
    }

    if (percent === 0) return this.#zero();

    if (percent === 100) return this.clone();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#minorUnits * (percent / 100)));
  }

  applyDiscount(
    discount: number,
    roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE,
  ): MoneyContract {
    if (!Number.isFinite(discount)) {
      throw new InvalidPercentageError('Discount must be a finite number.', { input: discount });
    }

    if (discount < 0) {
      throw new InvalidPercentageError('Discount cannot be negative.', { input: discount });
    }

    if (discount > 100) {
      throw new InvalidPercentageError('Discount cannot exceed 100%.', { input: discount });
    }

    if (discount === 0) return this.clone();

    if (discount === 100) return this.#zero();

    return this.minus(this.percentOf(discount, roundingMode));
  }

  applySurcharge(
    surcharge: number,
    roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE,
  ): MoneyContract {
    if (!Number.isFinite(surcharge)) {
      throw new InvalidPercentageError('Surcharge must be a finite number.', { input: surcharge });
    }

    if (surcharge < 0)
      throw new InvalidPercentageError('Surcharge must be non-negative.', { input: surcharge });

    if (surcharge === 0) return this.clone();

    return this.plus(this.percentOf(surcharge, roundingMode));
  }

  allocate(parts: number): MoneyContract[] {
    const hasInvalidParts = !Number.isInteger(parts) || parts < 1;
    if (hasInvalidParts) {
      throw new InvalidAllocationError('Number of parts must be a positive integer.');
    }

    if (parts === 1) return [this.clone()];

    if (this.isZero()) return Array.from({ length: parts }, () => this.#zero());

    const isNegative = this.isNegative();
    const absoluteAmount = Math.abs(this.#minorUnits);
    const base = Math.floor(absoluteAmount / parts);
    const remainder = absoluteAmount % parts;

    return Array.from({ length: parts }, (_, i) => {
      const value = base + (i < remainder ? 1 : 0);
      return this.#make(isNegative ? -value : value);
    });
  }

  allocateByRatio(ratios: number[]): MoneyContract[] {
    const hasInvalidRatios =
      ratios.length === 0 || ratios.some((ratio) => !Number.isFinite(ratio) || ratio < 0);
    if (hasInvalidRatios) {
      throw new InvalidAllocationError(
        'Ratios must be a non-empty array of non-negative finite numbers.',
      );
    }

    const hasNonIntegerRatios = ratios.some((ratio) => !Number.isInteger(ratio));
    if (hasNonIntegerRatios) {
      throw new InvalidAllocationError(
        'Ratios must be integers. Use whole numbers like [1, 2, 3] or [30, 70].',
      );
    }

    const total = ratios.reduce((acc, ratio) => acc + ratio, 0);

    if (!Number.isSafeInteger(total)) {
      throw new InvalidAllocationError('The sum of ratios exceeds the safe integer range.');
    }

    if (total === 0) {
      throw new InvalidAllocationError('The sum of ratios cannot be zero.');
    }

    if (this.isZero()) return ratios.map(() => this.#zero());

    const isNegative = this.isNegative();
    const absoluteAmount = Math.abs(this.#minorUnits);

    const shares = ratios.map((ratio) => {
      const intermediate = absoluteAmount * ratio;

      if (!Number.isSafeInteger(intermediate)) {
        throw new UnsafeIntegerError({ input: intermediate });
      }

      return Math.floor(intermediate / total);
    });

    const distributed = shares.reduce((acc, share) => acc + share, 0);
    const remainder = absoluteAmount - distributed;

    return shares.map((share, i) => {
      const value = share + (i < remainder ? 1 : 0);
      return this.#make(isNegative ? -value : value);
    });
  }

  // #endregion

  // #region Display

  format(options?: FormatOptions): string {
    return formatMoney(this.amount(), this.#currency, options);
  }

  clone(): MoneyContract {
    return new Money(this.#minorUnits, this.#currency);
  }

  toString(): string {
    return this.amount().toFixed(this.#currency.fractionDigits);
  }

  toJSON(): MoneyJSON {
    return { minorUnits: this.#minorUnits, currencyCode: this.#currency.code };
  }

  // #endregion
}
