import request = require('request');
import { logger } from '../../helpers/logger';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

interface CancelInvoiceParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

export async function apiCancelInvoice(params: CancelInvoiceParams): Promise<void> {
    const options = {
        method: 'POST',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/canceled`,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
        body: {
            externalId: params.invoiceId,
        },
        json: true,
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || body?.Message;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while canceling invoice (${params.invoiceId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve();
        });
    });
}
