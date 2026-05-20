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
- 🌍 **Internationalization** — formatting support for 25 countries and 100+ locales
- 🧮 **Business operations** — discounts, surcharges, allocations, and more
- 📦 **Zero dependencies** — lightweight and focused (< 5KB min+gzip)
- 🎯 **Type-safe** — full TypeScript support with comprehensive type definitions

---

### Quick Start

#### Installation

```bash
npm install @eriveltondasilva/currency
```

```bash
bun add @eriveltondasilva/currency
```

```bash
pnpm add @eriveltondasilva/currency
```

#### Import

```typescript
// Named imports (recommended — better tree-shaking)
import { from, sum, total } from '@eriveltondasilva/currency'

// Default namespace
import Money from '@eriveltondasilva/currency'

// Country presets
import { br, us } from '@eriveltondasilva/currency/presets'
```

#### Basic Usage

```typescript
// Create instances
const price = from(19.99, 'BR')

price.format()     // => 'R$ 19,99'
price.amount()     // => 19.99
price.minorUnits() // => 1999
```

```typescript
// Arithmetic — all return new instances
price.plus(5).format()     // => 'R$ 24,99'
price.minus(4.99).format() // => 'R$ 15,00'
price.times(2).format()    // => 'R$ 39,98'
price.divide(2).format()   // => 'R$ 10,00'
```

> [!NOTE]
> Rounding happens at the input boundary, not on the result. `from(0.015, 'BR')` stores `R$ 0,02` — the smallest representable unit in BRL. Summing two such values produces `R$ 0,04`, not `R$ 0,03`. See [Precision Model](https://eriveltondasilva.github.io/currency/guide/precision) for the full explanation.

```typescript
// Business operations
price.applyDiscount(10).format() // => 'R$ 17,99'  (10% off)
price.applySurcharge(5).format() // => 'R$ 20,99'  (5% added)
price.percentOf(15).format()     // => 'R$ 3,00'   (15% of price)
```

```typescript
// Comparison
price.equals(19.99)     // => true
price.greaterThan(10)   // => true
price.isBetween(10, 50) // => true
```

```typescript
// Allocation — largest-remainder method, sum always exact
from(10, 'BR').allocate(3).map((m) => m.amount())
// => [3.34, 3.33, 3.33]
from(100, 'US').allocateByRatio([1, 3]).map((m) => m.amount())
// => [25, 75]
```

```typescript
// Collections
import { sum, average, min, max, clamp, total } from '@eriveltondasilva/currency'

sum([10, 20.50, 5], 'BR').format()   // => 'R$ 35,50'
average([10, 20, 30], 'US').format() // => '$20.00'

const items = [{ price: 9.99, quantity: 3 }, { price: 4.99 }]
total(items, 'US').format() // => '$34.96'
```

```typescript
// Presets — useful for single-currency apps
import { br, us } from '@eriveltondasilva/currency/presets'

br(19.99).format()         // => 'R$ 19,99'
br('R$ 1.999,99').amount() // => 1999.99
```

---

### Supported Countries

#### Americas

| Country         | Code  |
| :-------------- | :---: |
| 🇦🇷 Argentina     | `AR`  |
| 🇧🇷 Brazil        | `BR`  |
| 🇨🇦 Canada        | `CA`  |
| 🇨🇱 Chile         | `CL`  |
| 🇨🇴 Colombia      | `CO`  |
| 🇲🇽 Mexico        | `MX`  |
| 🇺🇸 United States | `US`  |

#### Europe

| Country          | Code  |
| :--------------- | :---: |
| 🇨🇭 Switzerland    | `CH`  |
| 🇩🇪 Germany        | `DE`  |
| 🇫🇷 France         | `FR`  |
| 🇬🇧 United Kingdom | `GB`  |
| 🇳🇴 Norway         | `NO`  |
| 🇵🇹 Portugal       | `PT`  |
| 🇷🇺 Russia         | `RU`  |
| 🇸🇪 Sweden         | `SE`  |

#### Asia

| Country                | Code  |
| :--------------------- | :---: |
| 🇨🇳 China                | `CN`  |
| 🇮🇳 India                | `IN`  |
| 🇯🇵 Japan                | `JP`  |
| 🇰🇷 South Korea          | `KR`  |
| 🇸🇦 Saudi Arabia         | `SA`  |
| 🇦🇪 United Arab Emirates | `AE`  |
| 🇸🇬 Singapore            | `SG`  |

#### Oceania & Africa

| Country        | Code  |
| :------------- | :---: |
| 🇦🇺 Australia    | `AU`  |
| 🇳🇿 New Zealand  | `NZ`  |
| 🇿🇦 South Africa | `ZA`  |

---

### Documentation

Full API reference, guides, and recipes at [eriveltondasilva.github.io/currency](https://eriveltondasilva.github.io/currency).

---

### Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes in each release.

---

### Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

---

### License

MIT © [Erivelton Silva](https://github.com/eriveltondasilva)

---

### Inspired by

@see https://github.com/scurker/currency.js
