<p align="center">
 <img width="100px" src="https://raw.githubusercontent.com/TPN-Labs/keez-node/main/.github/images/favicon512x512-npm.png" align="center" alt=":package: keez-node" />
 <h2 align="center">📦 keez-invocing</h2>
 <p align="center">🚀 A simple npm package for invoicing that wraps around Keez API.</p>
</p>

# Keez wrapper using Node

[![npm dm](https://img.shields.io/npm/dm/keez-invocing)](https://www.npmjs.com/package/keez-invoicing)
[![npm dt](https://img.shields.io/npm/dt/keez-invocing)](https://www.npmjs.com/package/keez-invoicing)

## Getting started

Please consult [Keez API documentation](https://app.keez.ro/help/api/content.html) for more information on how to use the API.

### Installation

```bash
npm install keez-invocing
```

## Configuration

### Constructor Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `application_id` | `string` | Yes | Application ID from Keez |
| `client_eid` | `string` | Yes | Client entity ID |
| `secret` | `string` | Yes | API secret |
| `live` | `boolean` | Yes | `true` for production (`app.keez.ro`), `false` for staging (`staging.keez.ro`) |

### Initialization

```ts
import { KeezApi } from 'keez-invocing';

const keezApi = new KeezApi({
    application_id: 'KEEZ_APPLICATION_ID',
    client_eid: 'KEEZ_CLIENT_ID',
    secret: 'KEEZ_SECRET',
    live: true, // false for staging environment
});
```

## API Reference

### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getAllInvoices()` | none | `Promise<AllInvoicesResponse>` | Get all invoices |
| `getInvoiceByExternalId(id)` | `string` | `Promise<InvoiceResponse>` | Get invoice by external ID |
| `createInvoice(params)` | `InvoiceRequest` | `Promise<string>` | Create invoice, returns external ID |
| `sendInvoice(email, id)` | `string, string` | `Promise<string>` | Send invoice via email |
| `validateInvoice(id)` | `string` | `Promise<string>` | Validate an invoice |

### PaymentType Enum

| Value | Name | Description |
|-------|------|-------------|
| `1` | `CASH` | Cash payment with fiscal receipt |
| `2` | `CARD` | Card payment with fiscal receipt |
| `3` | `BANK_TRANSFER` | Invoice paid via bank transfer |
| `4` | `CASH_RECEIPT` | Cash payment with receipt |
| `5` | `CASH_ON_DELIVERY` | Cash on delivery |
| `6` | `CARD_ONLINE` | Online card payment |
| `7` | `CARD_PLATFORMS` | Payment via distribution platforms (e.g., Emag) |
| `8` | `HOLIDAY_VOUCHER_CARD` | Holiday voucher payment (card) |
| `9` | `HOLIDAY_VOUCHER_TICKET` | Holiday voucher payment (ticket) |
| `10` | `MEAL_VOUCHER` | Meal voucher payment |

## TypeScript Types

All types are exported from the main package:

```ts
import {
    KeezApi,
    PaymentType,
    // Request types
    InvoiceRequest,
    Partner,
    // Response types
    InvoiceResponse,
    Item,
    AllInvoicesResponse,
    ShortInvoiceResponse,
    AuthResponse,
    // Error classes
    KeezError,
    KeezAuthError,
    KeezApiError,
} from 'keez-invocing';
```

### InvoiceRequest

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `series` | `string` | Yes | Invoice series |
| `currencyCode` | `string` | Yes | Currency code (e.g., 'RON') |
| `amount` | `number` | Yes | Invoice amount |
| `paymentType` | `PaymentType` | Yes | Payment type |
| `partner` | `Partner` | Yes | Partner/client details |
| `itemId` | `string` | Yes | Item external ID |
| `documentDate` | `number` | No | Document date (timestamp) |
| `dueDate` | `number` | No | Due date (timestamp) |
| `measureUnitId` | `number` | No | Measure unit ID |
| `quantity` | `number` | No | Quantity |
| `vatOnCollection` | `boolean` | No | VAT on collection |

### Partner

| Property | Type | Description |
|----------|------|-------------|
| `partnerName` | `string` | Partner/client name |
| `isLegalPerson` | `boolean` | Is legal entity |
| `identificationNumber` | `string` | ID number (CNP/CUI) |
| `countryCode` | `string` | Country code (e.g., 'RO') |
| `countryName` | `string` | Country name |
| `countyCode` | `string` | County code (e.g., 'RO.B') |
| `countyName` | `string` | County name |
| `cityName` | `string` | City name |
| `addressDetails` | `string` | Full address |

### Error Classes

| Class | Description |
|-------|-------------|
| `KeezError` | Base error class with `statusCode` and `originalError` properties |
| `KeezAuthError` | Authentication errors (extends `KeezError`) |
| `KeezApiError` | API request errors (extends `KeezError`) |

## Examples

### Getting all invoices

```ts
const invoices = await keezApi.getAllInvoices();
console.log(`Total invoices: ${invoices.recordsCount}`);
invoices.data.forEach(invoice => {
    console.log(`${invoice.series}-${invoice.number}: ${invoice.grossAmount} ${invoice.currencyCode}`);
});
```

### Getting invoice by ID

```ts
const invoice = await keezApi.getInvoiceByExternalId('invoice-external-id');
console.log(`Invoice: ${invoice.series}-${invoice.number}`);
console.log(`Status: ${invoice.status}`);
console.log(`Amount: ${invoice.grossAmount} ${invoice.currencyCode}`);
```

### Creating an invoice

```ts
import { KeezApi, PaymentType } from 'keez-invocing';

const result = await keezApi.createInvoice({
    amount: 400,
    currencyCode: 'RON',
    itemId: 'KEEZ_ITEM_ID',
    partner: {
        isLegalPerson: false,
        partnerName: 'John Doe',
        countryName: 'Romania',
        countryCode: 'RO',
        countyCode: 'RO.B',
        countyName: 'Bucuresti',
        addressDetails: 'Str. Comerciala nr. 4',
        cityName: 'Bucharest',
        identificationNumber: '1234',
    },
    paymentType: PaymentType.MEAL_VOUCHER,
    series: 'exampleSeries',
});
console.log(`Created invoice with external ID: ${result}`);
```

### Sending invoice via email

```ts
const result = await keezApi.sendInvoice('client@example.com', 'invoice-external-id');
console.log(result);
```

### Validating an invoice

```ts
const result = await keezApi.validateInvoice('invoice-external-id');
console.log(result);
```

### Error handling

```ts
import { KeezApi, KeezAuthError, KeezApiError } from 'keez-invocing';

try {
    const invoices = await keezApi.getAllInvoices();
} catch (error) {
    if (error instanceof KeezAuthError) {
        console.error('Authentication failed:', error.message);
    } else if (error instanceof KeezApiError) {
        console.error('API error:', error.message, 'Status:', error.statusCode);
    } else {
        throw error;
    }
}
```

## Contributing

Contributions, issues and feature requests are welcome!

## License

Copyright © 2023 - 2026 [TPN LABS](https://tpn-labs.com) - All rights reserved. This project is [MIT](LICENSE) licensed.
