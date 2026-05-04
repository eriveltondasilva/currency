import type { MoneyInput } from './types';
import type { MoneyContract } from './types/money';

import { from } from './factories';

export function BR(value: MoneyInput): MoneyContract {
  return from(value, 'BR');
}

export function US(value: MoneyInput): MoneyContract {
  return from(value, 'US');
}

export function DE(value: MoneyInput): MoneyContract {
  return from(value, 'DE');
}

export function FR(value: MoneyInput): MoneyContract {
  return from(value, 'FR');
}

export function PT(value: MoneyInput): MoneyContract {
  return from(value, 'PT');
}

export function GB(value: MoneyInput): MoneyContract {
  return from(value, 'GB');
}

export function JP(value: MoneyInput): MoneyContract {
  return from(value, 'JP');
}

export function CN(value: MoneyInput): MoneyContract {
  return from(value, 'CN');
}
