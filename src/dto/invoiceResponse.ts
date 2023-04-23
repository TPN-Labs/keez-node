import { Partner } from './createInvoiceRequest';

export interface Item {
    discountGrossValue: number;
    discountNetValue: number;
    discountValueOnNet: boolean;
    discountVatValue: number;
    exciseAmount: number;
    grossAmount: number;
    itemCode: string;
    itemDescription: string;
    itemExternalId: string;
    itemName: string;
    measureUnitId: number;
    netAmount: number;
    originalNetAmount: number;
    originalVatAmount: number;
    quantity: number;
    unMeasureUnit: string;
    unVatCategory: string;
    unVatExemptionReason: string;
    unitPrice: number;
    vatAmount: number;
    vatPercent: number;
}

export interface InvoiceResponse {
    currencyCode: string;
    discountGrossValue: number;
    discountNetValue: number;
    discountValueOnNet: boolean;
    discountVatValue: number;
    documentDate: number;
    dueDate: number;
    exchangeRate: number;
    exciseAmount: number;
    grossAmount: number;
    items: Item[];
    netAmount: number;
    number: number;
    originalNetAmount: number;
    originalVatAmount: number;
    partner: Partner;
    paymentTypeId: number;
    referenceCurrencyCode: string;
    series: string;
    status: string;
    vatAmount: number;
    vatOnCollection: boolean;
}
