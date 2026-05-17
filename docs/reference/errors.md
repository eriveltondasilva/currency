# Errors

All errors exported by this library extend `MoneyError` and carry a `.code` property for programmatic handling. See [Error Handling](/guide/error-handling) for patterns and best practices.

```ts
import {
  MoneyError,
  InvalidInputError,
  InvalidPercentageError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidRangeError,
  CurrencyMismatchError,
  UnsupportedCurrencyError,
  UnsafeIntegerError,
} from '@eriveltondasilva/currency'
```

## MoneyError

Abstract base class for all library errors.

```ts
abstract class MoneyError extends Error {
  readonly code: MoneyErrorCode
  readonly input?: unknown
}
```

| Property  | Type                   | Description                          |
| --------- | ---------------------- | ------------------------------------ |
| `code`    | `MoneyErrorCode`       | Machine-readable error identifier    |
| `message` | `string`               | Human-readable description           |
| `input`   | `unknown \| undefined` | The offending value, when applicable |

Use `instanceof MoneyError` to catch any library error without importing individual subclasses.

## InvalidInputError

**Code:** `INVALID_INPUT`

Thrown when a value fails basic input validation — wrong type, `null`, `undefined`, non-finite number, or a string that cannot be parsed as a monetary amount.

**Thrown by:** `from`, `parse`, `fromMinorUnits`, `fromString`, `times`, `divide`, `round`, and any function that receives a raw value input.

```ts
import { from, parse, InvalidInputError } from '@eriveltondasilva/currency'

// null / undefined
from(null as any, 'US') // ❌ InvalidInputError — value cannot be null or undefined

// wrong type
from('19.99' as any, 'US') // ❌ InvalidInputError — expected a number

// non-finite number
from(Infinity, 'US') // ❌ InvalidInputError — value must be a finite number
from(NaN, 'US')      // ❌ InvalidInputError

// unparseable string
parse('not-a-number', 'US') // ❌ InvalidInputError — cannot parse value as a monetary amount
parse('1.99.99', 'US')      // ❌ InvalidInputError — multiple decimal separators found

// non-finite factor
from(10, 'US').times(NaN) // ❌ InvalidInputError — factor must be a finite number

// invalid round step
from(10, 'US').round(-1) // ❌ InvalidInputError — step must be a positive finite number
```

## InvalidPercentageError

**Code:** `INVALID_PERCENTAGE`

Thrown when a percentage value is negative, non-finite, or — for `applyDiscount` — exceeds `100`.

**Thrown by:** `percentOf`, `applyDiscount`, `applySurcharge`.

```ts
import { from, InvalidPercentageError } from '@eriveltondasilva/currency'

from(100, 'US').percentOf(-10)      // ❌ InvalidPercentageError — must be non-negative
from(100, 'US').percentOf(Infinity) // ❌ InvalidPercentageError — must be a finite number
from(100, 'US').applyDiscount(101)  // ❌ InvalidPercentageError — cannot exceed 100%
from(100, 'US').applySurcharge(-5)  // ❌ InvalidPercentageError — must be non-negative
```

```ts
// ✅ Valid inputs
from(100, 'US').percentOf(0)       // => $0.00
from(100, 'US').percentOf(100)     // => $100.00
from(100, 'US').applyDiscount(100) // => $0.00
from(100, 'US').applySurcharge(0)  // => $100.00
```

## DivisionByZeroError

**Code:** `DIVISION_BY_ZERO`

Thrown when a division or percentage operation uses a denominator that resolves to zero.

**Thrown by:** `divide`, `percent`.

```ts
import { from, percent, DivisionByZeroError } from '@eriveltondasilva/currency'

from(10, 'US').divide(0)        // ❌ DivisionByZeroError
percent(5, 0, 'US')             // ❌ DivisionByZeroError
percent(5, from(0, 'US'), 'US') // ❌ DivisionByZeroError
```

::: tip
`DivisionByZeroError` does not populate `.input` — the zero divisor is implicit from the operation.
:::

## InvalidAllocationError

**Code:** `INVALID_ALLOCATION`

Thrown when `allocate` or `allocateByRatio` receive arguments that make allocation impossible.

**Thrown by:** `allocate`, `allocateByRatio`.

