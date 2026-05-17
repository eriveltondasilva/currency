# Sorting

Sorting and ranking arrays of monetary values using `compare()`.

## Basic sorting

`compare()` returns `-1`, `0`, or `1` — making it a direct drop-in for `Array.sort`:

```ts
import { from } from '@eriveltondasilva/currency'
import type { MoneyContract } from '@eriveltondasilva/currency'

const prices = [
  from(30, 'US'),
  from(10, 'US'),
  from(20, 'US'),
  from(5, 'US'),
]

// Ascending
prices.sort((a, b) => a.compare(b))
prices.map(p => p.format())
// => ['$5.00', '$10.00', '$20.00', '$30.00']

// Descending
prices.sort((a, b) => b.compare(a))
prices.map(p => p.format())
// => ['$30.00', '$20.00', '$10.00', '$5.00']
```

## Sorting objects by price

```ts
interface Product {
  name: string
  price: MoneyContract
}

const products: Product[] = [
  { name: 'Mouse Pad',  price: from(49.90, 'BR') },
  { name: 'Keyboard',   price: from(349.90, 'BR') },
  { name: 'USB Cable',  price: from(29.90, 'BR') },
  { name: 'Webcam',     price: from(199.90, 'BR') },
]

// Lowest price first
products.sort((a, b) => a.price.compare(b.price))

products.map(p => `${p.name}: ${p.price.format()}`)
// => [
//   'USB Cable: R$ 29,90',
//   'Mouse Pad: R$ 49,90',
//   'Webcam: R$ 199,90',
//   'Keyboard: R$ 349,90',
// ]
```

## Finding min and max in a list

For arrays, use the top-level `min()` and `max()` functions instead of sorting:

```ts
import { min, max } from '@eriveltondasilva/currency'

const prices = [49.90, 349.90, 29.90, 199.90]

min(prices, 'BR').format()  // => 'R$ 29,90'
max(prices, 'BR').format()  // => 'R$ 349,90'
```

## Ranking with ties

When two prices are equal, `compare()` returns `0`. Use a secondary sort key to produce a stable order:

```ts
interface Offer {
  seller: string
  price: MoneyContract
  rating: number
}

const offers: Offer[] = [
  { seller: 'Store A', price: from(99.90, 'BR'), rating: 4.5 },
  { seller: 'Store B', price: from(89.90, 'BR'), rating: 4.8 },
  { seller: 'Store C', price: from(99.90, 'BR'), rating: 4.9 },
  { seller: 'Store D', price: from(89.90, 'BR'), rating: 4.2 },
]

// Sort by price ascending, then by rating descending on tie
offers.sort((a, b) => {
  const byPrice = a.price.compare(b.price)
  if (byPrice !== 0) return byPrice
  return b.rating - a.rating  // higher rating wins on tie
})

offers.map(o => `${o.seller}: ${o.price.format()} (★${o.rating})`)
// => [
//   'Store B: R$ 89,90 (★4.8)',
//   'Store D: R$ 89,90 (★4.2)',
//   'Store C: R$ 99,90 (★4.9)',
//   'Store A: R$ 99,90 (★4.5)',
// ]
```

## Partitioning by price range

```ts
import { from } from '@eriveltondasilva/currency'

function partitionByPrice(
  products: Product[],
  maxBudget: number,
  country: 'BR' | 'US',
): { affordable: Product[]; expensive: Product[] } {
  const budget = from(maxBudget, country)

  return products.reduce(
    (acc, product) => {
      if (product.price.lessThanOrEqual(budget)) {
        acc.affordable.push(product)
      } else {
        acc.expensive.push(product)
      }
      return acc
    },
    { affordable: [] as Product[], expensive: [] as Product[] },
  )
}

const { affordable, expensive } = partitionByPrice(products, 100, 'BR')

affordable.map(p => p.name)  // => ['Mouse Pad', 'USB Cable']
expensive.map(p => p.name)   // => ['Keyboard', 'Webcam']
```

## Percentile ranking

Finding what percentile a given price sits at within a dataset:

```ts
import { percent } from '@eriveltondasilva/currency'

function pricePercentile(
  target: MoneyContract,
  dataset: MoneyContract[],
): number {
  const below = dataset.filter(p => p.lessThan(target)).length
  return (below / dataset.length) * 100
}

const allPrices = products.map(p => p.price)
const target = from(199.90, 'BR')

pricePercentile(target, allPrices).toFixed(0)  // => '50'
// 50% of products are cheaper than R$ 199,90
```

## Sorting a price history

```ts
interface PricePoint {
  date: Date
  price: MoneyContract
}

const history: PricePoint[] = [
  { date: new Date('2024-03-01'), price: from(349.90, 'BR') },
  { date: new Date('2024-01-01'), price: from(399.90, 'BR') },
  { date: new Date('2024-02-01'), price: from(329.90, 'BR') },
]

// Chronological order
history.sort((a, b) => a.date.getTime() - b.date.getTime())

// Lowest price in history
const lowest = history.reduce((min, point) =>
  point.price.lessThan(min.price) ? point : min
)

lowest.price.format()  // => 'R$ 329,90'
lowest.date            // => 2024-02-01
```
