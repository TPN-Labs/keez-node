import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { KeezApiError } from '../../errors/KeezError';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

interface DeleteInvoiceParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

export async function apiDeleteInvoice(params: DeleteInvoiceParams): Promise<void> {
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices`;

    try {
        await axios.delete(url, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            data: {
                externalId: params.invoiceId,
            },
            timeout: 30000,
        });
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(
            `Error encountered while deleting invoice (${params.invoiceId}): ${JSON.stringify(errorMessage)}`
        );
        throw new KeezApiError(
            `Failed to delete invoice: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
