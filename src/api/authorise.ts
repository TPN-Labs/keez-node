import axios from 'axios';
import { AuthResponse } from '@/dto/authResponse';
import { KeezAuthError } from '@/errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS, TOKEN_EXPIRY_BUFFER_MS, MILLISECONDS_IN_SECOND } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface GenerateTokenParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly apiSecret: string;
    readonly logger?: KeezLogger;
}

export async function apiGenerateToken(params: GenerateTokenParams): Promise<AuthResponse> {
    const log = params.logger ?? noopLogger;
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
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        const responseObject = response.data;
        return {
            access_token: responseObject.access_token,
            expires_in: responseObject.expires_in,
            expires_at: Date.now() + responseObject.expires_in * MILLISECONDS_IN_SECOND - TOKEN_EXPIRY_BUFFER_MS,
            token_type: responseObject.token_type,
            scope: responseObject.scope,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error encountered while authenticating: ${safeStringify(errorMessage)}`);
            throw new KeezAuthError(
                `Authentication failed: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezAuthError(`Authentication failed: ${safeStringify(error)}`, undefined, error);
    }
}
