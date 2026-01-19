import request = require('request');
import { logger } from '../../helpers/logger';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

interface DownloadPdfParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

export async function apiDownloadInvoicePdf(params: DownloadPdfParams): Promise<Buffer> {
    const options = {
        method: 'GET',
        url: `${params.baseDomain}/api/v1.0/public-api/invoices/${params.invoiceId}/pdf`,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
        encoding: null,
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                const errorMessage = error || `HTTP ${response.statusCode}`;
                keezLogger.error(`Error encountered while downloading invoice PDF (${params.invoiceId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve(body as Buffer);
        });
    });
}
