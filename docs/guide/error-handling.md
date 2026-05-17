# Error Handling

All failures in this library throw a typed subclass of `MoneyError`. Every error exposes a `.code` property — a machine-readable string constant that lets you handle failures programmatically without relying on error message parsing.

## The MoneyError base class

```ts
abstract class MoneyError extends Error {
  readonly code: MoneyErrorCode // machine-readable identifier
  readonly input?: unknown      // the offending value, when available
}
```

All errors share this shape. Use `instanceof MoneyError` to catch any library error in a single branch:

```ts
import { from, MoneyError } from '@eriveltondasilva/currency'

try {
  from(10, 'BR').plus(from(10, 'US'))
} catch (err) {
  if (err instanceof MoneyError) {
    console.error(err.code)    // 'CURRENCY_MISMATCH'
    console.error(err.message) // 'Cannot operate on mismatched currencies: BRL and USD.'
    console.error(err.input)   // undefined (not applicable for this error)
  }
}
```

## Handling specific errors

Import the specific class when you need to distinguish between failure types:

```ts
import {
  from,
  MoneyError,
  CurrencyMismatchError,
  InvalidInputError,
} from '@eriveltondasilva/currency'

try {
  from(10, 'BR').plus(from(10, 'US'))
} catch (err) {
  if (err instanceof CurrencyMismatchError) {
    // handle currency mismatch specifically
  } else if (err instanceof MoneyError) {
    // handle any other library error
  } else {
    throw err // re-throw unknown errors
  }
}
```

## Switching on error codes

The `.code` property enables exhaustive handling without multiple `instanceof` checks. This is particularly useful when the same `catch` block needs to handle different failure modes differently:

```ts
import { from, total, MoneyError } from '@eriveltondasilva/currency'

try {
  const result = total(items, country)
} catch (err) {
  if (!(err instanceof MoneyError)) throw err

  switch (err.code) {
    case 'INVALID_INPUT':
      return { error: 'One or more items have an invalid price or quantity.' }

    case 'CURRENCY_MISMATCH':
      return { error: 'All prices must use the same currency.' }

    case 'UNSAFE_INTEGER':
      return { error: 'The total amount is too large to be computed safely.' }

    case 'UNSUPPORTED_CURRENCY':
      return { error: `Country code '${country}' is not supported.` }

    default:
      throw err
  }
}
```

TypeScript will narrow `err.code` to `MoneyErrorCode` inside the `instanceof` check, giving you full autocomplete and exhaustiveness checking on the `switch`.

## Inspecting the offending input

When relevant, the error's `.input` property holds the value that triggered the failure:

```ts
import { from, InvalidInputError } from '@eriveltondasilva/currency'

try {
  from(Infinity, 'US')
} catch (err) {
  if (err instanceof InvalidInputError) {
    console.error(err.input) // => Infinity
  }
}
```

This is useful for logging and debugging, but not all errors populate `.input` — for example, `DivisionByZeroError` and `InvalidRangeError` do not, as the offending value is implicit from the operation itself.

## Error reference

| Class                      | Code                   | Thrown when                                                               |
| -------------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `InvalidInputError`        | `INVALID_INPUT`        | Value is wrong type, `null`, `undefined`, non-finite, or cannot be parsed |
| `InvalidPercentageError`   | `INVALID_PERCENTAGE`   | Percentage is negative, non-finite, or exceeds `100`                      |
| `DivisionByZeroError`      | `DIVISION_BY_ZERO`     | Divisor or denominator resolves to zero                                   |
| `InvalidAllocationError`   | `INVALID_ALLOCATION`   | `allocate` / `allocateByRatio` receives invalid arguments                 |
| `InvalidRangeError`        | `INVALID_RANGE`        | `min` is greater than `max` in range-based operations                     |
| `CurrencyMismatchError`    | `CURRENCY_MISMATCH`    | Operation between two `MoneyContract` instances with different currencies |
| `UnsupportedCurrencyError` | `UNSUPPORTED_CURRENCY` | Country code is not in the supported list                                 |
| `UnsafeIntegerError`       | `UNSAFE_INTEGER`       | Result exceeds `Number.MAX_SAFE_INTEGER`                                  |

See [Errors](/reference/errors) for the full per-class documentation, including which methods throw each error.

## Validating inputs upfront

For user-facing inputs (forms, API payloads), validate before constructing a monetary value rather than relying solely on `try/catch`:

```ts
import { from } from '@eriveltondasilva/currency'
import type { CountryCode, MoneyContract } from '@eriveltondasilva/currency'

function parsePrice(raw: unknown, country: CountryCode): MoneyContract {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0) {
    throw new Error('Price must be a non-negative number.')
  }

  return from(raw, country)
}
```

Use `isMoney` and `isMoneyInput` as type guards when handling values of unknown origin:

```ts
import { isMoney, isMoneyInput } from '@eriveltondasilva/currency'

function display(value: unknown): string {
  if (isMoney(value)) return value.format()
  if (typeof value === 'number') return value.toFixed(2)
  return String(value)
}
```

## TypeScript: typed error codes

The full union of error codes is exported as `MoneyErrorCode`:

```ts
import type { MoneyErrorCode } from '@eriveltondasilva/currency'

function logMoneyError(code: MoneyErrorCode, context: string): void {
  console.warn(`[${context}] monetary operation failed: ${code}`)
}
```
