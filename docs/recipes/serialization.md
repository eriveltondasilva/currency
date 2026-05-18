# Serialization

Persisting monetary values to a database and restoring them without precision loss.

## The core rule

**Always store `minorUnits` (integer), never `amount` (float).**

Floating-point numbers are unreliable across serialization boundaries — a value like `19.99` may not survive a round-trip through JSON, a database, or a message queue with perfect fidelity. Integers always do.

```ts
import { from } from '@eriveltondasilva/currency'

const price = from(19.99, 'BR')

// ✅ Store this
price.minorUnits()  // => 1999  (safe integer)

// ❌ Never this
price.amount()      // => 19.99  (float — may lose precision)
```

## toJSON and fromMinorUnits

`toJSON()` produces a plain object with `minorUnits` and `currencyCode`. Use `fromMinorUnits()` to restore it.

```ts
import { from, fromMinorUnits } from '@eriveltondasilva/currency'

// Serialize
const price = from(19.99, 'BR')
const payload = price.toJSON()
// => { minorUnits: 1999, currencyCode: 'BRL' }

// Restore
const restored = fromMinorUnits(payload.minorUnits, 'BR')
restored.format()         // => 'R$ 19,99'
restored.equals(price)    // => true
```

`JSON.stringify` calls `toJSON` automatically:

```ts
const product = { name: 'Keyboard', price: from(349.90, 'BR') }

JSON.stringify(product)
// => '{"name":"Keyboard","price":{"minorUnits":34990,"currencyCode":"BRL"}}'
```

## Database storage

### Recommended schema

Store `minorUnits` as an integer column and `currencyCode` (or `countryCode`) alongside it:

```sql
-- PostgreSQL
CREATE TABLE products (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  price_minor     INTEGER NOT NULL,   -- e.g. 1999 for R$ 19,99
  price_currency  CHAR(3) NOT NULL    -- ISO 4217 code, e.g. 'BRL'
);
```

### Writing

```ts
import { from } from '@eriveltondasilva/currency'

async function createProduct(name: string, price: number, country: 'BR' | 'US') {
  const money = from(price, country)
  const { minorUnits, currencyCode } = money.toJSON()

  await db.product.create({
    data: {
      name,
      price_minor: minorUnits,
      price_currency: currencyCode,
    },
  })
}

await createProduct('Keyboard', 349.90, 'BR')
// Stores: price_minor = 34990, price_currency = 'BRL'
```

### Reading

```ts
import { fromMinorUnits } from '@eriveltondasilva/currency'

// Map CurrencyCode → CountryCode for your supported currencies
const CURRENCY_TO_COUNTRY: Record<string, 'BR' | 'US' | 'GB' | 'DE' | 'JP'> = {
  BRL: 'BR',
  USD: 'US',
  GBP: 'GB',
  EUR: 'DE',  // choose the country whose locale you want for formatting
  JPY: 'JP',
}

async function getProduct(id: number) {
  const row = await db.product.findUniqueOrThrow({ where: { id } })
  const country = CURRENCY_TO_COUNTRY[row.price_currency]

  if (!country) {
    throw new Error(`Unsupported currency in database: ${row.price_currency}`)
  }

  return {
    name: row.name,
    price: fromMinorUnits(row.price_minor, country),
  }
}

const product = await getProduct(1)
product.price.format()  // => 'R$ 349,90'
```

## The CurrencyCode → CountryCode mapping

`toJSON()` stores `currencyCode` (e.g. `'BRL'`), but `fromMinorUnits` requires a `CountryCode` (e.g. `'BR'`). You own this mapping.

**When multiple countries share the same currency (e.g. EUR), store the country code too:**

```sql
-- EUR is used by DE, FR, PT — you need to know which locale to restore with
ALTER TABLE products
  ADD COLUMN price_country CHAR(2);  -- e.g. 'DE', 'FR', 'PT'
```

```ts
async function createProduct(name: string, price: number, country: CountryCode) {
  const money = from(price, country)
  const { minorUnits, currencyCode } = money.toJSON()

  await db.product.create({
    data: {
      name,
      price_minor:    minorUnits,
      price_currency: currencyCode,
      price_country:  country,       // store 'DE', not just 'EUR'
    },
  })
}
```

```ts
async function getProduct(id: number) {
  const row = await db.product.findUniqueOrThrow({ where: { id } })

  return {
    name:  row.name,
    price: fromMinorUnits(row.price_minor, row.price_country as CountryCode),
  }
}
```

## API responses

When sending monetary values over an API, serialize the `MoneyJSON` shape and restore on the receiving end:

```ts
// Server — serializing the response
app.get('/products/:id', async (req, res) => {
  const product = await getProduct(Number(req.params.id))

  res.json({
    name:  product.name,
    price: product.price.toJSON(),  // { minorUnits, currencyCode }
  })
})
```

```ts
// Client — restoring from the response
const response = await fetch('/products/1').then(r => r.json())

const price = fromMinorUnits(response.price.minorUnits, 'BR')
price.format()  // => 'R$ 349,90'
```
