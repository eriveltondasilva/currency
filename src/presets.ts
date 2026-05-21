import type { CountryCode } from './lib/currencies';
import type { MoneyContract } from './types';

import { from, parse } from './api/creation';

// ─────────────────────────────────────────────────────────────────────────────

function preset(value: number | string, country: CountryCode): MoneyContract {
  return typeof value === 'string' ? parse(value, country) : from(value, country);
}

// ─────────────────────────────────────────────────────────────────────────────

export function ae(value: number | string): MoneyContract {
  return preset(value, 'AE');
}
export function ar(value: number | string): MoneyContract {
  return preset(value, 'AR');
}
export function au(value: number | string): MoneyContract {
  return preset(value, 'AU');
}
export function br(value: number | string): MoneyContract {
  return preset(value, 'BR');
}
export function ca(value: number | string): MoneyContract {
  return preset(value, 'CA');
}
export function ch(value: number | string): MoneyContract {
  return preset(value, 'CH');
}
export function cl(value: number | string): MoneyContract {
  return preset(value, 'CL');
}
export function cn(value: number | string): MoneyContract {
  return preset(value, 'CN');
}
export function co(value: number | string): MoneyContract {
  return preset(value, 'CO');
}
export function de(value: number | string): MoneyContract {
  return preset(value, 'DE');
}
export function fr(value: number | string): MoneyContract {
  return preset(value, 'FR');
}
export function gb(value: number | string): MoneyContract {
  return preset(value, 'GB');
}
export function ind(value: number | string): MoneyContract {
  return preset(value, 'IN');
}
export function jp(value: number | string): MoneyContract {
  return preset(value, 'JP');
}
export function kr(value: number | string): MoneyContract {
  return preset(value, 'KR');
}
export function mx(value: number | string): MoneyContract {
  return preset(value, 'MX');
}
export function no(value: number | string): MoneyContract {
  return preset(value, 'NO');
}
export function nz(value: number | string): MoneyContract {
  return preset(value, 'NZ');
}
export function pt(value: number | string): MoneyContract {
  return preset(value, 'PT');
}
export function ru(value: number | string): MoneyContract {
  return preset(value, 'RU');
}
export function sa(value: number | string): MoneyContract {
  return preset(value, 'SA');
}
export function se(value: number | string): MoneyContract {
  return preset(value, 'SE');
}
export function sg(value: number | string): MoneyContract {
  return preset(value, 'SG');
}
export function us(value: number | string): MoneyContract {
  return preset(value, 'US');
}
export function za(value: number | string): MoneyContract {
  return preset(value, 'ZA');
}