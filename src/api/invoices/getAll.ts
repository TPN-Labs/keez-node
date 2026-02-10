import axios, { AxiosInstance } from 'axios';
import { AllInvoicesResponse, ShortInvoiceResponse } from '@/dto/allInvoicesResponse';
import { KeezApiError } from '@/errors/KeezError';
import { InvoiceFilterParams } from '@/dto/invoices';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface GetAllInvoicesParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly filterParams?: InvoiceFilterParams;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
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

export async function apiGetAllInvoices(params: GetAllInvoicesParams): Promise<AllInvoicesResponse> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
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
        const response = await client.get<ApiAllInvoicesResponse>(url, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
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

        return {
            first: responseObject.first,
            last: responseObject.last,
            recordsCount: responseObject.recordsCount,
            data: allInvoices,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error getting all invoices: ${safeStringify(errorMessage)}`);
            throw new KeezApiError(
                `Failed to get all invoices: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to get all invoices: ${safeStringify(error)}`, undefined, error);
    }
}
