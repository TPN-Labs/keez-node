import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { KeezApiError } from '../../errors/KeezError';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

interface CancelInvoiceParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

export async function apiCancelInvoice(params: CancelInvoiceParams): Promise<void> {
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/canceled`;

    const body = {
        externalId: params.invoiceId,
    };

    try {
        await axios.post(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(
            `Error encountered while canceling invoice (${params.invoiceId}): ${JSON.stringify(errorMessage)}`
        );
        throw new KeezApiError(
            `Failed to cancel invoice: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
