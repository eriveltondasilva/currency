# Supported Countries

The library is addressed by **country code**, not currency code. Each country code resolves to a currency, locale, and separator configuration used for parsing and formatting.

See [CountryCode vs CurrencyCode](/guide/concepts#countrycode-vs-currencycode) for the rationale behind this design.

## Country table

| Country Code | Country              | Currency Code | Currency               | Locale   | Decimal | Grouping |
| :----------: | -------------------- | :-----------: | ---------------------- | :------: | :-----: | :------: |
|     `AE`     | United Arab Emirates |     `AED`     | UAE Dirham             | `ar-AE`  |   `.`   |   `,`    |
|     `AR`     | Argentina            |     `ARS`     | Argentine Peso         | `es-AR`  |   `,`   |   `.`    |
|     `AU`     | Australia            |     `AUD`     | Australian Dollar      | `en-AU`  |   `.`   |   `,`    |
|     `BR`     | Brazil               |     `BRL`     | Brazilian Real         | `pt-BR`  |   `,`   |   `.`    |
|     `CA`     | Canada               |     `CAD`     | Canadian Dollar        | `en-CA`  |   `.`   |   `,`    |
|     `CH`     | Switzerland          |     `CHF`     | Swiss Franc            | `de-CH`  |   `.`   |   `'`    |
|     `CL`     | Chile                |     `CLP`     | Chilean Peso           | `es-CL`  |   `,`   |   `.`    |
|     `CN`     | China                |     `CNY`     | Chinese Yuan           | `zh-CN`  |   `.`   |   `,`    |
|     `CO`     | Colombia             |     `COP`     | Colombian Peso         | `es-CO`  |   `,`   |   `.`    |
|     `DE`     | Germany              |     `EUR`     | Euro                   | `de-DE`  |   `,`   |   `.`    |
|     `FR`     | France               |     `EUR`     | Euro                   | `fr-FR`  |   `,`   |   ` `    |
|     `GB`     | United Kingdom       |     `GBP`     | British Pound          | `en-GB`  |   `.`   |   `,`    |
|     `IN`     | India                |     `INR`     | Indian Rupee           | `en-IN`  |   `.`   |   `,`    |
|     `JP`     | Japan                |     `JPY`     | Japanese Yen           | `ja-JP`  |   `.`   |   `,`    |
|     `KR`     | South Korea          |     `KRW`     | South Korean Won       | `ko-KR`  |   `.`   |   `,`    |
|     `MX`     | Mexico               |     `MXN`     | Mexican Peso           | `es-MX`  |   `.`   |   `,`    |
|     `NO`     | Norway               |     `NOK`     | Norwegian Krone        | `nb-NO`  |   `,`   |   ` `    |
|     `NZ`     | New Zealand          |     `NZD`     | New Zealand Dollar     | `en-NZ`  |   `.`   |   `,`    |
|     `PT`     | Portugal             |     `EUR`     | Euro                   | `pt-PT`  |   `,`   |   `.`    |
|     `RU`     | Russia               |     `RUB`     | Russian Ruble          | `ru-RU`  |   `,`   |   ` `    |
|     `SA`     | Saudi Arabia         |     `SAR`     | Saudi Riyal            | `ar-SA`  |   `.`   |   `,`    |
|     `SE`     | Sweden               |     `SEK`     | Swedish Krona          | `sv-SE`  |   `,`   |   ` `    |
|     `SG`     | Singapore            |     `SGD`     | Singapore Dollar       | `en-SG`  |   `.`   |   `,`    |
|     `US`     | United States        |     `USD`     | US Dollar              | `en-US`  |   `.`   |   `,`    |
|     `ZA`     | South Africa         |     `ZAR`     | South African Rand     | `en-ZA`  |   `.`   |   `,`    |

## Notes

### Currencies shared across countries

`EUR` is used by three supported countries. Each has a distinct locale and separator configuration, which affects both formatting output and string parsing:

```ts
import { from } from '@eriveltondasilva/currency'

from(1999.99, 'DE').format() // => '1.999,99 €' (de-DE)
from(1999.99, 'FR').format() // => '1 999,99 €' (fr-FR — narrow space as grouping)
from(1999.99, 'PT').format() // => '1.999,99 €' (pt-PT)
```

All three return `'EUR'` from `currencyCode()` and `2` fraction digits — but locale-aware operations like `format()` and `parse()` behave differently. Choose the country that matches your users' locale, not just the currency.

### Zero fraction digits — JPY, CLP, COP, KRW

Some currencies have `0` fraction digits, meaning the minor unit equals the major unit and there are no subunits.

| Country Code | Currency | fractionDigits |
| :----------: | :------: | :------------: |
|     `JP`     |  `JPY`   |      `0`       |
|     `CL`     |  `CLP`   |      `0`       |
|     `CO`     |  `COP`   |      `0`       |
|     `KR`     |  `KRW`   |      `0`       |

```ts
from(500, 'JP').amount()     // => 500
from(500, 'JP').minorUnits() // => 500  (same value)
from(500, 'JP').subunits()   // => 0
from(500, 'JP').format()     // => '¥500'

from(5000, 'CL').format()    // => '$5.000'
from(5000, 'KR').format()    // => '₩5,000'
```

This also affects `round()` — steps smaller than `1` cannot be represented:

```ts
from(500, 'JP').round(50).amount()  // => 500  ✅
from(500, 'JP').round(0.5).amount() // ❌ InvalidInputError
```

### Switzerland (CHF) — apostrophe as grouping separator

Switzerland uses an apostrophe (`'`) as the thousands separator, which is uncommon and can cause issues in environments that do not handle it correctly.

```ts
from(1999.99, 'CH').format()         // => "CHF 1'999.99"
parse("CHF 1'999.90", 'CH').amount() // => 1999.9
```

### India (INR) — South Asian grouping

India uses a non-standard grouping convention: the first group from the right contains three digits, and subsequent groups contain two digits (e.g. `1,00,00,000` for ten million).

```ts
from(1000000, 'IN').format() // => '₹10,00,000.00'
```

### The `ind` preset

Because `in` is a reserved keyword in JavaScript, the India preset is exported as `ind`:

```ts
import { ind } from '@eriveltondasilva/currency/presets'

ind(1999.99).format() // => '₹1,999.99'
```

## Resolving currency details at runtime

Use `currencyCode()` and `locale()` to inspect the resolved currency information of any instance:

```ts
import { from } from '@eriveltondasilva/currency'

const price = from(100, 'BR')

price.currencyCode() // => 'BRL'
price.locale()       // => 'pt-BR'
```

## Requesting additional countries

The library currently supports 25 country codes. If you need a country that is not listed, please open an issue on the [GitHub repository](https://github.com/eriveltondasilva/currency).