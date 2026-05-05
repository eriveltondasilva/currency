import type { MoneyContract } from './money';

// ─── Primitives ───────────────────────────────────────────────────────────────

export type MoneyInput = number | string | MoneyContract;

// ─── Format options ───────────────────────────────────────────────────────────

export interface FormatOptions {
  /**
   * Controls how the currency symbol/code is displayed.
   *
   * - `'symbol'`       → R$, $, €
   * - `'narrowSymbol'` → $ (shorter, avoids ambiguity)
   * - `'code'`         → BRL, USD, EUR
   * - `'name'`         → real brasileiro, US dollar
   * - `'none'`         → no currency indicator (decimal style)
   */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name' | 'none';

  /**
   * Controls the number notation format.
   *
   * - `'standard'` → 1.500.000,00  (default)
   * - `'compact'`  → 1,5 mi / 1.5M (useful for dashboards)
   */
  notation?: 'standard' | 'compact';

  /**
   * Controls when the +/- sign is displayed.
   *
   * - `'auto'`       → only negative values show sign (default)
   * - `'always'`     → +R$ 100,00 / -R$ 50,00
   * - `'exceptZero'` → sign on all except zero
   * - `'negative'`   → only negative, no + for positives
   */
  signDisplay?: 'auto' | 'always' | 'exceptZero' | 'negative';

  /** Whether to use grouping separators (e.g. 1.000 vs 1000). Defaults to `true`. */
  useGrouping?: boolean;

  /** Override the locale for display only — does not affect internal values. */
  locale?: string;
}

// ─── Other ───────────────────────────────────────────────────────────────────

export interface PricedItem {
  price: MoneyInput;
  quantity?: number;
}
