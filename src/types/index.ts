import type { CURRENCY_LOCALES, ROUNDING_MODES } from '../config/constants.ts';
import type { Money } from '../lib/money.ts';

export type CurrencyCode = keyof typeof CURRENCY_LOCALES;
export type CurrencyLocales = (typeof CURRENCY_LOCALES)[keyof typeof CURRENCY_LOCALES];
export type RoundingModes = (typeof ROUNDING_MODES)[keyof typeof ROUNDING_MODES];

export type MoneyInput = number | string | Money;

export interface PricedItem {
  price: MoneyInput;
  quantity?: number;
  [key: string]: unknown;
}

export interface FormatOptions {
  currencyCode?: CurrencyCode;
  locale?: CurrencyLocales;
  showSymbol?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface IConversionService {
  toCents(value: MoneyInput): number;
}

export interface IFormattingService {
  format(value: MoneyInput, options?: FormatOptions): string;
}

export interface ICalculationService {
  addition(firstValue: number, secondValue: number): Money;
  subtraction(firstValue: number, secondValue: number): Money;
  multiplication(value: number, factor: number): Money;
  division(value: number, divisor: number): Money;
  percentage(value: number, percentage: number): Money;
  //
  calculateSubtotal(item: PricedItem, quantity: number): Money;
  calculateTotal(items: PricedItem[] | null): Money;
  calculateAveragePrice(items: PricedItem[] | null): Money;
  distributeInstallments(value: MoneyInput, numberOfInstallments: number): Money[];
}

export interface IRoundingService {
  round(value: number, precision: number, mode: RoundingModes): number;
}

interface IMoneyProperties {
  cents: number;
  value: number;
  integer: number;
  decimal: number;
  isZero: boolean;
  isPositive: boolean;
  isNegative: boolean;
  formatOptions: FormatOptions;
}

interface IMoneyConversion {
  toString(): string;
  valueOf(): number;
  format(options: FormatOptions): string;
  clone(): Money;
}

interface IMoneyComparison {
  equals(value: MoneyInput): boolean;
  isBetween(min: MoneyInput, max: MoneyInput): boolean;
  greaterThan(value: MoneyInput): boolean;
  lessThan(value: MoneyInput): boolean;
  greaterThanOrEqual(value: MoneyInput): boolean;
  lessThanOrEqual(value: MoneyInput): boolean;
}

interface IMoneyTransformation {
  absolute(): Money;
  max(value: MoneyInput): Money;
  min(value: MoneyInput): Money;
  negate(): Money;
  round(precision?: number, mode?: RoundingModes): Money;
}

interface IMoneyArithmetic {
  plus(value: MoneyInput): Money;
  minus(value: MoneyInput): Money;
  times(factor: number): Money;
  dividedBy(divisor: number): Money;
}

interface IMoneyBusiness {
  allocate(numberOfParts: number): Money[];
  applyDiscount(discount: number): Money;
  applySurcharge(surcharge: number): Money;
  percentage(percentage: number): Money;
}

export interface IMoney
  extends IMoneyProperties,
    IMoneyConversion,
    IMoneyComparison,
    IMoneyTransformation,
    IMoneyArithmetic,
    IMoneyBusiness {}
