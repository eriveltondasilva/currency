# Types

All public types exported by the library. Import them from the main entry point:

```ts
import type {
  MoneyContract,
  MoneyInput,
  MoneyJSON,
  MoneyParts,
  MoneyComparison,
  //
  PricedItem,
  RoundingMode,
  //
  CountryCode,
  CurrencyCode,
  //
  FormatOptions,
  MoneyErrorCode,
} from '@eriveltondasilva/currency'
```

## MoneyContract

The public interface implemented by all monetary value objects returned by this library. Type your functions against this interface — never against the concrete `Money` class, which is an internal implementation detail and is not exported.

```ts
interface MoneyContract {
  // Accessors
  amount(): number
  minorUnits(): number
  units(): number
  subunits(): number
  toParts(): MoneyParts
  currencyCode(): CurrencyCode
  locale(): string

  // State
  isZero(): boolean
  isPositive(): boolean
  isNegative(): boolean

  // Arithmetic
  plus(input: MoneyInput): MoneyContract
  minus(input: MoneyInput): MoneyContract
  times(factor: number, roundingMode?: RoundingMode): MoneyContract
  divide(divisor: number, roundingMode?: RoundingMode): MoneyContract

  // Transformation
  abs(): MoneyContract
  negate(): MoneyContract
  max(input: MoneyInput): MoneyContract
  min(input: MoneyInput): MoneyContract
  round(step: number, mode?: RoundingMode): MoneyContract

  // Comparison
  equals(input: MoneyInput): boolean
  compare(other: MoneyInput): MoneyComparison
  greaterThan(input: MoneyInput): boolean
  lessThan(input: MoneyInput): boolean
  greaterThanOrEqual(input: MoneyInput): boolean
  lessThanOrEqual(input: MoneyInput): boolean
  isBetween(min: MoneyInput, max: MoneyInput): boolean
  hasSameCurrency(other: MoneyContract): boolean

  // Business
  percentOf(percent: number, roundingMode?: RoundingMode): MoneyContract
  applyDiscount(discount: number, roundingMode?: RoundingMode): MoneyContract
  applySurcharge(surcharge: number, roundingMode?: RoundingMode): MoneyContract
  allocate(parts: number): MoneyContract[]
  allocateByRatio(ratios: number[]): MoneyContract[]

  // Display
  format(options?: FormatOptions): string
  toString(): string
  toJSON(): MoneyJSON
}
```

**Usage:**

```ts
import type { MoneyContract } from '@eriveltondasilva/currency'

// ✅ Type function parameters and return values against the interface
function applyShipping(price: MoneyContract, fee: number): MoneyContract {
  return price.plus(fee)
}

function formatCart(items: MoneyContract[]): string[] {
  return items.map(item => item.format())
}
```

## MoneyInput

Accepted input for methods that receive an external monetary value. Either a plain `number` (interpreted as major units) or an existing `MoneyContract` instance.

```ts
type MoneyInput = number | MoneyContract
```

When a `MoneyContract` is passed, its currency must match the receiver's currency — otherwise a `CurrencyMismatchError` is thrown.

**Usage:**

```ts
import type { MoneyInput } from '@eriveltondasilva/currency'
import type { MoneyInput, CountryCode } from '@eriveltondasilva/currency'

// A function that accepts either a number or a MoneyContract
function display(value: MoneyInput, country: CountryCode): string {
  if (typeof value === 'number') return from(value, country).format()
  return value.format()
}
```

Use `isMoneyInput` to validate external inputs at runtime:

```ts
import { isMoneyInput } from '@eriveltondasilva/currency'

function assertMoneyInput(value: unknown): asserts value is MoneyInput {
  if (!isMoneyInput(value)) {
    throw new TypeError(`Expected a number or MoneyContract, got ${typeof value}`)
  }
}
```

## MoneyJSON

Plain-object representation of a `MoneyContract`, safe for JSON serialization and database persistence. Produced by `toJSON()` and consumed by `fromMinorUnits()`.

```ts
interface MoneyJSON {
  minorUnits: number     // internal integer (e.g. 1999 for R$ 19,99)
  currencyCode: string   // ISO 4217 code (e.g. 'BRL')
}
```

**Usage:**

```ts
import type { MoneyJSON } from '@eriveltondasilva/currency'
import { from, fromMinorUnits } from '@eriveltondasilva/currency'

// Serialize
const json: MoneyJSON = from(19.99, 'BR').toJSON()
// => { minorUnits: 1999, currencyCode: 'BRL' }

// Persist
await db.insert({ price: json.minorUnits, currency: json.currencyCode })

// Restore
const price = fromMinorUnits(json.minorUnits, 'BR')
```

::: info CurrencyCode vs CountryCode
`MoneyJSON.currencyCode` is an ISO 4217 code (e.g. `'BRL'`), while `fromMinorUnits` requires a `CountryCode` (e.g. `'BR'`). Maintain the mapping from currency code to country code on your side, or store the country code alongside the payload.

See [Serialization](/recipes/serialization) for recommended patterns.
:::

