import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { KeezApiError } from '../../errors/KeezError';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

/**
 * appId - The application ID
 * appClientId - The application client ID
 * baseDomain - The base domain for the API
 * bearerToken - The bearer token obtained at the authentication stage
 * invoiceId - The invoice ID
 */
interface ValidateInvoiceParams {
    readonly appId: string;
    readonly appClientId: string;
    readonly baseDomain: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

/**
 * Validate an invoice by external ID
 * @param params - as defined in the interface
 * @returns {Promise<string>} - Returns 'VALIDATED' on success
 */
export async function apiValidateInvoice(params: ValidateInvoiceParams): Promise<string> {
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/valid`;
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

        return 'VALIDATED';
    } catch (error) {
        const axiosError = error as AxiosError<{ Message?: string }>;
        const errorMessage = axiosError.response?.data?.Message || axiosError.message;
        keezLogger.error(`Error encountered while validating invoice (id: ${params.invoiceId}): ${errorMessage}`);
        throw new KeezApiError(
            `Failed to validate invoice: ${errorMessage}`,
            axiosError.response?.status,
            error,
        );
    }
}
