import type { MoneyContract } from './types';

import { from } from '@/api/creation';

export const au = (value: number): MoneyContract => from(value, 'AU');
export const br = (value: number): MoneyContract => from(value, 'BR');
export const ca = (value: number): MoneyContract => from(value, 'CA');
export const ch = (value: number): MoneyContract => from(value, 'CH');
export const cn = (value: number): MoneyContract => from(value, 'CN');
export const de = (value: number): MoneyContract => from(value, 'DE');
export const fr = (value: number): MoneyContract => from(value, 'FR');
export const gb = (value: number): MoneyContract => from(value, 'GB');
export const ind = (value: number): MoneyContract => from(value, 'IN');
export const jp = (value: number): MoneyContract => from(value, 'JP');
export const mx = (value: number): MoneyContract => from(value, 'MX');
export const sg = (value: number): MoneyContract => from(value, 'SG');
export const pt = (value: number): MoneyContract => from(value, 'PT');
export const us = (value: number): MoneyContract => from(value, 'US');
