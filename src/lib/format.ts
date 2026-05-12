import type { FormatOptions } from '@/types';
import type { Currency } from './currencies';

type IntlCurrencyDisplay = Exclude<FormatOptions['currencyDisplay'], 'none'>;

export function formatMoney(
  value: number,
  currency: Currency,
  options: FormatOptions = {},
): string {
  const locale = options.locale ?? currency.locale;

  const isDecimalOnly = options.currencyDisplay === 'none';
  const isCompact = options.notation === 'compact';

  return new Intl.NumberFormat(locale, {
    style: isDecimalOnly ? 'decimal' : 'currency',
    currency: isDecimalOnly ? undefined : currency.code,

    currencySign: options.currencySign ?? 'standard',

    currencyDisplay: isDecimalOnly
      ? undefined
      : ((options.currencyDisplay as IntlCurrencyDisplay) ?? 'symbol'),

    notation: options.notation ?? 'standard',
    compactDisplay: options.compactDisplay ?? 'short',

    signDisplay: options.signDisplay ?? 'auto',
    useGrouping: options.useGrouping ?? true,

    minimumFractionDigits:
      options.minimumFractionDigits ?? (isCompact ? 0 : currency.fractionDigits),
    maximumFractionDigits:
      options.maximumFractionDigits ??
      (isCompact ? Math.min(1, currency.fractionDigits) : currency.fractionDigits),

    trailingZeroDisplay: options.trailingZeroDisplay ?? 'auto',
    roundingMode: options.roundingMode ?? 'halfExpand',
  }).format(value);
}
