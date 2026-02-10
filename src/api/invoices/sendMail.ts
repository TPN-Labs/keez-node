import axios, { AxiosInstance } from 'axios';
import { KeezApiError } from '@/errors/KeezError';
import { SendInvoiceEmailParams } from '@/dto/invoices';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface SendInvoiceParams {
    readonly appId: string;
    readonly baseDomain: string;
    readonly bearerToken: string;
    readonly clientMail?: string;
    readonly emailParams?: SendInvoiceEmailParams;
    readonly invoiceId: string;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
}

export async function apiSendInvoice(params: SendInvoiceParams): Promise<string> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
    const url = `${params.baseDomain}/api/v1.0/public-api/invoices/delivery`;

    const recipients: Record<string, string> = {};
    if (params.emailParams) {
        recipients.to = params.emailParams.to;
        if (params.emailParams.cc && params.emailParams.cc.length > 0) {
            recipients.cc = params.emailParams.cc.join(',');
        }
        if (params.emailParams.bcc && params.emailParams.bcc.length > 0) {
            recipients.bcc = params.emailParams.bcc.join(',');
        }
    } else if (params.clientMail) {
        recipients.to = params.clientMail;
    }

    const body = {
        invoiceExternalId: params.invoiceId,
        info: [
            {
                deliveryMethod: 'Email',
                representationType: 'Attachment',
                recipients,
            },
        ],
    };

    try {
        await client.post(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        return 'SENT';
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error sending invoice email (id: ${params.invoiceId}): ${safeStringify(errorMessage)}`);
            throw new KeezApiError(
                `Failed to send invoice email: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to send invoice email: ${safeStringify(error)}`, undefined, error);
    }
}
