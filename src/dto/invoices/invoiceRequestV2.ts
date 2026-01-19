import { PaymentType } from '@/config/paymentType';
import { Partner } from '@/dto/createInvoiceRequest';

export interface InvoiceLineItem {
    readonly itemExternalId: string;
    readonly measureUnitId: number;
    readonly quantity: number;
    readonly unitPrice: number;
    readonly vatPercent?: number;
    readonly discountPercent?: number;
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
