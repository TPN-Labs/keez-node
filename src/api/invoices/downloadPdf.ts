import axios, { AxiosError } from 'axios';
import { logger } from '@/helpers/logger';
import { KeezApiError } from '@/errors/KeezError';
import { DOWNLOAD_REQUEST_TIMEOUT_MS } from '@/config/constants';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

interface DownloadPdfParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

export async function apiDownloadInvoicePdf(params: DownloadPdfParams): Promise<Buffer> {
    const url = `${params.baseDomain}/api/v1.0/public-api/invoices/${params.invoiceId}/pdf`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
            },
            responseType: 'arraybuffer',
            timeout: DOWNLOAD_REQUEST_TIMEOUT_MS,
        });

        return Buffer.from(response.data);
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(
            `Error encountered while downloading invoice PDF (${params.invoiceId}): ${JSON.stringify(errorMessage)}`
        );
        throw new KeezApiError(
            `Failed to download invoice PDF: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
