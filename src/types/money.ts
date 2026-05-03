import type { RoundingMode } from '@/lib/constants';
import type { MoneyInput, MoneyOptions } from '@/types';

export interface MoneyContract {
  // ─── Accessors ────────────────────────────────────────────────────────

  cents(): number;

  value(): number;

  integer(): number;

  fraction(): number;

  units(): [number, number];

  // ─── State ────────────────────────────────────────────────────────────

  isZero(): boolean;

  isPositive(): boolean;

  isNegative(): boolean;

  // ─── Arithmetic ───────────────────────────────────────────────────────

  plus(value: MoneyInput): MoneyContract;

  minus(value: MoneyInput): MoneyContract;

  times(factor: number): MoneyContract;

  dividedBy(divisor: number): MoneyContract;

  // ─── Transformation ───────────────────────────────────────────────────

  absolute(): MoneyContract;

  negate(): MoneyContract;

  max(value: MoneyInput): MoneyContract;

  min(value: MoneyInput): MoneyContract;

  round(precision: number, mode?: RoundingMode): MoneyContract;

  // ─── Comparison ───────────────────────────────────────────────────────

  equals(value: MoneyInput): boolean;

  greaterThan(value: MoneyInput): boolean;

  lessThan(value: MoneyInput): boolean;

  greaterThanOrEqual(value: MoneyInput): boolean;

  lessThanOrEqual(value: MoneyInput): boolean;

  isBetween(min: MoneyInput, max: MoneyInput): boolean;

  // ─── Business ─────────────────────────────────────────────────────────

  percentage(percent: number): MoneyContract;

  applyDiscount(discount: number): MoneyContract;

  applySurcharge(surcharge: number): MoneyContract;

  allocate(parts: number): MoneyContract[];

  // ─── conversion ─────────────────────────────────────────────

  format(options?: MoneyOptions): string;

  clone(): MoneyContract;

  toString(): string;

  valueOf(): number;
}
