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
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
}

export interface InvoiceRequest {
    series: string;
    currencyCode: string;
    amount: number;
    paymentType: PaymentType;
    partner: Partner;
    itemId: string;
    documentDate?: number;
    dueDate?: number;
    measureUnitId?: number;
    quantity?: number;
    vatOnCollection?: boolean;
}
