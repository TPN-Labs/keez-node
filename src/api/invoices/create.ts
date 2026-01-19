import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { InvoiceRequest } from '../../dto/createInvoiceRequest';
import { KeezApiError } from '../../errors/KeezError';
import {
    HTTP_REQUEST_TIMEOUT_MS,
    DATE_PAD_LENGTH,
    MONTH_INDEX_OFFSET,
    DECIMAL_RADIX,
    DEFAULT_VAT_AMOUNT,
    DEFAULT_INVOICE_QUANTITY,
} from '../../config/constants';
import { MeasureUnit } from '../../config/measureUnit';

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

    const body = {
        series: params.invoice.series,
        documentDate: params.invoice.documentDate ?? currentDate,
        dueDate: params.invoice.dueDate ?? currentDate,
        vatOnCollection: params.invoice.vatOnCollection ?? false,
        currencyCode: params.invoice.currencyCode,
        originalNetAmount: params.invoice.amount,
        originalNetAmountCurrency: params.invoice.amount,
        originalVatAmount: DEFAULT_VAT_AMOUNT,
        originalVatAmountCurrency: DEFAULT_VAT_AMOUNT,
        netAmount: params.invoice.amount,
        netAmountCurrency: params.invoice.amount,
        vatAmount: DEFAULT_VAT_AMOUNT,
        vatAmountCurrency: DEFAULT_VAT_AMOUNT,
        grossAmount: params.invoice.amount,
        grossAmountCurrency: params.invoice.amount,
        paymentTypeId: params.invoice.paymentType,
        partner: {
            isLegalPerson: params.invoice.partner.isLegalPerson,
            partnerName: params.invoice.partner.partnerName,
            countryCode: params.invoice.partner.countryCode,
            countryName: params.invoice.partner.countryName,
            countyCode: params.invoice.partner.countyCode,
            countyName: params.invoice.partner.countyName,
            cityName: params.invoice.partner.cityName,
            addressDetails: params.invoice.partner.addressDetails,
        },
        invoiceDetails: [
            {
                itemExternalId: params.invoice.itemId,
                measureUnitId: params.invoice.measureUnitId ?? MeasureUnit.PIECE,
                quantity: params.invoice.quantity ?? DEFAULT_INVOICE_QUANTITY,
                unitPrice: params.invoice.amount,
                originalNetAmount: params.invoice.amount,
                originalNetAmountCurrency: params.invoice.amount,
                originalVatAmount: DEFAULT_VAT_AMOUNT,
                originalVatAmountCurrency: DEFAULT_VAT_AMOUNT,
                netAmount: params.invoice.amount,
                netAmountCurrency: params.invoice.amount,
                vatAmount: DEFAULT_VAT_AMOUNT,
                vatAmountCurrency: DEFAULT_VAT_AMOUNT,
                grossAmount: params.invoice.amount,
                grossAmountCurrency: params.invoice.amount,
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
