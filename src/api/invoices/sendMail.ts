import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { KeezApiError } from '../../errors/KeezError';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

/**
 * appId - The application ID
 * baseDomain - The base domain for the API
 * bearerToken - The bearer token obtained at the authentication stage
 * clientMail - The client email
 * invoiceId - The invoice ID
 */
interface SendInvoiceParams {
    readonly appId: string;
    readonly baseDomain: string;
    readonly bearerToken: string;
    readonly clientMail: string;
    readonly invoiceId: string;
}

/**
 * Send an invoice by external ID
 * @param params - as defined in the interface
 * @returns {Promise<string>} - Returns 'SENT' on success
 */
export async function apiSendInvoice(params: SendInvoiceParams): Promise<string> {
    const url = `${params.baseDomain}/api/v1.0/public-api/invoices/delivery`;
    const body = {
        invoiceExternalId: params.invoiceId,
        info: [
            {
                deliveryMethod: 'Email',
                representationType: 'Attachment',
                recipients: {
                    to: params.clientMail,
                },
            },
        ],
    };

    try {
        await axios.post(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        return 'SENT';
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(
            `Error encountered while sending e-mail for invoice (id: ${params.invoiceId}): ${JSON.stringify(errorMessage)}`
        );
        throw new KeezApiError(
            `Failed to send invoice email: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
