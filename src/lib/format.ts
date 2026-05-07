import type { FormatOptions, MoneyContract } from '@/types';
import type { Currency } from './currencies';

type IntlCurrencyDisplay = Exclude<FormatOptions['currencyDisplay'], 'none'>;

export function formatMoney(
  money: MoneyContract,
  currency: Currency,
  options: FormatOptions = {},
): string {
  const locale = options.locale ?? currency.locale;
  const code = currency.code;

  const isDecimalOnly = options.currencyDisplay === 'none';
  const isCompact = options.notation === 'compact';

  const currencyDisplay = isDecimalOnly
    ? undefined
    : ((options.currencyDisplay ?? 'symbol') as IntlCurrencyDisplay);

  return new Intl.NumberFormat(locale, {
    style: isDecimalOnly ? 'decimal' : 'currency',
    currency: isDecimalOnly ? undefined : code,

    currencyDisplay,

    notation: options.notation ?? 'standard',
    signDisplay: options.signDisplay ?? 'auto',
    useGrouping: options.useGrouping ?? true,

    minimumFractionDigits: isCompact ? 0 : currency.fractionDigits,
    maximumFractionDigits: isCompact ? 1 : currency.fractionDigits,
  }).format(money.value());
}
