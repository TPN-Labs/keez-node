import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { AllInvoicesResponse, ShortInvoiceResponse } from '../../dto/allInvoicesResponse';
import { KeezApiError } from '../../errors/KeezError';
import { InvoiceFilterParams } from '../../dto/invoices';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

/**
 * baseDomain - The base domain for the API
 * appId - The application ID
 * appClientId - The application client ID
 * bearerToken - The bearer token obtained at the authentication stage
 * filterParams - Optional filter parameters
 */
interface GetAllInvoicesParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly filterParams?: InvoiceFilterParams;
}

interface ApiShortInvoice {
    externalId: string;
    series: string;
    number: number;
    documentDate: number;
    dueDate: number;
    status: string;
    clientName: string;
    partnerName: string;
    currencyCode: string;
    referenceCurrencyCode: string;
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
}

interface ApiAllInvoicesResponse {
    first: number;
    last: number;
    recordsCount: number;
    data: ApiShortInvoice[];
}

/**
 * Get all invoices
 * @param params - As defined in the interface
 */
export async function apiGetAllInvoices(params: GetAllInvoicesParams): Promise<AllInvoicesResponse> {
    let url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices`;

    if (params.filterParams) {
        const queryParams = new URLSearchParams();
        if (params.filterParams.offset !== undefined) {
            queryParams.append('offset', params.filterParams.offset.toString());
        }
        if (params.filterParams.count !== undefined) {
            queryParams.append('count', params.filterParams.count.toString());
        }
        if (params.filterParams.status) {
            queryParams.append('status', params.filterParams.status);
        }
        if (params.filterParams.fromDate !== undefined) {
            queryParams.append('fromDate', params.filterParams.fromDate.toString());
        }
        if (params.filterParams.toDate !== undefined) {
            queryParams.append('toDate', params.filterParams.toDate.toString());
        }
        if (params.filterParams.series) {
            queryParams.append('series', params.filterParams.series);
        }
        if (params.filterParams.partnerName) {
            queryParams.append('partnerName', params.filterParams.partnerName);
        }
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    try {
        const response = await axios.get<ApiAllInvoicesResponse>(url, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
            },
            timeout: 30000,
        });

        const responseObject = response.data;
        const allInvoices: ShortInvoiceResponse[] = responseObject.data.map(shortInvoice => ({
            externalId: shortInvoice.externalId,
            series: shortInvoice.series,
            number: shortInvoice.number,
            documentDate: shortInvoice.documentDate,
            dueDate: shortInvoice.dueDate,
            status: shortInvoice.status,
            clientName: shortInvoice.clientName,
            partnerName: shortInvoice.partnerName,
            currencyCode: shortInvoice.currencyCode,
            referenceCurrencyCode: shortInvoice.referenceCurrencyCode,
            netAmount: shortInvoice.netAmount,
            vatAmount: shortInvoice.vatAmount,
            grossAmount: shortInvoice.grossAmount,
        }));

        const result: AllInvoicesResponse = {
            first: responseObject.first,
            last: responseObject.last,
            recordsCount: responseObject.recordsCount,
            data: allInvoices,
        };
        return result;
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(`Error encountered while getting all invoices: ${JSON.stringify(errorMessage)}`);
        throw new KeezApiError(
            `Failed to get all invoices: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
