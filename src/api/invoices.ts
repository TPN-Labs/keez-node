import request = require('request');
import { logger } from '../helpers/logger';
import { KeezAuthResponse } from '../config/authResponse';

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
export async function apiGetAllInvoices(params: GetAllInvoicesParams): Promise<KeezAuthResponse> {
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
            keezLogger.debug(body);
            resolve(body);
        });
    });
}
