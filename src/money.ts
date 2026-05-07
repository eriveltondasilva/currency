import type { Currency } from './lib/currencies';
import type { FormatOptions, MoneyContract, MoneyInput, MoneyJSON, RoundingMode } from './types';

import { TAG } from './lib/constants';
import { toMinorUnit } from './lib/convert';
import {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
} from './lib/errors';
import { formatMoney } from './lib/format';
import { isMoney } from './lib/utils';

type RoundFunction = (value: number) => number;

const ROUND_FUNCTIONS = {
  ceil: Math.ceil,
  floor: Math.floor,
  trunc: Math.trunc,
  expand: (value: number) => {
    return value >= 0 ? Math.ceil(value) : Math.floor(value);
  },
  //
  halfExpand: (value: number) => {
    return Math.sign(value) * Math.round(Math.abs(value));
  },
  halfEven: (value: number) => {
    const floor = Math.floor(value);
    const frac = value - floor;
    if (frac !== 0.5) return Math.round(value);
    return floor % 2 === 0 ? floor : floor + 1;
  },
  halfCeil: Math.round,
  halfFloor: (value) => {
    return Math.ceil(value - 0.5);
  },
  halfTrunc: (value) => {
    return value >= 0 ? Math.ceil(value - 0.5) : Math.floor(value + 0.5);
  },
} as const satisfies Record<RoundingMode, RoundFunction>;

const SKIP_CONVERT = Symbol('money.internal');
const DEFAULT_ROUNDING_MODE: RoundingMode = 'halfExpand';

export class Money implements MoneyContract {
  /** @internal */
  readonly _tag = TAG;

  readonly #amount: number;
  readonly #currency: Currency;
  readonly #minorUnit: number;

  // #region Constructor

  constructor(input: MoneyInput, currency: Currency);
  constructor(sentinel: typeof SKIP_CONVERT, currency: Currency, rawMinorUnits: number);

  constructor(
    input: MoneyInput | typeof SKIP_CONVERT,
    currency: Currency,
    rawMinorUnits: number = 0,
  ) {
    this.#currency = currency;
    this.#minorUnit = 10 ** currency.fractionDigits;

    if (input === SKIP_CONVERT) {
      this.#amount = rawMinorUnits;
      return;
    }

    this.#amount = toMinorUnit(input, this.#currency);
  }

  // #endregion

  // #region Static factories

  static fromMinorUnits(amount: number, currency: Currency): MoneyContract {
    if (!Number.isFinite(amount)) {
      throw new InvalidInputError(`Expected a finite number of minor units, got ${amount}.`, {
        input: amount,
      });
    }

    if (!Number.isInteger(amount)) {
      throw new InvalidInputError(`Minor units must be an integer, got ${amount}.`, {
        input: amount,
      });
    }

    return new Money(SKIP_CONVERT, currency, amount);
  }

  static zero(currency: Currency): MoneyContract {
    return new Money(SKIP_CONVERT, currency, 0);
  }

  // #endregion

  // #region Private helpers

  #assertSameCurrency(input: MoneyInput): void {
    if (isMoney(input) && input.currencyCode() !== this.#currency.code) {
      throw new CurrencyMismatchError(this.#currency.code, input.currencyCode());
    }
  }

  #resolve(input: MoneyInput): number {
    this.#assertSameCurrency(input);
    return toMinorUnit(input, this.#currency);
  }

  #make(amount: number): MoneyContract {
    return new Money(SKIP_CONVERT, this.#currency, Math.round(amount));
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

  units(): [integer: number, cents: number] {
    return [this.integer(), this.cents()];
  }

  currencyCode(): string {
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

  times(factor: number): MoneyContract {
    if (!Number.isFinite(factor)) {
      throw new InvalidInputError(`Factor must be a finite number, got ${factor}.`, {
        input: factor,
      });
    }

    if (factor === 0) return this.#zero();

    return this.#make(this.#amount * factor);
  }

  dividedBy(divisor: number): MoneyContract {
    if (divisor === 0) throw new DivisionByZeroError();

    if (!Number.isFinite(divisor)) {
      throw new InvalidInputError(`Divisor must be a finite number, got ${divisor}.`, {
        input: divisor,
      });
    }

    if (divisor === 1) return this.#make(this.#amount);

    return this.#make(this.#amount / divisor);
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
    return this.#amount >= other ? this.#make(this.#amount) : this.#make(other);
  }

  min(input: MoneyInput): MoneyContract {
    const other = this.#resolve(input);
    return this.#amount <= other ? this.#make(this.#amount) : this.#make(other);
  }

  round(increment: number, mode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isInteger(increment) || increment < 1) {
      throw new InvalidInputError(`Step must be a positive integer, got ${increment}.`, {
        input: increment,
      });
    }

    if (increment === 1 || this.isZero()) return this.#make(this.#amount);

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

  percentage(percent: number): MoneyContract {
    if (percent < 0) {
      throw new InvalidPercentageError('Percentage must be non-negative.', { input: percent });
    }

    if (percent === 0) return this.#zero();

    if (percent === 100) return this.#make(this.#amount);

    return this.#make(this.#amount * (percent / 100));
  }

  applyDiscount(discount: number): MoneyContract {
    if (discount < 0)
      throw new InvalidPercentageError('Discount cannot be negative.', { input: discount });

    if (discount > 100)
      throw new InvalidPercentageError('Discount cannot exceed 100%.', { input: discount });

    if (discount === 0) return this.#make(this.#amount);

    if (discount === 100) return this.#zero();

    return this.minus(this.percentage(discount));
  }

  applySurcharge(surcharge: number): MoneyContract {
    if (surcharge < 0)
      throw new InvalidPercentageError('Surcharge must be non-negative.', { input: surcharge });

    if (surcharge === 0) return this.#make(this.#amount);

    return this.plus(this.percentage(surcharge));
  }

  allocate(parts: number): MoneyContract[] {
    if (!Number.isInteger(parts) || parts < 1) throw new InvalidAllocationError();

    if (parts === 1) return [this.#make(this.#amount)];

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

  // #endregion

  // #region Display

  format(options?: FormatOptions): string {
    return formatMoney(this, this.#currency, options);
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

  valueOf(): number {
    return this.value();
  }

  // #endregion
}
