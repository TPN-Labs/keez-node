import { PaymentType } from '@/config/paymentType';
import { Partner } from '@/dto/createInvoiceRequest';

export interface InvoiceLineItem {
    readonly itemExternalId: string;
    readonly measureUnitId: number;
    readonly quantity: number;
    readonly unitPrice: number;
    readonly unitPriceCurrency?: number;
    readonly vatPercent: number;
    readonly originalNetAmount: number;
    readonly originalVatAmount: number;
    readonly netAmount: number;
    readonly vatAmount: number;
    readonly grossAmount: number;
    readonly exciseAmount?: number;
    readonly discountType?: 'Percent' | 'Value';
    readonly discountPercent?: number;
    readonly discountValueOnNet?: boolean;
    readonly discountNetValue?: number;
    readonly discountGrossValue?: number;
    readonly discountVatValue?: number;
    readonly description?: string;
}

export interface InvoiceRequestV2 {
    readonly series: string;
    readonly documentDate: number;
    readonly dueDate: number;
    readonly currencyCode: string;
    readonly paymentType: PaymentType;
    readonly partner: Partner;
    readonly items: InvoiceLineItem[];
    readonly vatOnCollection?: boolean;
    readonly exchangeRate?: number;
    readonly notes?: string;
}
