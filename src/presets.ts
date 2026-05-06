import type { MoneyInput } from './types';
import type { MoneyContract } from './types/contract';

import { from } from '@/api/creation';

export const AU = (value: MoneyInput): MoneyContract => from(value, 'AU');
export const BR = (value: MoneyInput): MoneyContract => from(value, 'BR');
export const CA = (value: MoneyInput): MoneyContract => from(value, 'CA');
export const CH = (value: MoneyInput): MoneyContract => from(value, 'CH');
export const CN = (value: MoneyInput): MoneyContract => from(value, 'CN');
export const DE = (value: MoneyInput): MoneyContract => from(value, 'DE');
export const FR = (value: MoneyInput): MoneyContract => from(value, 'FR');
export const GB = (value: MoneyInput): MoneyContract => from(value, 'GB');
export const IN = (value: MoneyInput): MoneyContract => from(value, 'IN');
export const JP = (value: MoneyInput): MoneyContract => from(value, 'JP');
export const MX = (value: MoneyInput): MoneyContract => from(value, 'MX');
export const SG = (value: MoneyInput): MoneyContract => from(value, 'SG');
export const PT = (value: MoneyInput): MoneyContract => from(value, 'PT');
export const US = (value: MoneyInput): MoneyContract => from(value, 'US');