## MoneyParts

Structured breakdown of a `MoneyContract`'s value, returned by `toParts()`. Both `units` and `subunits` are always non-negative — use `isNegative` to recover the sign.

```ts
interface MoneyParts {
  units: number       // whole-unit part, always >= 0
  subunits: number    // sub-unit part, always >= 0
  isNegative: boolean // true when the amount is < 0
}
```

**Usage:**

```ts
import type { MoneyParts } from '@eriveltondasilva/currency'
import { from } from '@eriveltondasilva/currency'

from(19.99, 'BR').toParts()
// => { units: 19, subunits: 99, isNegative: false }

from(-19.99, 'BR').toParts()
// => { units: 19, subunits: 99, isNegative: true }

// Custom renderer with styled cents
function renderPrice({ units, subunits, isNegative }: MoneyParts): string {
  const sign = isNegative ? '-' : ''
  const cents = String(subunits).padStart(2, '0')
  return `${sign}$${units}<sup>.${cents}</sup>`
}
```

## PricedItem

Input type for the [`total()`](/api/collection#total) function. Represents an item with a unit price and an optional integer quantity.

```ts
interface PricedItem {
  price: MoneyInput // unit price — number (major units) or MoneyContract
  quantity?: number // non-negative integer, defaults to 1
}
```

**Constraints:**
- `quantity` must be a **non-negative integer**. Fractional values throw `InvalidInputError`.
- `quantity: 0` is valid — the item contributes zero to the total.
- `quantity` defaults to `1` when omitted.

**Usage:**

```ts
import type { PricedItem } from '@eriveltondasilva/currency'
import { total } from '@eriveltondasilva/currency'

const cartItems: PricedItem[] = [
  { price: 29.90, quantity: 2 },
  { price: 9.99,  quantity: 1 },
  { price: 4.99 }, // quantity defaults to 1
]

total(cartItems, 'BR').format() // => 'R$ 74,79'
```

## RoundingMode

Controls how a value is rounded when it falls between two representable minor-unit steps.

```ts
type RoundingMode =
  | 'ceil'       // toward +∞
  | 'floor'      // toward -∞
  | 'trunc'      // toward 0
  | 'expand'     // away from 0
  | 'halfExpand' // nearest, ties away from 0 (default)
  | 'halfEven'   // nearest, ties to even (banker's rounding)
  | 'halfCeil'   // nearest, ties toward +∞
  | 'halfFloor'  // nearest, ties toward -∞
  | 'halfTrunc'  // nearest, ties toward 0
```

**Methods that accept `RoundingMode`:** `times`, `divide`, `round`, `percentOf`, `applyDiscount`, `applySurcharge`, `average`, `format`.

The default across all methods is `'halfExpand'`.

See [Rounding Modes](/reference/rounding-modes) for a full breakdown of every mode with examples and use-case guidance.

## CountryCode

Union of all supported country codes. Used as the second argument to all top-level creation and collection functions.

```ts
type CountryCode =
  | 'AU' | 'BR' | 'CA' | 'CH' | 'CN'
  | 'DE' | 'FR' | 'GB' | 'IN' | 'JP'
  | 'MX' | 'PT' | 'SG' | 'US'
```

See [Supported Countries](/reference/supported-countries) for the full mapping to currency, locale, and separators.

## CurrencyCode

Union of all ISO 4217 currency codes supported by the library. Returned by `currencyCode()` and present in `MoneyJSON`.

```ts
type CurrencyCode =
  | 'AUD' | 'BRL' | 'CAD' | 'CHF' | 'CNY'
  | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'MXN'
  | 'SGD' | 'USD'
```

::: info
`CurrencyCode` is a read-only output type — it is returned by `currencyCode()` and stored in `MoneyJSON`. The library is always addressed by `CountryCode`, not `CurrencyCode`.
:::

## MoneyComparison

Return type of `compare()`. A numeric ternary representing the ordering relationship.

```ts
type MoneyComparison = -1 | 0 | 1
```

| Value | Meaning                                        |
| :---: | ---------------------------------------------- |
| `-1`  | This instance is **less than** the argument    |
|  `0`  | This instance is **equal to** the argument     |
|  `1`  | This instance is **greater than** the argument |

```ts
import type { MoneyComparison } from '@eriveltondasilva/currency'

function describeComparison(result: MoneyComparison): string {
  if (result === -1) return 'less than'
  if (result ===  1) return 'greater than'
  return 'equal to'
}
```

## MoneyErrorCode

Discriminant union of all error codes produced by the library. Available on every `MoneyError` instance via `.code`.

```ts
type MoneyErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_PERCENTAGE'
  | 'DIVISION_BY_ZERO'
  | 'INVALID_ALLOCATION'
  | 'INVALID_RANGE'
  | 'CURRENCY_MISMATCH'
  | 'UNSUPPORTED_CURRENCY'
  | 'UNSAFE_INTEGER'
```

See [Errors](/reference/errors) for the full per-code documentation and which methods throw each one.