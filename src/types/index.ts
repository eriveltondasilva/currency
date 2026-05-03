import type { CurrencyCode, CurrencyLocale } from '@/lib/constants';
import type { MoneyContract } from './money';

// ─── Primitives ───────────────────────────────────────────────────────────────

export type MoneyInput = number | string | MoneyContract;

export type Maybe<T> = T | null | undefined;

// ─── Options ──────────────────────────────────────────────────────────────────

export interface MoneyOptions {
  currencyCode: CurrencyCode;
  locale?: CurrencyLocale;
}

export interface FormatOptions extends MoneyOptions {
  showSymbol?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// ─── Other ───────────────────────────────────────────────────────────────────

export interface PricedItem {
  price: Maybe<MoneyInput>;
  quantity?: number;
}