```ts
import { from, InvalidAllocationError } from '@eriveltondasilva/currency'

// allocate — parts must be a positive integer
from(100, 'US').allocate(0)   // ❌ InvalidAllocationError
from(100, 'US').allocate(-1)  // ❌ InvalidAllocationError
from(100, 'US').allocate(1.5) // ❌ InvalidAllocationError

// allocateByRatio — ratios must be non-empty, non-negative integers summing to > 0
from(100, 'US').allocateByRatio([])         // ❌ InvalidAllocationError — empty array
from(100, 'US').allocateByRatio([0, 0])     // ❌ InvalidAllocationError — sum is zero
from(100, 'US').allocateByRatio([-1, 2])    // ❌ InvalidAllocationError — negative ratio
from(100, 'US').allocateByRatio([0.5, 0.5]) // ❌ InvalidAllocationError — non-integer ratios
```

```ts
// ✅ Valid inputs
from(100, 'US').allocate(3)
// => [$33.34, $33.33, $33.33]

from(100, 'US').allocateByRatio([1, 3])
// => [$25.00, $75.00]
```

## InvalidRangeError

**Code:** `INVALID_RANGE`

Thrown when a `min` value is greater than a `max` value in any range-based operation.

**Thrown by:** `isBetween`, `clamp`.

```ts
import { from, clamp, InvalidRangeError } from '@eriveltondasilva/currency'

from(5, 'US').isBetween(10, 1) // ❌ InvalidRangeError — min (10) > max (1)
clamp(5, 100, 0, 'US')         // ❌ InvalidRangeError — min (100) > max (0)
```

```ts
// ✅ Valid inputs — min must be <= max
from(5, 'US').isBetween(1, 10)    // => true
clamp(150, 0, 100, 'US').amount() // => 100
```

## CurrencyMismatchError

**Code:** `CURRENCY_MISMATCH`

Thrown when an operation is attempted between two `MoneyContract` instances that carry different currency codes.

**Thrown by:** `plus`, `minus`, `times` (when passing `MoneyContract`), `equals` (returns `false` instead of throwing), `compare`, `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`, `isBetween`, `max`, `min`, `sum`, `average`, `total`, `clamp`, `percent`.

```ts
import { from, CurrencyMismatchError } from '@eriveltondasilva/currency'

const brl = from(10, 'BR') // BRL
const usd = from(10, 'US') // USD

brl.plus(usd)    // ❌ CurrencyMismatchError — BRL and USD
brl.minus(usd)   // ❌ CurrencyMismatchError
brl.compare(usd) // ❌ CurrencyMismatchError
brl.isBetween(usd, from(20, 'BR')) // ❌ CurrencyMismatchError
```

::: info Notable exception
`equals` never throws on currency mismatch — it returns `false` instead, making it safe for use in comparisons without a try/catch.

```ts
from(10, 'BR').equals(from(10, 'US')) // => false (no error)
```

:::

## UnsupportedCurrencyError

**Code:** `UNSUPPORTED_CURRENCY`

Thrown when a country code is not in the [supported list](/reference/supported-countries).

**Thrown by:** any function that accepts a `CountryCode` parameter — `from`, `parse`, `fromMinorUnits`, `zero`, `sum`, `average`, `total`, `min`, `max`, `clamp`, `percent`.

```ts
import { from, UnsupportedCurrencyError } from '@eriveltondasilva/currency'

from(10, 'XX' as any)  // ❌ UnsupportedCurrencyError
from(10, 'BRL' as any) // ❌ UnsupportedCurrencyError — use 'BR', not 'BRL'
```

The error message includes the full list of supported codes:

```
'XX' is not a supported currency country.
Supported codes: AU, BR, CA, CH, CN, DE, FR, GB, IN, JP, MX, SG, PT, US.
```

::: tip
TypeScript will catch invalid country codes at compile time if your input is typed as `CountryCode`. `UnsupportedCurrencyError` only surfaces at runtime for values that bypass the type system (e.g. from API responses or user input).
:::

## UnsafeIntegerError

**Code:** `UNSAFE_INTEGER`

Thrown when an arithmetic operation produces a result that exceeds `Number.MAX_SAFE_INTEGER` (`2^53 − 1`), which would compromise integer precision in minor-unit calculations.

**Thrown by:** `plus`, `minus`, `times`, `divide`, `sum`, `average`, `total`, `allocateByRatio`, and any operation that accumulates values.

```ts
import { from, UnsafeIntegerError } from '@eriveltondasilva/currency'

const huge = from(Number.MAX_SAFE_INTEGER / 100, 'US')
huge.plus(1) // ❌ UnsafeIntegerError
```

::: warning
This error is uncommon in practice — `Number.MAX_SAFE_INTEGER` in minor units represents over **90 trillion USD**. If you encounter it, it almost certainly indicates a bug in the input data.
:::
