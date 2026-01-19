import axios, { AxiosError } from 'axios';
import { logger } from '../helpers/logger';
import { AuthResponse } from '../dto/authResponse';
import { KeezAuthError } from '../errors/KeezError';

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
 * @returns {AuthResponse} - The token response containing the access token and the expiry time
 * @param params - As defined in the interface
 */
export async function apiGenerateToken(params: GenerateTokenParams): Promise<AuthResponse> {
    const url = `${params.baseDomain}/idp/connect/token`;
    const formData = new URLSearchParams({
        client_id: `app${params.appId}`,
        client_secret: params.apiSecret,
        grant_type: 'client_credentials',
        scope: 'public-api',
    });

    try {
        const response = await axios.post(url, formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 30000,
        });

        const responseObject = response.data;
        return {
            access_token: responseObject.access_token,
            expires_in: responseObject.expires_in,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).getTime(), // 5 minutes
            token_type: responseObject.token_type,
            scope: responseObject.scope,
        };
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(`Error encountered while authenticating: ${JSON.stringify(errorMessage)}`);
        throw new KeezAuthError(
            `Authentication failed: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
