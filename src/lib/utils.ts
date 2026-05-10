import type { MoneyContract } from '@/types';

import { isMoney } from '@/money';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

export function isMoneyInput(value: unknown): value is number | MoneyContract {
  return typeof value === 'number' || isMoney(value);
}
