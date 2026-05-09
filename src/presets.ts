import type { MoneyContract, MoneyInput } from './types';

import { from } from '@/api/creation';

export const au = (value: MoneyInput): MoneyContract => from(value, 'AU');
export const br = (value: MoneyInput): MoneyContract => from(value, 'BR');
export const ca = (value: MoneyInput): MoneyContract => from(value, 'CA');
export const ch = (value: MoneyInput): MoneyContract => from(value, 'CH');
export const cn = (value: MoneyInput): MoneyContract => from(value, 'CN');
export const de = (value: MoneyInput): MoneyContract => from(value, 'DE');
export const fr = (value: MoneyInput): MoneyContract => from(value, 'FR');
export const gb = (value: MoneyInput): MoneyContract => from(value, 'GB');
export const ind = (value: MoneyInput): MoneyContract => from(value, 'IN');
export const jp = (value: MoneyInput): MoneyContract => from(value, 'JP');
export const mx = (value: MoneyInput): MoneyContract => from(value, 'MX');
export const sg = (value: MoneyInput): MoneyContract => from(value, 'SG');
export const pt = (value: MoneyInput): MoneyContract => from(value, 'PT');
export const us = (value: MoneyInput): MoneyContract => from(value, 'US');
