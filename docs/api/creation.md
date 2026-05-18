# Creation

Functions for constructing `MoneyContract` instances. All amounts are created in **major units** unless stated otherwise.

```ts
import { from, parse, fromMinorUnits, zero } from '@eriveltondasilva/currency'
```

## from

Creates a `MoneyContract` from a number in major units.

Also exported as `money` — an alias for more expressive usage at call sites.

```ts
function from(value: number, country: CountryCode): MoneyContract
function money(value: number, country: CountryCode): MoneyContract // alias
```

### Parameters

| Name      | Type          | Description                                  |
| --------- | ------------- | -------------------------------------------- |
| `value`   | `number`      | Amount in major units (e.g. `19.99`)         |
| `country` | `CountryCode` | Supported country code (e.g. `'BR'`, `'US'`) |

### Returns

A new `MoneyContract` instance.

### Throws

| Error                      | Condition                                                          |
| -------------------------- | ------------------------------------------------------------------ |
| `InvalidInputError`        | `value` is `null`, `undefined`, not a `number`, or not finite      |
| `UnsupportedCurrencyError` | `country` is not a supported code                                  |
| `UnsafeIntegerError`       | `value` exceeds safe integer range after conversion to minor units |

### Examples

```ts
import { from, money } from '@eriveltondasilva/currency'

from(19.99, 'BR').format() // => 'R$ 19,99'
from(0, 'US').isZero()     // => true
from(1000, 'JP').format()  // => '¥1,000'

// Alias
money(9.99, 'US').format() // => '$9.99'
```

```ts
// Fractions are rounded to the currency's minor unit
from(19.999, 'US').amount() // => 20    (rounded up)
from(19.994, 'US').amount() // => 19.99 (rounded down)
```

```ts
// Negative values are valid
from(-50, 'US').format()     // => '-$50.00'
from(-50, 'US').isNegative() // => true
```

## parse

Creates a `MoneyContract` by parsing a locale-formatted currency string.

Also exported as `fromString`.

```ts
function parse(value: string, country: CountryCode): MoneyContract
function fromString(value: string, country: CountryCode): MoneyContract // alias
```

The parser strips currency symbols and non-numeric characters, then interprets the remaining digits using the country's decimal and grouping separators.

### Parameters

| Name      | Type          | Description                                          |
| --------- | ------------- | ---------------------------------------------------- |
| `value`   | `string`      | A locale-formatted string (e.g. `'R$ 1.999,99'`)     |
| `country` | `CountryCode` | Country that defines the decimal/grouping separators |

### Returns

A new `MoneyContract` instance.

### Throws

| Error                      | Condition                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `InvalidInputError`        | `value` is not a `string`, cannot be parsed, or contains multiple decimal separators |
| `UnsupportedCurrencyError` | `country` is not a supported code                                                    |

### Examples

```ts
import { parse } from '@eriveltondasilva/currency'

parse('R$ 1.999,99', 'BR').amount()  // => 1999.99
parse('$1,999.99', 'US').amount()    // => 1999.99
parse('€ 1.999,99', 'DE').amount()   // => 1999.99
parse('1 999,99 €', 'FR').amount()   // => 1999.99
parse("CHF 1'999.99", 'CH').amount() // => 1999.99
```

```ts
// Currency symbols and whitespace are stripped automatically
parse('BRL 19,99', 'BR').amount() // => 19.99
parse('19,99', 'BR').amount()     // => 19.99
```

```ts
// Signed values are supported
parse('-$50.00', 'US').amount() // => -50
parse('+$50.00', 'US').amount() // => 50
```

::: warning Separator mismatch
`parse` uses the separators defined by `country`. Passing a string formatted for a different country will produce unexpected results or throw.

```ts
// 'BR' uses ',' as decimal — '.' is the grouping separator
parse('1.999,99', 'BR').amount() // => 1999.99 ✅

// '.' is stripped as a grouping separator — ',' in '999.99' becomes the decimal
parse('1,999.99', 'BR').amount() // => 2.00 ⚠️  not 1999.99

// Ambiguous: '1.999' in BR context reads as 1999 (grouped), not 1.999
parse('1.999', 'BR').amount() // => 1999 ⚠️  not 1.999
```

When in doubt, use `from` with a raw number.
:::

## fromMinorUnits

Creates a `MoneyContract` directly from an integer in minor units.

Use this when the value is already in minor units — for example, when reconstructing from a database column or a `toJSON()` payload.

```ts
function fromMinorUnits(value: number, country: CountryCode): MoneyContract
```

### Parameters

| Name      | Type          | Description                                         |
| --------- | ------------- | --------------------------------------------------- |
| `value`   | `number`      | Integer minor-unit value (e.g. `1999` for R$ 19,99) |
| `country` | `CountryCode` | Supported country code                              |

### Returns

A new `MoneyContract` instance.

### Throws

| Error                      | Condition                                 |
| -------------------------- | ----------------------------------------- |
| `InvalidInputError`        | `value` is not a finite integer           |
| `UnsafeIntegerError`       | `value` exceeds `Number.MAX_SAFE_INTEGER` |
| `UnsupportedCurrencyError` | `country` is not a supported code         |

### Examples

```ts
import { fromMinorUnits } from '@eriveltondasilva/currency'

fromMinorUnits(1999, 'BR').amount() // => 19.99
fromMinorUnits(1999, 'BR').format() // => 'R$ 19,99'

fromMinorUnits(500, 'JP').amount()  // => 500 (JPY has 0 fraction digits)
fromMinorUnits(500, 'US').amount()  // => 5   (USD has 2 fraction digits)
```

```ts
// Round-tripping from toJSON()
const json = from(19.99, 'BR').toJSON()
// => { minorUnits: 1999, currencyCode: 'BRL' }

const restored = fromMinorUnits(json.minorUnits, 'BR')
restored.format() // => 'R$ 19,99'
```

```ts
// Floats are rejected — minor units must be an integer
fromMinorUnits(19.99, 'US') // ❌ InvalidInputError — value must be an integer
```

## zero

Creates a `MoneyContract` with an amount of zero for the given country.

Useful as an identity value for reductions, a neutral starting point for accumulation, or an explicit empty state.

```ts
function zero(country: CountryCode): MoneyContract
```

### Parameters

| Name      | Type          | Description            |
| --------- | ------------- | ---------------------- |
| `country` | `CountryCode` | Supported country code |

### Returns

A new `MoneyContract` with `minorUnits === 0`.

### Throws

| Error                      | Condition                         |
| -------------------------- | --------------------------------- |
| `UnsupportedCurrencyError` | `country` is not a supported code |

### Examples

```ts
import { zero } from '@eriveltondasilva/currency'

zero('BR').isZero()       // => true
zero('BR').format()       // => 'R$ 0,00'
zero('US').currencyCode() // => 'USD'
zero('JP').format()       // => '¥0'
```

```ts
// As an accumulator identity value
const total = items.reduce(
  (acc, item) => acc.plus(item.price),
  zero('US'),
)
```

## Presets

For single-currency applications, country-specific preset functions offer a more concise alternative to `from` and `parse`.

```ts
import { br, us, de, jp, ... } from '@eriveltondasilva/currency/presets'
```

Each preset accepts either a `number` (major units) or a `string` (locale-formatted):

```ts
br(19.99).format()   // => 'R$ 19,99'
us(9.99).format()    // => '$9.99'
de(1999.99).format() // => '1.999,99 €'
jp(500).format()     // => '¥500'

// String input follows the same rules as parse()
br('R$ 1.999,99').amount() // => 1999.99
us('$9.99').amount()       // => 9.99
```

**All available [Presets](presets.md)**