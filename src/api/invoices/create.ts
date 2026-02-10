import axios, { AxiosInstance } from 'axios';
import { InvoiceRequest } from '@/dto/createInvoiceRequest';
import { InvoiceRequestV2 } from '@/dto/invoices';
import { KeezApiError } from '@/errors/KeezError';
import {
    HTTP_REQUEST_TIMEOUT_MS,
    DATE_PAD_LENGTH,
    MONTH_INDEX_OFFSET,
    DECIMAL_RADIX,
    DEFAULT_INVOICE_QUANTITY,
} from '@/config/constants';
import { MeasureUnit } from '@/config/measureUnit';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface CreateInvoiceParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoice: InvoiceRequest | InvoiceRequestV2;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
}

function getCurrentDateNumber(): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + MONTH_INDEX_OFFSET).padStart(DATE_PAD_LENGTH, '0');
    const day = String(now.getDate()).padStart(DATE_PAD_LENGTH, '0');
    return parseInt(`${year}${month}${day}`, DECIMAL_RADIX);
}

function isV2Invoice(invoice: InvoiceRequest | InvoiceRequestV2): invoice is InvoiceRequestV2 {
    return 'items' in invoice && Array.isArray((invoice as InvoiceRequestV2).items);
}

function buildV1Body(inv: InvoiceRequest) {
    const currentDate = getCurrentDateNumber();
    const exciseAmount = inv.exciseAmount ?? 0;
    const unitPriceCurrency = inv.unitPriceCurrency ?? inv.unitPrice;

    return {
        series: inv.series,
        documentDate: inv.documentDate ?? currentDate,
        dueDate: inv.dueDate ?? currentDate,
        vatOnCollection: inv.vatOnCollection ?? false,
        currencyCode: inv.currencyCode,
        originalNetAmount: inv.originalNetAmount,
        originalNetAmountCurrency: inv.originalNetAmount,
        originalVatAmount: inv.originalVatAmount,
        originalVatAmountCurrency: inv.originalVatAmount,
        netAmount: inv.netAmount,
        netAmountCurrency: inv.netAmount,
        vatAmount: inv.vatAmount,
        vatAmountCurrency: inv.vatAmount,
        grossAmount: inv.grossAmount,
        grossAmountCurrency: inv.grossAmount,
        exciseAmount: exciseAmount,
        exciseAmountCurrency: exciseAmount,
        paymentTypeId: inv.paymentType,
        partner: {
            isLegalPerson: inv.partner.isLegalPerson,
            partnerName: inv.partner.partnerName,
            countryCode: inv.partner.countryCode,
            countryName: inv.partner.countryName,
            countyCode: inv.partner.countyCode,
            countyName: inv.partner.countyName,
            cityName: inv.partner.cityName,
            addressDetails: inv.partner.addressDetails,
        },
        invoiceDetails: [
            {
                itemExternalId: inv.itemId,
                measureUnitId: inv.measureUnitId ?? MeasureUnit.PIECE,
                quantity: inv.quantity ?? DEFAULT_INVOICE_QUANTITY,
                unitPrice: inv.unitPrice,
                unitPriceCurrency: unitPriceCurrency,
                vatPercent: inv.vatPercent,
                originalNetAmount: inv.originalNetAmount,
                originalNetAmountCurrency: inv.originalNetAmount,
                originalVatAmount: inv.originalVatAmount,
                originalVatAmountCurrency: inv.originalVatAmount,
                netAmount: inv.netAmount,
                netAmountCurrency: inv.netAmount,
                vatAmount: inv.vatAmount,
                vatAmountCurrency: inv.vatAmount,
                grossAmount: inv.grossAmount,
                grossAmountCurrency: inv.grossAmount,
                exciseAmount: exciseAmount,
                exciseAmountCurrency: exciseAmount,
            },
        ],
    };
}

function buildV2Body(inv: InvoiceRequestV2) {
    const invoiceDetails = inv.items.map(item => ({
        itemExternalId: item.itemExternalId,
        measureUnitId: item.measureUnitId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitPriceCurrency: item.unitPriceCurrency ?? item.unitPrice,
        vatPercent: item.vatPercent,
        originalNetAmount: item.originalNetAmount,
        originalVatAmount: item.originalVatAmount,
        netAmount: item.netAmount,
        vatAmount: item.vatAmount,
        grossAmount: item.grossAmount,
        exciseAmount: item.exciseAmount ?? 0,
        discountType: item.discountType,
        discountPercent: item.discountPercent,
        discountValueOnNet: item.discountValueOnNet,
        discountNetValue: item.discountNetValue,
        discountGrossValue: item.discountGrossValue,
        discountVatValue: item.discountVatValue,
        description: item.description,
    }));

    return {
        series: inv.series,
        documentDate: inv.documentDate,
        dueDate: inv.dueDate,
        currencyCode: inv.currencyCode,
        paymentTypeId: inv.paymentType,
        vatOnCollection: inv.vatOnCollection ?? false,
        exchangeRate: inv.exchangeRate,
        notes: inv.notes,
        partner: {
            isLegalPerson: inv.partner.isLegalPerson,
            partnerName: inv.partner.partnerName,
            identificationNumber: inv.partner.identificationNumber,
            countryCode: inv.partner.countryCode,
            countryName: inv.partner.countryName,
            countyCode: inv.partner.countyCode,
            countyName: inv.partner.countyName,
            cityName: inv.partner.cityName,
            addressDetails: inv.partner.addressDetails,
        },
        invoiceDetails,
    };
}

export async function apiCreateInvoice(params: CreateInvoiceParams): Promise<string> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices`;

    const body = isV2Invoice(params.invoice)
        ? buildV2Body(params.invoice)
        : buildV1Body(params.invoice);

    try {
        const response = await client.post(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        return response.data.externalId;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage =
                (error.response?.data as { Message?: string })?.Message || error.message;
            log.error(`Error creating invoice: ${errorMessage}`);
            throw new KeezApiError(
                `Failed to create invoice: ${errorMessage}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to create invoice: ${safeStringify(error)}`, undefined, error);
    }
}
