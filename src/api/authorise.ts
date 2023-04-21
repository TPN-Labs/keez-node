import request = require('request');
import { logger } from '../helpers/logger';
import { KeezAuthResponse } from '../config/authResponse';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'GenerateToken' });

/**
 * baseDomain - The base domain for the API
 * appId - The application ID
 * apiSecret - The API secret
 */
interface GenerateTokenParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly apiSecret: string;
}

/**
 * Generate a token for the Keez API
 * @returns {KeezAuthResponse} - The token response containing the access token and the expiry time
 * @param params - As defined in the interface
 */
export async function apiGenerateToken(params: GenerateTokenParams): Promise<KeezAuthResponse> {
    const options = {
        method: 'POST',
        url: `${params.baseDomain}/idp/connect/token`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
            client_id: `app${params.appId}`,
            client_secret: params.apiSecret,
            grant_type: 'client_credentials',
            scope: 'public-api',
        },
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || response.body;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while authenticating: ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            const responseObject = JSON.parse(body);
            const result: KeezAuthResponse = {
                access_token: responseObject.access_token,
                expires_in: responseObject.expires_in,
                token_type: responseObject.token_type,
                scope: responseObject.scope,
            };
            resolve(result);
        });
    });
}
