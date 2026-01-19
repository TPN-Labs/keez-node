import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { InvoiceResponse, Item } from '../../dto/invoiceResponse';
import { KeezApiError } from '../../errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS } from '../../config/constants';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

/**
 * baseDomain - The base domain for the API
 * appId - The application ID
 * appClientId - The application client ID
 * bearerToken - The bearer token obtained at the authentication stage
 * invoiceId - The invoice ID
 */
interface ViewInvoiceParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

interface ApiInvoiceItem {
    discountGrossValue: number;
    discountNetValue: number;
    discountVatValue: number;
    discountValueOnNet: boolean;
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
    exciseAmount: number;
}

interface ApiInvoiceResponse {
    currencyCode: string;
    discountGrossValue: number;
    discountNetValue: number;
    discountVatValue: number;
    discountValueOnNet: boolean;
    exciseAmount: number;
    documentDate: number;
    dueDate: number;
    exchangeRate: number;
    grossAmount: number;
    netAmount: number;
    number: number;
    originalNetAmount: number;
    originalVatAmount: number;
    partner: {
        addressDetails: string;
        cityName: string;
        countryCode: string;
        countryName: string;
        countyCode: string;
        countyName: string;
        identificationNumber: string;
        isLegalPerson: boolean;
        partnerName: string;
    };
    invoiceDetails: ApiInvoiceItem[];
    paymentTypeId: number;
    referenceCurrencyCode: string;
    series: string;
    status: string;
    vatAmount: number;
    vatOnCollection: boolean;
}

/**
 * Get an invoice by external ID
 * @param params as defined in the interface
 * @returns {Promise<InvoiceResponse>} - The invoice details
 */
export async function apiGetInvoiceByExternalId(params: ViewInvoiceParams): Promise<InvoiceResponse> {
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/${params.invoiceId}`;

    try {
        const response = await axios.get<ApiInvoiceResponse>(url, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        const responseObject = response.data;
        const allItems: Item[] = responseObject.invoiceDetails.map(item => ({
            discountGrossValue: item.discountGrossValue,
            discountNetValue: item.discountNetValue,
            discountVatValue: item.discountVatValue,
            discountValueOnNet: item.discountValueOnNet,
            grossAmount: item.grossAmount,
            itemCode: item.itemCode,
            itemDescription: item.itemDescription,
            itemExternalId: item.itemExternalId,
            itemName: item.itemName,
            measureUnitId: item.measureUnitId,
            netAmount: item.netAmount,
            originalNetAmount: item.originalNetAmount,
            originalVatAmount: item.originalVatAmount,
            quantity: item.quantity,
            unMeasureUnit: item.unMeasureUnit,
            unVatCategory: item.unVatCategory,
            unVatExemptionReason: item.unVatExemptionReason,
            unitPrice: item.unitPrice,
            vatAmount: item.vatAmount,
            vatPercent: item.vatPercent,
            exciseAmount: item.exciseAmount,
        }));

        const result: InvoiceResponse = {
            currencyCode: responseObject.currencyCode,
            discountGrossValue: responseObject.discountGrossValue,
            discountNetValue: responseObject.discountNetValue,
            discountVatValue: responseObject.discountVatValue,
            discountValueOnNet: responseObject.discountValueOnNet,
            exciseAmount: responseObject.exciseAmount,
            documentDate: responseObject.documentDate,
            dueDate: responseObject.dueDate,
            exchangeRate: responseObject.exchangeRate,
            grossAmount: responseObject.grossAmount,
            netAmount: responseObject.netAmount,
            number: responseObject.number,
            originalNetAmount: responseObject.originalNetAmount,
            originalVatAmount: responseObject.originalVatAmount,
            partner: {
                addressDetails: responseObject.partner.addressDetails,
                cityName: responseObject.partner.cityName,
                countryCode: responseObject.partner.countryCode,
                countryName: responseObject.partner.countryName,
                countyCode: responseObject.partner.countyCode,
                countyName: responseObject.partner.countyName,
                identificationNumber: responseObject.partner.identificationNumber,
                isLegalPerson: responseObject.partner.isLegalPerson,
                partnerName: responseObject.partner.partnerName,
            },
            items: allItems,
            paymentTypeId: responseObject.paymentTypeId,
            referenceCurrencyCode: responseObject.referenceCurrencyCode,
            series: responseObject.series,
            status: responseObject.status,
            vatAmount: responseObject.vatAmount,
            vatOnCollection: responseObject.vatOnCollection,
        };
        return result;
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(
            `Error encountered while getting invoice details (id: ${params.invoiceId}): ${JSON.stringify(errorMessage)}`
        );
        throw new KeezApiError(
            `Failed to get invoice details: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
