import type { RoundingMode } from './lib/constants';
import type { FormatOptions, MoneyInput, MoneyOptions } from './types';
import type { MoneyContract } from './types/money';

import { CENT_FACTOR, DEFAULT_MONEY_OPTIONS, ROUNDING_MODES, TAG } from './lib/constants';
import { toMinorUnit } from './lib/convert';
import {
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  MoneyError,
} from './lib/errors';
import { formatMoney } from './lib/format';
import { resolveLocale } from './lib/utils';

const SKIP_CONVERT = Symbol('money.internal');

export class Money implements MoneyContract {
  /** @internal */
  readonly _tag = TAG;

  readonly #cents: number = 0;
  readonly #options: MoneyOptions;

  // ─── Constructor ───────────────────────────────────────────────────────────

  constructor(input?: MoneyInput, options?: MoneyOptions);

  /** @internal */
  constructor(sentinel: typeof SKIP_CONVERT, options?: MoneyOptions, rawCents?: number);

  constructor(input?: MoneyInput | typeof SKIP_CONVERT, options?: MoneyOptions, rawCents?: number) {
    this.#options = { ...DEFAULT_MONEY_OPTIONS, ...options };

    if (input === SKIP_CONVERT) {
      this.#cents = rawCents ?? 0;
      return;
    }

    this.#cents = toMinorUnit(input, resolveLocale(this.#options));
  }

  // ─── Static factories ──────────────

  static fromCents(cents: number, options: MoneyOptions): MoneyContract {
    if (!Number.isFinite(cents)) {
      throw new InvalidInputError(`Expected a finite number of cents, got ${cents}.`);
    }

    return new Money(SKIP_CONVERT, options, Math.round(cents));
  }

  static zero(options?: MoneyOptions): MoneyContract {
    return new Money(SKIP_CONVERT, options, 0);
  }

  // ─── Private helpers ───────────────

  #make(cents: number): MoneyContract {
    return new Money(SKIP_CONVERT, this.#options, Math.round(cents));
  }

  #clone(): MoneyContract {
    return new Money(SKIP_CONVERT, this.#options, this.#cents);
  }

  // ─── Accessors ─────────────────────

  cents(): number {
    return this.#cents;
  }

  value(): number {
    return this.#cents / CENT_FACTOR;
  }

  integer(): number {
    return Math.floor(Math.abs(this.#cents) / CENT_FACTOR);
  }

  fraction(): number {
    return Math.abs(this.#cents % CENT_FACTOR) / CENT_FACTOR;
  }

  units(): [number, number] {
    return [this.integer(), this.fraction()];
  }

  // ─── State ─────────────────────────

  isZero(): boolean {
    return this.#cents === 0;
  }
  isPositive(): boolean {
    return this.#cents > 0;
  }
  isNegative(): boolean {
    return this.#cents < 0;
  }

  // ─── Arithmetic ────────────────────

  plus(value: MoneyInput): MoneyContract {
    const addend = toMinorUnit(value, this.#options.locale);
    return addend === 0 ? this.#clone() : this.#make(this.#cents + addend);
  }

  minus(value: MoneyInput): MoneyContract {
    const subtrahend = toMinorUnit(value, this.#options.locale);
    return subtrahend === 0 ? this.#clone() : this.#make(this.#cents - subtrahend);
  }

  times(factor: number): MoneyContract {
    if (!Number.isFinite(factor)) {
      throw new InvalidInputError(`Factor must be a finite number, got ${factor}.`);
    }

    if (factor === 0) return Money.zero(this.#options);

    if (factor === 1) return this.#clone();

    return this.#make(this.#cents * factor);
  }

  dividedBy(divisor: number): MoneyContract {
    if (divisor === 0) throw new DivisionByZeroError();

    if (!Number.isFinite(divisor)) {
      throw new InvalidInputError(`Divisor must be a finite number, got ${divisor}.`);
    }

    if (divisor === 1) return this.#clone();

    return this.#make(this.#cents / divisor);
  }

  // ─── Transformation ────────────────

  absolute(): MoneyContract {
    if (this.isPositive() || this.isZero()) return this.#clone();

    return this.#make(Math.abs(this.#cents));
  }

  negate(): MoneyContract {
    return this.isZero() ? this.#clone() : this.#make(-this.#cents);
  }

  max(value: MoneyInput): MoneyContract {
    const other = toMinorUnit(value, this.#options.locale);
    return this.#cents >= other ? this.#clone() : this.#make(other);
  }

  min(value: MoneyInput): MoneyContract {
    const other = toMinorUnit(value, this.#options.locale);
    return this.#cents <= other ? this.#clone() : this.#make(other);
  }

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

  // ─── Comparison ────────────────────

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

  isBetween(min: MoneyInput, max: MoneyInput): boolean {
    const minCents = toMinorUnit(min, this.#options.locale);
    const maxCents = toMinorUnit(max, this.#options.locale);
    if (minCents > maxCents) throw new InvalidRangeError();
    return this.#cents >= minCents && this.#cents <= maxCents;
  }

  // ─── Business ──────────────────────

  percentage(percent: number): MoneyContract {
    if (percent <= 0) {
      throw new InvalidPercentageError('Percentage must be greater than zero.');
    }
    if (percent === 100) return this.#clone();
    return this.times(percent / 100);
  }

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

  applySurcharge(surcharge: number): MoneyContract {
    if (surcharge <= 0) {
      throw new InvalidPercentageError('Surcharge must be greater than zero.');
    }

    return this.plus(this.percentage(surcharge));
  }

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

  // ─── conversion ────────────────────

  format(options: FormatOptions): string {
    return formatMoney(this, { ...this.#options, ...options });
  }

  clone(): MoneyContract {
    return this.#clone();
  }

  toString(): string {
    return this.value().toFixed(2);
  }

  valueOf(): number {
    return this.value();
  }
}
