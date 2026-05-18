---
layout: home

hero:
  name: "Currency"
  tagline: "Immutable, float-safe, and tree-shakeable. Built on minor-unit integers."
  image: "/money-bag.png"

  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/creation

features:
  - icon: 🎯
    title: Float-safe by design
    details: All values are stored as minor-unit integers internally. No floating-point rounding errors — ever.

  - icon: 🔒
    title: Fully immutable
    details: Every operation returns a new instance. Safe to reuse, share, and compose without side effects.

  - icon: 🌍
    title: 25 countries out of the box
    details: Correct locale, separators, and fraction digits for BR, US, JP, DE, and more. <a href="/currency/reference/supported-countries">See all →</a>

  - icon: 🌲
    title: Tree-shakeable
    details: Import only what you use. Named exports ensure unused functions are excluded from your bundle.

  - icon: 🛡️
    title: Typed errors
    details: Every failure throws a typed MoneyError subclass with a machine-readable code. No silent failures.

  - icon: ⚡
    title: Zero dependencies
    details: Lightweight and self-contained. Formatting is powered by the native Intl.NumberFormat API.
---

## Quick look

```ts
import { from, sum, total } from '@eriveltondasilva/currency'

// Create
const price = from(19.99, 'BR')
price.format() // => 'R$ 19,99'
price.applyDiscount(10).format() // => 'R$ 17,99'

// Collect
sum([10, 20, 30], 'US').format() // => '$60.00'

// Business
const items = [
  { price: 9.99, quantity: 3 },
  { price: 4.99 },
]
total(items, 'US').format() // => '$34.96'
```
