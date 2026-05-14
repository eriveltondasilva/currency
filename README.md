# Currency

[![npm version](https://img.shields.io/npm/v/@eriveltondasilva/currency)](https://www.npmjs.com/package/@eriveltondasilva/currency)
[![npm package minimized gzipped size (scoped)](https://img.shields.io/bundlejs/size/%40eriveltondasilva/currency?format=both)](https://www.npmjs.com/package/@eriveltondasilva/currency)
[![Pull Request](https://github.com/eriveltondasilva/currency/actions/workflows/pull-request.yml/badge.svg)](https://github.com/eriveltondasilva/currency/actions/workflows/pull-request.yml)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?logo=biome)](https://biomejs.dev)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue)](https://www.npmjs.com/package/@eriveltondasilva/currency)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight TypeScript library for precise monetary operations. All values are stored internally as **minor-unit integers** to eliminate floating-point errors. Every operation returns a new instance — the API is fully immutable.

### Features

- 💰 **Precise calculations** — integer-based math eliminates floating-point errors
- 🔒 **Immutable API** — every operation returns a new instance
- 🌍 **Internationalization** — formatting support for 14 countries and 100+ locales
- 🧮 **Business operations** — discounts, surcharges, allocations, and more
- 📦 **Zero dependencies** — lightweight and focused (< 5KB min+gzip)
- 🎯 **Type-safe** — full TypeScript support with comprehensive type definitions

### Quick Start

#### Installation

```bash
npm install @eriveltondasilva/currency
```

```bash
bun add @eriveltondasilva/currency
```

#### Import

```typescript
// Named imports (recommended — better tree-shaking)
import { from, parse, sum, total, isMoney, ... } from '@eriveltondasilva/currency'

// Default namespace
import Money from '@eriveltondasilva/currency'

// Country presets
import { br, us, ... } from '@eriveltondasilva/currency/presets'

// Types
import type { MoneyContract, MoneyInput, FormatOptions, RoundingMode, PricedItem } from '@eriveltondasilva/currency'
```

#### Basic Usage

```typescript
// Create instances
const price = from(19.99, 'BR')
price.format()     // => 'R$ 19,99'
price.amount()     // => 19.99
price.minorUnits() // => 1999

// Arithmetic (all return new instances)
price.plus(5).format()     // => 'R$ 24,99'
price.minus(4.99).format() // => 'R$ 15,00'
price.times(2).format()    // => 'R$ 39,98'
price.divide(2).format()   // => 'R$ 10,00'

// Business operations
price.applyDiscount(10).format() // => 'R$ 17,99'  (10% off)
price.applySurcharge(5).format() // => 'R$ 20,99'  (5% added)
price.percentOf(15).format()     // => 'R$ 3,00'   (15% of price)

// Comparison
price.equals(19.99)     // => true
price.greaterThan(10)   // => true
price.isBetween(10, 50) // => true

// Allocation (largest-remainder method)
from(10, 'BR').allocate(3).map((m) => m.amount())
// => [3.34, 3.33, 3.33]

from(100, 'US').allocateByRatio([1, 3]).map((m) => m.amount())
// => [25, 75]
```

#### Collection Functions

```typescript
import { sum, average, max, min, clamp } from '@eriveltondasilva/currency'

sum([10, 20.50, 5], 'BR').format()   // => 'R$ 35,50'
average([10, 20, 30], 'US').format() // => '$20.00'
max([5, 30, 10], 'US').format()      // => '$30.00'
min([5, 30, 10], 'US').format()      // => '$5.00'
clamp(150, 0, 100, 'US').format()    // => '$100.00'
```

#### Business Functions

```typescript
import { total, percent } from '@eriveltondasilva/currency'

const items = [
  { price: 9.99, quantity: 3 },
  { price: 4.99 },
]
total(items, 'US').format() // => '$34.96'

percent(25, 200, 'US') // => 12.5  (25 is 12.5% of 200)
```

#### Country Presets

```typescript
import { br, us, de, jp } from '@eriveltondasilva/currency/presets'

// Accepts number (major units) or locale-formatted string
br(19.99).format()          // => 'R$ 19,99'
us(19.99).format()          // => '$19.99'

br('R$ 1.999,99').amount()  // => 1999.99
us('$1,999.99').amount()    // => 1999.99

de(1500).format()           // => '1.500,00 €'
jp(500).format()            // => '¥500'
```

#### Formatting

```typescript
const price = from(1999.9, 'BR')

price.format()                                    // => 'R$ 1.999,90'
price.format({ currencyDisplay: 'code' })         // => 'BRL 1.999,90'
price.format({ currencyDisplay: 'none' })         // => '1.999,90'
price.format({ notation: 'compact' })             // => 'R$ 2 mil'
price.format({ signDisplay: 'always' })           // => '+R$ 1.999,90'
price.format({ currencySign: 'accounting' })      // => 'R$ 1.999,90'
```

#### Serialization

```typescript
const price = from(19.99, 'BR')

// JSON round-trip
const json = price.toJSON()
// => { minorUnits: 1999, currencyCode: 'BRL' }

const restored = fromMinorUnits(json.minorUnits, 'BR')
restored.equals(price)  // => true

// String output
price.toString()  // => '19.99'
price.format()    // => 'R$ 19,99'
```

#### Error Handling

```typescript
import { from, MoneyError, CurrencyMismatchError } from '@eriveltondasilva/currency'

try {
  from(10, 'BR').plus(from(10, 'US'))
} catch (err) {
  if (err instanceof MoneyError) {
    console.error(err.code)     // => 'CURRENCY_MISMATCH'
    console.error(err.message)  // => 'Cannot operate on mismatched currencies: BRL and USD.'
  }
}
```

All errors extend `MoneyError` and expose a `code` property for programmatic handling:

| Error                      | Code                     |
| -------------------------- | ------------------------ |
| `InvalidInputError`        | `'INVALID_INPUT'`        |
| `InvalidPercentageError`   | `'INVALID_PERCENTAGE'`   |
| `DivisionByZeroError`      | `'DIVISION_BY_ZERO'`     |
| `InvalidAllocationError`   | `'INVALID_ALLOCATION'`   |
| `InvalidRangeError`        | `'INVALID_RANGE'`        |
| `CurrencyMismatchError`    | `'CURRENCY_MISMATCH'`    |
| `UnsupportedCurrencyError` | `'UNSUPPORTED_CURRENCY'` |
| `UnsafeIntegerError`       | `'UNSAFE_INTEGER'`       |

### Supported Countries

| Code | Country        | Currency |
| ---- | -------------- | -------- |
| `AU` | Australia      | AUD      |
| `BR` | Brazil         | BRL      |
| `CA` | Canada         | CAD      |
| `CH` | Switzerland    | CHF      |
| `CN` | China          | CNY      |
| `DE` | Germany        | EUR      |
| `FR` | France         | EUR      |
| `GB` | United Kingdom | GBP      |
| `IN` | India          | INR      |
| `JP` | Japan          | JPY      |
| `MX` | Mexico         | MXN      |
| `PT` | Portugal       | EUR      |
| `SG` | Singapore      | SGD      |
| `US` | United States  | USD      |

### Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes in each release.

### Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

### License

MIT © [Erivelton Silva](https://github.com/eriveltondasilva)
