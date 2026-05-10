import type { Currency, CurrencyCode } from './lib/currencies';
import type {
  FormatOptions,
  MoneyContract,
  MoneyInput,
  MoneyJSON,
  MoneyUnits,
  RoundingMode,
} from './types';

import { TAG } from './lib/constants';
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
import { isMoney } from './lib/utils';

export class Money implements MoneyContract {
  /** @internal */
  readonly _tag = TAG;

  readonly #amount: number;
  readonly #currency: Currency;
  readonly #minorUnit: number;

  constructor(amount: number, currency: Currency) {
    this.#minorUnit = 10 ** currency.fractionDigits;
    this.#currency = currency;
    this.#amount = amount;
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
      return input.amount();
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

  amount(): number {
    return this.#amount;
  }

  value(): number {
    return this.#amount / this.#minorUnit;
  }

  integer(): number {
    return Math.floor(Math.abs(this.#amount) / this.#minorUnit);
  }

  cents(): number {
    return Math.abs(this.#amount % this.#minorUnit);
  }

  units(): MoneyUnits {
    return [this.integer(), this.cents()];
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
    return this.#amount === 0;
  }

  isPositive(): boolean {
    return this.#amount > 0;
  }

  isNegative(): boolean {
    return this.#amount < 0;
  }

  // #endregion

  // #region Arithmetic

  plus(input: MoneyInput): MoneyContract {
    return this.#make(this.#amount + this.#resolve(input));
  }

  minus(input: MoneyInput): MoneyContract {
    return this.#make(this.#amount - this.#resolve(input));
  }

  times(factor: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(factor)) {
      throw new InvalidInputError('Factor must be a finite number.', {
        input: factor,
      });
    }

    if (factor === 0) return this.#zero();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#amount * factor));
  }

  dividedBy(divisor: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (divisor === 0) throw new DivisionByZeroError();

    if (!Number.isFinite(divisor)) {
      throw new InvalidInputError('Divisor must be a finite number.', {
        input: divisor,
      });
    }

    if (divisor === 1) return this.clone();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#amount / divisor));
  }

  // #endregion

  // #region Transformation

  absolute(): MoneyContract {
    return this.#make(Math.abs(this.#amount));
  }

  negate(): MoneyContract {
    return this.#make(-this.#amount);
  }

  max(input: MoneyInput): MoneyContract {
    const other = this.#resolve(input);
    return this.#amount >= other ? this.clone() : this.#make(other);
  }

  min(input: MoneyInput): MoneyContract {
    const other = this.#resolve(input);
    return this.#amount <= other ? this.clone() : this.#make(other);
  }

  round(increment: number, mode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isInteger(increment) || increment < 1) {
      throw new InvalidInputError('Step must be a positive integer.', {
        input: increment,
      });
    }

    if (increment === 1 || this.isZero()) return this.clone();

    return this.#make(ROUND_FUNCTIONS[mode](this.#amount / increment) * increment);
  }

  // #endregion

  // #region Comparison

  equals(input: MoneyInput): boolean {
    return this.#amount === this.#resolve(input);
  }

  greaterThan(input: MoneyInput): boolean {
    return this.#amount > this.#resolve(input);
  }

  lessThan(input: MoneyInput): boolean {
    return this.#amount < this.#resolve(input);
  }

  greaterThanOrEqual(input: MoneyInput): boolean {
    return this.#amount >= this.#resolve(input);
  }

  lessThanOrEqual(input: MoneyInput): boolean {
    return this.#amount <= this.#resolve(input);
  }

  isBetween(min: MoneyInput, max: MoneyInput): boolean {
    const minAmount = this.#resolve(min);
    const maxAmount = this.#resolve(max);

    if (minAmount > maxAmount) throw new InvalidRangeError();

    return this.#amount >= minAmount && this.#amount <= maxAmount;
  }

  // #endregion

  // #region Business

  percentage(percent: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(percent)) {
      throw new InvalidPercentageError('Percentage must be a finite number.', { input: percent });
    }

    if (percent < 0) {
      throw new InvalidPercentageError('Percentage must be non-negative.', { input: percent });
    }

    if (percent === 0) return this.#zero();

    if (percent === 100) return this.clone();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#amount * (percent / 100)));
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

    return this.minus(this.percentage(discount, roundingMode));
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

    return this.plus(this.percentage(surcharge, roundingMode));
  }

  allocate(parts: number): MoneyContract[] {
    if (!Number.isInteger(parts) || parts < 1) {
      throw new InvalidAllocationError('Number of parts must be a positive integer.');
    }

    if (parts === 1) return [this.clone()];

    if (this.isZero()) return Array.from({ length: parts }, () => this.#zero());

    const isNegative = this.isNegative();
    const absoluteAmount = Math.abs(this.#amount);
    const base = Math.floor(absoluteAmount / parts);
    const remainder = absoluteAmount % parts;

    return Array.from({ length: parts }, (_, i) => {
      const value = base + (i < remainder ? 1 : 0);
      return this.#make(isNegative ? -value : value);
    });
  }

  allocateByRatio(ratios: number[]): MoneyContract[] {
    if (ratios.length === 0 || ratios.some((ratio) => !Number.isFinite(ratio) || ratio < 0)) {
      throw new InvalidAllocationError(
        'Ratios must be a non-empty array of non-negative finite numbers.',
      );
    }

    const total = ratios.reduce((acc, ratio) => acc + ratio, 0);

    if (total === 0) throw new InvalidAllocationError('The sum of ratios cannot be zero.');

    if (this.isZero()) return ratios.map(() => this.#zero());

    const isNegative = this.isNegative();
    const absoluteAmount = Math.abs(this.#amount);

    const shares = ratios.map((ratio) => Math.floor((absoluteAmount * ratio) / total));
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
    return formatMoney(this.value(), this.#currency, options);
  }

  clone(): MoneyContract {
    return this.#make(this.#amount);
  }

  toString(): string {
    return this.value().toFixed(this.#currency.fractionDigits);
  }

  toJSON(): MoneyJSON {
    return { amount: this.#amount, currencyCode: this.#currency.code };
  }

  // #endregion
}
