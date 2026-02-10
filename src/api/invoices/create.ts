import axios, { AxiosError } from 'axios';
import { logger } from '@/helpers/logger';
import { InvoiceRequest } from '@/dto/createInvoiceRequest';
import { KeezApiError } from '@/errors/KeezError';
import {
    HTTP_REQUEST_TIMEOUT_MS,
    DATE_PAD_LENGTH,
    MONTH_INDEX_OFFSET,
    DECIMAL_RADIX,
    DEFAULT_INVOICE_QUANTITY,
} from '@/config/constants';
import { MeasureUnit } from '@/config/measureUnit';

const keezLogger = logger.child({
    _library: 'KeezWrapper',
    _method: 'Invoices',
});

/**
 * baseDomain - The base domain for the API
 * appId - The application ID
 * appClientId - The application client ID
 * bearerToken - The bearer token obtained at the authentication stage
 * itemId - The item ID
 */
interface CreateInvoiceParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoice: InvoiceRequest;
}

/**
 * Helper to get current date in YYYYMMDD format
 */
function getCurrentDateNumber(): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + MONTH_INDEX_OFFSET).padStart(DATE_PAD_LENGTH, '0');
    const day = String(now.getDate()).padStart(DATE_PAD_LENGTH, '0');
    return parseInt(`${year}${month}${day}`, DECIMAL_RADIX);
}

/**
 * Create an invoice
 * @param params as defined in the interface
 * @returns {Promise<string>} - The external ID of the created invoice
 */
export async function apiCreateInvoice(params: CreateInvoiceParams): Promise<string> {
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices`;
    const currentDate = getCurrentDateNumber();

    const inv = params.invoice;
    const exciseAmount = inv.exciseAmount ?? 0;
    const unitPriceCurrency = inv.unitPriceCurrency ?? inv.unitPrice;

    const body = {
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

    try {
        const response = await axios.post(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        return response.data.externalId;
    } catch (error) {
        const axiosError = error as AxiosError<{ Message?: string }>;
        const errorMessage = axiosError.response?.data?.Message || axiosError.message;
        keezLogger.error(`Error encountered while creating invoice: ${errorMessage}`);
        throw new KeezApiError(`Failed to create invoice: ${errorMessage}`, axiosError.response?.status, error);
    }
}
