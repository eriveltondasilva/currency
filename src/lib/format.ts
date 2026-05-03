import type { FormatOptions } from '@/types';
import type { MoneyContract } from '@/types/money';

import { DEFAULT_MONEY_OPTIONS, FORMAT_STYLES } from '@/lib/constants';
import { resolveLocale } from '@/lib/utils';

export function formatMoney(money: MoneyContract, options: FormatOptions): string {
  const currencyCode = options.currencyCode ?? DEFAULT_MONEY_OPTIONS.currencyCode;
  const locale = resolveLocale({ currencyCode, locale: options.locale });
  const showSymbol = options.showSymbol ?? true;

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
