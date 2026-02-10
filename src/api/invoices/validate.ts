import axios, { AxiosInstance } from 'axios';
import { KeezApiError } from '@/errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface ValidateInvoiceParams {
    readonly appId: string;
    readonly appClientId: string;
    readonly baseDomain: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
}

export async function apiValidateInvoice(params: ValidateInvoiceParams): Promise<string> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/valid`;
    const body = {
        externalId: params.invoiceId,
    };

    try {
        await client.post(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        return 'VALIDATED';
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = (error.response?.data as { Message?: string })?.Message || error.message;
            log.error(`Error validating invoice (id: ${params.invoiceId}): ${errorMessage}`);
            throw new KeezApiError(`Failed to validate invoice: ${errorMessage}`, error.response?.status, error);
        }
        throw new KeezApiError(`Failed to validate invoice: ${safeStringify(error)}`, undefined, error);
    }
}
