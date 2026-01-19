import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { KeezApiError } from '../../errors/KeezError';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

interface SubmitEfacturaParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

interface EfacturaResponse {
    uploadIndex?: string;
    externalId?: string;
}

export async function apiSubmitEfactura(params: SubmitEfacturaParams): Promise<string> {
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/efactura/submitted`;

    const body = {
        externalId: params.invoiceId,
    };

    try {
        const response = await axios.post<EfacturaResponse>(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        return response.data.uploadIndex || response.data.externalId || 'SUBMITTED';
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(
            `Error encountered while submitting invoice to eFactura (${params.invoiceId}): ${JSON.stringify(errorMessage)}`
        );
        throw new KeezApiError(
            `Failed to submit invoice to eFactura: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
