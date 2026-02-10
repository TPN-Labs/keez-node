import { PaymentType } from '@/config/paymentType';

export interface Partner {
    addressDetails: string;
    cityName: string;
    countryCode: string;
    countryName: string;
    countyCode: string;
    countyName: string;
    identificationNumber: string;
    isLegalPerson: boolean;
    partnerName: string;
}

export interface InvoiceDetail {
    itemExternalId: string;
    measureUnitId: number;
    quantity: number;
    unitPrice: number;
    unitPriceCurrency: number;
    vatPercent: number;
    originalNetAmount: number;
    originalVatAmount: number;
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    exciseAmount: number;
    itemName?: string;
    itemDescription?: string;
    discountType?: 'Percent' | 'Value';
    discountPercent?: number;
    discountValueOnNet?: boolean;
    discountNetValue?: number;
    discountGrossValue?: number;
    discountVatValue?: number;
    originalNetAmountCurrency?: number;
    originalVatAmountCurrency?: number;
    discountNetValueCurrency?: number;
    discountGrossValueCurrency?: number;
    discountVatValueCurrency?: number;
    netAmountCurrency?: number;
    vatAmountCurrency?: number;
    grossAmountCurrency?: number;
    exciseAmountCurrency?: number;
}

export interface InvoiceRequest {
    currencyCode: string;
    documentDate?: number;
    dueDate?: number;
    itemId: string;
    measureUnitId?: number;
    partner: Partner;
    paymentType: PaymentType;
    quantity?: number;
    series: string;
    unitPrice: number;
    unitPriceCurrency?: number;
    vatPercent: number;
    originalNetAmount: number;
    originalVatAmount: number;
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    exciseAmount?: number;
    vatOnCollection?: boolean;
}
