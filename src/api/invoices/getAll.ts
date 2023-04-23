import request = require('request');
import { logger } from '../../helpers/logger';
import { AllInvoicesResponse, ShortInvoiceResponse } from '../../dto/allInvoicesResponse';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

/**
 * baseDomain - The base domain for the API
 * appId - The application ID
 * appClientId - The application client ID
 * bearerToken - The bearer token obtained at the authentication stage
 */
interface GetAllInvoicesParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
}

/**
 * Get all invoices
 * @param params - As defined in the interface
 */
export async function apiGetAllInvoices(params: GetAllInvoicesParams): Promise<AllInvoicesResponse> {
    const options = {
        method: 'GET',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices`,
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
