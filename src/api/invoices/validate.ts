import request = require('request');
import { logger } from '../../helpers/logger';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

/**
 * appId - The application ID
 * appClientId - The application client ID
 * baseDomain - The base domain for the API
 * bearerToken - The bearer token obtained at the authentication stage
 * invoiceId - The invoice ID
 */
interface ValidateInvoiceParams {
    readonly appId: string;
    readonly appClientId: string;
    readonly baseDomain: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

/**
 * Send an invoice by external ID
 * @param params - as defined in the interface
 */
export async function apiValidateInvoice(params: ValidateInvoiceParams) {
    const options = {
        method: 'POST',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/valid`,
        body: {
            externalId: params.invoiceId,
        },
        json: true,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            const errorMessage = error || response.body;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while validating invoice (id: ${params.invoiceId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve('VALIDATED');
        });
    });
}
