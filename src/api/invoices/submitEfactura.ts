import axios, { AxiosInstance } from 'axios';
import { KeezApiError } from '@/errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface SubmitEfacturaParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
}

interface EfacturaResponse {
    uploadIndex?: string;
    externalId?: string;
}

export async function apiSubmitEfactura(params: SubmitEfacturaParams): Promise<string> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/efactura/submitted`;

    const body = {
        externalId: params.invoiceId,
    };

    try {
        const response = await client.post<EfacturaResponse>(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        return response.data.uploadIndex || response.data.externalId || 'SUBMITTED';
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error submitting to eFactura (${params.invoiceId}): ${safeStringify(errorMessage)}`);
            throw new KeezApiError(
                `Failed to submit invoice to eFactura: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to submit invoice to eFactura: ${safeStringify(error)}`, undefined, error);
    }
}
