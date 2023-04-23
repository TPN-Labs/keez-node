import request = require('request');
import { logger } from '../../helpers/logger';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

/**
 * appId - The application ID
 * baseDomain - The base domain for the API
 * bearerToken - The bearer token obtained at the authentication stage
 * clientMail - The client email
 * invoiceId - The invoice ID
 */
interface SendInvoiceParams {
    readonly appId: string;
    readonly baseDomain: string;
    readonly bearerToken: string;
    readonly clientMail: string;
    readonly invoiceId: string;
}

/**
 * Send an invoice by external ID
 * @param params - as defined in the interface
 */
export async function apiSendInvoice(params: SendInvoiceParams) {
    const options = {
        method: 'POST',
        url: `${params.baseDomain}/api/v1.0/public-api/invoices/delivery`,
        body: {
            invoiceExternalId: params.invoiceId,
            info: [
                {
                    deliveryMethod: 'Email',
                    representationType: 'Attachment',
                    recipients: {
                        to: params.clientMail,
                    },
                },
            ],
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
                keezLogger.error(`Error encountered while sending e-mail for invoice (id: ${params.invoiceId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve('SENT');
        });
    });
}
