import type { DisplayOptions } from '@/types';
import type { MoneyContract } from '@/types/money';

import { FORMAT_STYLES } from '@/constants';

/**
 * Formats a monetary value as a localized string using `Intl.NumberFormat`.
 *
 * @param money   - A Money instance, a number, or a string representing the amount.
 * @param options - Formatting options (currency code, locale, symbol visibility, etc.).
 *
 * @throws {InvalidInputError} if `input` is null or undefined.
 *
 * @example
 * formatMoney(10.5, { currencyCode: 'BRL' })
 * // → 'R$ 10,50'
 *
 * formatMoney(1000, { currencyCode: 'USD', showSymbol: false })
 * // → '1,000.00'
 */
export function formatMoney(money: MoneyContract, options: Partial<DisplayOptions>): string {
  const { currencyCode, locale, showSymbol = true } = options;

  const { minimumFractionDigits, maximumFractionDigits } = new Intl.NumberFormat(locale, {
    style: FORMAT_STYLES.CURRENCY,
    currency: currencyCode,
  }).resolvedOptions();

  return new Intl.NumberFormat(locale, {
    style: showSymbol ? FORMAT_STYLES.CURRENCY : FORMAT_STYLES.DECIMAL,
    currency: currencyCode,
    minimumFractionDigits: options.minimumFractionDigits ?? minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits ?? maximumFractionDigits,
  }).format(money.value());
}
