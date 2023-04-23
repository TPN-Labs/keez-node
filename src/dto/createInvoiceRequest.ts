import { PaymentType } from '../config/paymentType.js';

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

export interface InvoiceRequest {
    series: string;
    currencyCode: string;
    amount: number;
    paymentType: PaymentType;
    partner: Partner;
    itemId: string;
}
