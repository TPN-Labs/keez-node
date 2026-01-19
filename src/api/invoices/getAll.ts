import request = require('request');
import { logger } from '../../helpers/logger';
import { AllInvoicesResponse, ShortInvoiceResponse } from '../../dto/allInvoicesResponse';
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

    const options = {
        method: 'GET',
        url,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || response.body;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while getting all invoices: ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            const responseObject = JSON.parse(body);
            const allInvoices: ShortInvoiceResponse[] = [];
            responseObject.data.forEach((shortInvoice: any) => {
                allInvoices.push({
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
                });
            });
            const result: AllInvoicesResponse = {
                first: responseObject.first,
                last: responseObject.last,
                recordsCount: responseObject.recordsCount,
                data: allInvoices,
            };
            resolve(result);
        });
    });
}
