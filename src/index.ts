/**
 * @module @eriveltondasilva/currency
 *
 * # A lightweight TypeScript library for precise monetary operations.
 *
 * All values are stored internally as **minor-unit integers** to eliminate
 * floating-point errors. Every operation returns a new instance — the API
 * is fully immutable.
 *
 * ## Quick start
 *
 * @example
 * import { from, sum, total } from '@eriveltondasilva/currency'
 *
 * const price = from(19.99, 'BR')
 * price.format()                   // => 'R$ 19,99'
 * price.applyDiscount(10).format() // => 'R$ 17,99'
 *
 * sum([10, 20, 30], 'US').format() // => '$60.00'
 *
 * const items = [
 *   { price: 9.99, quantity: 3 },
 *   { price: 4.99 },
 * ]
 * total(items, 'US').format()
 * // => '$34.96'
 *
 * ## Preset shorthand (optional import)
 *
 * @example
 * import { br, us } from '@eriveltondasilva/currency/presets'
 *
 * br(19.99).format() // => 'R$ 19,99'
 * us(9.99).format()  // => '$9.99'
 *
 * ## Supported countries
 *
 * `AU`, `BR`, `CA`, `CH`, `CN`, `DE`, `FR`, `GB`, `IN`, `JP`, `MX`, `PT`, `SG`, `US`
 */

import * as api from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export type {
  FormatOptions,
  MoneyContract,
  MoneyInput,
  PricedItem,
  RoundingMode,
} from './types';

// ─── Errors ──────────────────────────────────────────────────────────────────

export {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  MoneyError,
  UnsafeIntegerError,
  UnsupportedCurrencyError,
} from './lib/errors';

// ─── Namespace API ───────────────────────────────────────────────────────────

/**
 * Frozen namespace that exposes the full library API as a single object.
 * Useful when a single import is preferred over named imports.
 *
 * @remarks
 * Prefer named imports over this namespace for better tree-shaking.
 *
 * ```ts
 * // ✅ Only `from` and `format` are bundled
 * import { from } from '@eriveltondasilva/currency'
 *
 * // ⚠️  Entire library is bundled
 * import Money from '@eriveltondasilva/currency'
 * ```
 *
 * @example
 * import Money from '@eriveltondasilva/currency'
 *
 * // Creation
 * Money.from(19.99, 'BR').format()          // => 'R$ 19,99'
 * Money.fromMinorUnits(2000, 'BR').format() // => 'R$ 20,00'
 * Money.parse('$20.00', 'US').format()      // => '$20.00'
 * Money.zero('US').format()                 // => '$0.00'
 *
 * // Collection
 * Money.average([10, 20], 'US').format() // => '$15.00'
 * Money.clamp(100, 1, 20, 'US').format() // => '$20.00'
 * Money.max([10, 20], 'US').format()     // => '$20.00'
 * Money.min([10, 20], 'US').format()     // => '$10.00'
 * Money.sum([10, 20, 30], 'US').format() // => '$60.00'
 *
 * // Business
 * Money.percent(10, 200, 'US') // => 5
 * Money.total([{ price: 5, quantity: 2 }], 'US').format()
 * // => '$10.00'
 *
 * // Utils
 * Money.isMoney(Money.from(19.99, 'BR'))      // => true
 * Money.isMoneyInput(Money.from(19.99, 'BR')) // => true
 */
export const Money: typeof api = Object.freeze({ ...api });

// ─── Creation ────────────────────────────────────────────────────────────────

export {
  from as money,
  from,
  fromMinorUnits,
  parse as fromString,
  parse,
  zero,
} from './api/creation';

// ─── Collection ──────────────────────────────────────────────────────────────

export {
  average,
  clamp,
  max,
  min,
  sum,
} from './api/collection';

// ─── Business ────────────────────────────────────────────────────────────────

export {
  percent,
  total,
} from './api/business';

// ─── Utils ───────────────────────────────────────────────────────────────────

export { isMoney, isMoneyInput } from './lib/utils';
export default Money;
