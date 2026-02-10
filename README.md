<p align="center">
 <img width="100px" src="https://raw.githubusercontent.com/TPN-Labs/keez-node/main/.github/images/favicon512x512-npm.png" align="center" alt=":package: keez-node" />
 <h2 align="center">keez-invoicing</h2>
 <p align="center">A simple npm package for invoicing that wraps around Keez API.</p>
</p>

# Keez wrapper using Node

[![npm dm](https://img.shields.io/npm/dm/keez-invoicing)](https://www.npmjs.com/package/keez-invoicing)
[![npm dt](https://img.shields.io/npm/dt/keez-invoicing)](https://www.npmjs.com/package/keez-invoicing)

## Getting started

Please consult [Keez API documentation](https://app.keez.ro/help/api/content.html) for more information on how to use the API.

### Installation

```bash
npm install keez-invoicing
```

## Configuration

### Constructor Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `applicationId` | `string` | Yes | - | Application ID from Keez |
| `clientEid` | `string` | Yes | - | Client entity ID |
| `secret` | `string` | Yes | - | API secret |
| `live` | `boolean` | Yes | - | `true` for production (`app.keez.ro`), `false` for staging (`staging.keez.ro`) |
| `logger` | `KeezLogger` | No | no-op | Custom logger implementing the `KeezLogger` interface |
| `maxRetries` | `number` | No | `3` | Maximum retries for transient failures (429, 5xx). Set to `0` to disable |

### Initialization

```ts
import { KeezApi } from 'keez-invoicing';

const keezApi = new KeezApi({
    applicationId: 'KEEZ_APPLICATION_ID',
    clientEid: 'KEEZ_CLIENT_ID',
    secret: 'KEEZ_SECRET',
    live: true, // false for staging environment
});
```

### Custom Logger

You can inject any logger that implements the `KeezLogger` interface (`info`, `error`, `warn`, `debug` methods). By default, logging is disabled (no-op).

```ts
import { KeezApi, KeezLogger } from 'keez-invoicing';

const logger: KeezLogger = {
    info: (msg, ...meta) => console.log(msg, ...meta),
    error: (msg, ...meta) => console.error(msg, ...meta),
    warn: (msg, ...meta) => console.warn(msg, ...meta),
    debug: (msg, ...meta) => console.debug(msg, ...meta),
};

const keezApi = new KeezApi({
    applicationId: 'KEEZ_APPLICATION_ID',
    clientEid: 'KEEZ_CLIENT_ID',
    secret: 'KEEZ_SECRET',
    live: true,
    logger,
});
```

### Retry Behavior

Transient failures (HTTP 429, 500, 502, 503, 504, and network errors) are retried automatically with exponential backoff. The default is 3 retries. You can configure or disable this:

```ts
const keezApi = new KeezApi({
    applicationId: 'KEEZ_APPLICATION_ID',
    clientEid: 'KEEZ_CLIENT_ID',
    secret: 'KEEZ_SECRET',
    live: true,
    maxRetries: 5, // or 0 to disable retries
});
```

## API Reference

The SDK provides two equivalent ways to call any method:

```ts
// Flat methods (backward-compatible)
await keezApi.getAllInvoices();
await keezApi.createItem(item);

// Resource-scoped sub-clients
await keezApi.invoices.getAll();
await keezApi.items.create(item);
```

### Invoice Methods

| Flat method | Sub-client method | Parameters | Returns | Description |
|-------------|-------------------|------------|---------|-------------|
| `getAllInvoices(params?)` | `invoices.getAll(params?)` | `InvoiceFilterParams?` | `Promise<AllInvoicesResponse>` | Get all invoices with optional filtering |
| `getInvoiceByExternalId(id)` | `invoices.getById(id)` | `string` | `Promise<InvoiceResponse>` | Get invoice by external ID |
| `createInvoice(params)` | `invoices.create(params)` | `InvoiceRequest \| InvoiceRequestV2` | `Promise<string>` | Create invoice, returns external ID |
| `updateInvoice(id, params)` | `invoices.update(id, params)` | `string, InvoiceRequestV2` | `Promise<void>` | Update an existing invoice |
| `deleteInvoice(id)` | `invoices.delete(id)` | `string` | `Promise<void>` | Delete an invoice |
| `sendInvoice(email, id)` | `invoices.sendEmail(email, id)` | `string, string` | `Promise<string>` | Send invoice via email |
| `sendInvoice(emailParams, id)` | `invoices.sendEmail(emailParams, id)` | `SendInvoiceEmailParams, string` | `Promise<string>` | Send invoice with CC/BCC |
| `validateInvoice(id)` | `invoices.validate(id)` | `string` | `Promise<string>` | Validate an invoice |
| `cancelInvoice(id)` | `invoices.cancel(id)` | `string` | `Promise<void>` | Cancel an invoice |
| `submitInvoiceToEfactura(id)` | `invoices.submitEfactura(id)` | `string` | `Promise<string>` | Submit invoice to eFactura |
| `downloadInvoicePdf(id)` | `invoices.downloadPdf(id)` | `string` | `Promise<Buffer>` | Download invoice as PDF |

### Item Methods

| Flat method | Sub-client method | Parameters | Returns | Description |
|-------------|-------------------|------------|---------|-------------|
| `getAllItems(params?)` | `items.getAll(params?)` | `ItemFilterParams?` | `Promise<AllItemsResponse>` | Get all items with optional filtering |
| `getItemByExternalId(id)` | `items.getById(id)` | `string` | `Promise<ItemResponse>` | Get item by external ID |
| `createItem(item)` | `items.create(item)` | `CreateItemRequest` | `Promise<string>` | Create item, returns external ID |
| `updateItem(id, item)` | `items.update(id, item)` | `string, UpdateItemRequest` | `Promise<void>` | Update an existing item |
| `patchItem(id, item)` | `items.patch(id, item)` | `string, PatchItemRequest` | `Promise<void>` | Partially update an item |

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

### MeasureUnit Enum

| Value | Name | Description |
|-------|------|-------------|
| `1` | `PIECE` | Piece (Bucata) |
| `2` | `KILOGRAM` | Kilogram |
| `3` | `GRAM` | Gram |
| `4` | `LITER` | Liter |
| `5` | `METER` | Meter |
| `6` | `SQUARE_METER` | Square meter |
| `7` | `CUBIC_METER` | Cubic meter |
| `8` | `HOUR` | Hour |
| `9` | `DAY` | Day |
| `10` | `MONTH` | Month |
| `11` | `YEAR` | Year |
| `12` | `SET` | Set |
| `13` | `PACK` | Pack |
| `14` | `BOX` | Box |
| `15` | `SERVICE` | Service |

## TypeScript Types

All types are exported from the main package:

```ts
import {
    KeezApi,
    PaymentType,
    MeasureUnit,
    // Config
    KeezConstructor,
    KeezLogger,
    noopLogger,
    // Request types
    InvoiceRequest,
    InvoiceRequestV2,
    InvoiceLineItem,
    Partner,
    CreateItemRequest,
    UpdateItemRequest,
    PatchItemRequest,
    // Response types
    InvoiceResponse,
    Item,
    AllInvoicesResponse,
    ShortInvoiceResponse,
    ItemResponse,
    AllItemsResponse,
    AuthResponse,
    // Filter types
    InvoiceFilterParams,
    ItemFilterParams,
    PaginationParams,
    SendInvoiceEmailParams,
    // Error classes
    KeezError,
    KeezAuthError,
    KeezApiError,
} from 'keez-invoicing';
```

### InvoiceFilterParams

| Property | Type | Description |
|----------|------|-------------|
| `offset` | `number?` | Pagination offset |
| `count` | `number?` | Number of records to return |
| `status` | `string?` | Filter by invoice status |
| `fromDate` | `number?` | Filter by start date |
| `toDate` | `number?` | Filter by end date |
| `series` | `string?` | Filter by invoice series |
| `partnerName` | `string?` | Filter by partner name |

### ItemFilterParams

| Property | Type | Description |
|----------|------|-------------|
| `offset` | `number?` | Pagination offset |
| `count` | `number?` | Number of records to return |
| `itemName` | `string?` | Filter by item name |
| `itemCode` | `string?` | Filter by item code |
| `isActive` | `boolean?` | Filter by active status |

### SendInvoiceEmailParams

| Property | Type | Description |
|----------|------|-------------|
| `to` | `string` | Primary recipient email |
| `cc` | `string[]?` | CC recipients |
| `bcc` | `string[]?` | BCC recipients |

### CreateItemRequest

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `itemName` | `string` | Yes | Item name |
| `measureUnitId` | `MeasureUnit` | Yes | Measure unit |
| `unitPrice` | `number` | Yes | Unit price |
| `vatPercent` | `number` | Yes | VAT percentage |
| `itemCode` | `string` | No | Item code |
| `itemDescription` | `string` | No | Description |
| `vatCategoryCode` | `string` | No | VAT category code |
| `vatExemptionReason` | `string` | No | VAT exemption reason |
| `isActive` | `boolean` | No | Is active (default: true) |

### InvoiceRequest (v1 -- single item, legacy)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `series` | `string` | Yes | Invoice series |
| `currencyCode` | `string` | Yes | Currency code (e.g., 'RON') |
| `unitPrice` | `number` | Yes | Unit price |
| `paymentType` | `PaymentType` | Yes | Payment type |
| `partner` | `Partner` | Yes | Partner/client details |
| `itemId` | `string` | Yes | Item external ID |
| `vatPercent` | `number` | Yes | VAT percentage |
| `originalNetAmount` | `number` | Yes | Original net amount |
| `originalVatAmount` | `number` | Yes | Original VAT amount |
| `netAmount` | `number` | Yes | Net amount |
| `vatAmount` | `number` | Yes | VAT amount |
| `grossAmount` | `number` | Yes | Gross amount |
| `documentDate` | `number` | No | Document date (YYYYMMDD) |
| `dueDate` | `number` | No | Due date (YYYYMMDD) |
| `measureUnitId` | `number` | No | Measure unit ID |
| `quantity` | `number` | No | Quantity |
| `vatOnCollection` | `boolean` | No | VAT on collection |

### InvoiceRequestV2 (multi-item, recommended)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `series` | `string` | Yes | Invoice series |
| `documentDate` | `number` | Yes | Document date (YYYYMMDD) |
| `dueDate` | `number` | Yes | Due date (YYYYMMDD) |
| `currencyCode` | `string` | Yes | Currency code (e.g., 'RON') |
| `paymentType` | `PaymentType` | Yes | Payment type |
| `partner` | `Partner` | Yes | Partner/client details |
| `items` | `InvoiceLineItem[]` | Yes | Invoice line items |
| `vatOnCollection` | `boolean` | No | VAT on collection |
| `exchangeRate` | `number` | No | Exchange rate |
| `notes` | `string` | No | Invoice notes |

### InvoiceLineItem

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `itemExternalId` | `string` | Yes | Item external ID |
| `measureUnitId` | `number` | Yes | Measure unit ID |
| `quantity` | `number` | Yes | Quantity |
| `unitPrice` | `number` | Yes | Unit price |
| `vatPercent` | `number` | Yes | VAT percentage |
| `originalNetAmount` | `number` | Yes | Original net amount |
| `originalVatAmount` | `number` | Yes | Original VAT amount |
| `netAmount` | `number` | Yes | Net amount |
| `vatAmount` | `number` | Yes | VAT amount |
| `grossAmount` | `number` | Yes | Gross amount |
| `unitPriceCurrency` | `number` | No | Unit price in currency |
| `exciseAmount` | `number` | No | Excise amount |
| `discountType` | `'Percent' \| 'Value'` | No | Discount type |
| `discountPercent` | `number` | No | Discount percentage |
| `discountValueOnNet` | `boolean` | No | Discount applied on net |
| `discountNetValue` | `number` | No | Discount net value |
| `discountGrossValue` | `number` | No | Discount gross value |
| `discountVatValue` | `number` | No | Discount VAT value |
| `description` | `string` | No | Line item description |

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

### Creating an invoice (v2 -- multi-item, recommended)

```ts
import { KeezApi, PaymentType } from 'keez-invoicing';

const keezApi = new KeezApi({
    applicationId: 'KEEZ_APPLICATION_ID',
    clientEid: 'KEEZ_CLIENT_ID',
    secret: 'KEEZ_SECRET',
    live: true,
});

const invoiceId = await keezApi.createInvoice({
    series: 'INV',
    documentDate: 20250101,
    dueDate: 20250115,
    currencyCode: 'RON',
    paymentType: PaymentType.BANK_TRANSFER,
    partner: {
        isLegalPerson: false,
        partnerName: 'John Doe',
        countryCode: 'RO',
        countryName: 'Romania',
        countyCode: 'RO.B',
        countyName: 'Bucuresti',
        cityName: 'Bucharest',
        addressDetails: 'Str. Comerciala nr. 4',
        identificationNumber: '1234',
    },
    items: [
        {
            itemExternalId: 'KEEZ_ITEM_ID',
            measureUnitId: 1,
            quantity: 2,
            unitPrice: 200,
            vatPercent: 19,
            originalNetAmount: 400,
            originalVatAmount: 76,
            netAmount: 400,
            vatAmount: 76,
            grossAmount: 476,
        },
    ],
});
console.log(`Created invoice with external ID: ${invoiceId}`);
```

### Creating an invoice (v1 -- single item, legacy)

```ts
const invoiceId = await keezApi.createInvoice({
    series: 'INV',
    currencyCode: 'RON',
    unitPrice: 400,
    vatPercent: 19,
    originalNetAmount: 400,
    originalVatAmount: 76,
    netAmount: 400,
    vatAmount: 76,
    grossAmount: 476,
    itemId: 'KEEZ_ITEM_ID',
    partner: {
        isLegalPerson: false,
        partnerName: 'John Doe',
        countryCode: 'RO',
        countryName: 'Romania',
        countyCode: 'RO.B',
        countyName: 'Bucuresti',
        cityName: 'Bucharest',
        addressDetails: 'Str. Comerciala nr. 4',
        identificationNumber: '1234',
    },
    paymentType: PaymentType.BANK_TRANSFER,
});
```

### Getting all invoices with filtering

```ts
// Get all invoices
const invoices = await keezApi.getAllInvoices();
console.log(`Total invoices: ${invoices.recordsCount}`);

// Get invoices with filters
const filteredInvoices = await keezApi.getAllInvoices({
    status: 'VALIDATED',
    fromDate: 20250101,
    toDate: 20251231,
    offset: 0,
    count: 50,
});
```

### Getting invoice by ID

```ts
const invoice = await keezApi.getInvoiceByExternalId('invoice-external-id');
console.log(`Invoice: ${invoice.series}-${invoice.number}`);
console.log(`Status: ${invoice.status}`);
console.log(`Amount: ${invoice.grossAmount} ${invoice.currencyCode}`);
```

### Sending invoice via email with CC/BCC

```ts
// Simple email
const result = await keezApi.sendInvoice('client@example.com', 'invoice-external-id');

// With CC and BCC
const resultWithCc = await keezApi.sendInvoice(
    {
        to: 'client@example.com',
        cc: ['accounting@example.com'],
        bcc: ['archive@example.com'],
    },
    'invoice-external-id'
);
```

### Working with items

```ts
import { KeezApi, MeasureUnit } from 'keez-invoicing';

// Create an item
const itemId = await keezApi.createItem({
    itemName: 'Consulting Service',
    measureUnitId: MeasureUnit.HOUR,
    unitPrice: 150,
    vatPercent: 19,
    itemDescription: 'Professional consulting service',
});

// Get all items
const items = await keezApi.getAllItems({ isActive: true });

// Get item by ID
const item = await keezApi.getItemByExternalId(itemId);

// Partially update an item
await keezApi.patchItem(itemId, { unitPrice: 175 });
```

### Using resource-scoped sub-clients

```ts
// Invoices
const invoices = await keezApi.invoices.getAll({ status: 'VALIDATED' });
const invoice = await keezApi.invoices.getById('invoice-external-id');
await keezApi.invoices.validate('invoice-external-id');
await keezApi.invoices.submitEfactura('invoice-external-id');
const pdf = await keezApi.invoices.downloadPdf('invoice-external-id');

// Items
const allItems = await keezApi.items.getAll();
const newItemId = await keezApi.items.create({
    itemName: 'Widget',
    measureUnitId: MeasureUnit.PIECE,
    unitPrice: 50,
    vatPercent: 19,
});
await keezApi.items.patch(newItemId, { unitPrice: 55 });
```

### Invoice lifecycle operations

```ts
// Validate an invoice
await keezApi.validateInvoice('invoice-external-id');

// Submit to eFactura (Romanian electronic invoicing)
const uploadIndex = await keezApi.submitInvoiceToEfactura('invoice-external-id');

// Download invoice PDF
const pdfBuffer = await keezApi.downloadInvoicePdf('invoice-external-id');
fs.writeFileSync('invoice.pdf', pdfBuffer);

// Cancel an invoice
await keezApi.cancelInvoice('invoice-external-id');

// Delete an invoice
await keezApi.deleteInvoice('invoice-external-id');
```

### Error handling

```ts
import { KeezAuthError, KeezApiError } from 'keez-invoicing';

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

Copyright 2023 - 2026 [TPN LABS](https://tpn-labs.com) - All rights reserved. This project is [BSD-3-Clause](LICENSE) licensed.
