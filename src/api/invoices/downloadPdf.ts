import axios, { AxiosInstance } from 'axios';
import { KeezApiError } from '@/errors/KeezError';
import { DOWNLOAD_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface DownloadPdfParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
}

export async function apiDownloadInvoicePdf(params: DownloadPdfParams): Promise<Buffer> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/${params.invoiceId}/pdf`;

    try {
        const response = await client.get(url, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
            },
            responseType: 'arraybuffer',
            timeout: DOWNLOAD_REQUEST_TIMEOUT_MS,
        });

        return Buffer.from(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error downloading invoice PDF (${params.invoiceId}): ${safeStringify(errorMessage)}`);
            throw new KeezApiError(
                `Failed to download invoice PDF: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to download invoice PDF: ${safeStringify(error)}`, undefined, error);
    }
}
