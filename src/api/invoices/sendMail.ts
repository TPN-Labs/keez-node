import request = require('request');
import { logger } from '../../helpers/logger';
import { SendInvoiceEmailParams } from '../../dto/invoices';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

/**
 * appId - The application ID
 * baseDomain - The base domain for the API
 * bearerToken - The bearer token obtained at the authentication stage
 * clientMail - The client email (for backward compatibility)
 * emailParams - Extended email parameters with CC/BCC support
 * invoiceId - The invoice ID
 */
interface SendInvoiceParams {
    readonly appId: string;
    readonly baseDomain: string;
    readonly bearerToken: string;
    readonly clientMail?: string;
    readonly emailParams?: SendInvoiceEmailParams;
    readonly invoiceId: string;
}

/**
 * Send an invoice by external ID
 * @param params - as defined in the interface
 */
export async function apiSendInvoice(params: SendInvoiceParams): Promise<string> {
    const recipients: Record<string, any> = {};

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

    const options = {
        method: 'POST',
        url: `${params.baseDomain}/api/v1.0/public-api/invoices/delivery`,
        body: {
            invoiceExternalId: params.invoiceId,
            info: [
                {
                    deliveryMethod: 'Email',
                    representationType: 'Attachment',
                    recipients,
                },
            ],
        },
        json: true,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
    };
    return new Promise<string>((resolve, reject) => {
        request(options, (error: any, response: any) => {
            const errorMessage = error || response.body;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while sending e-mail for invoice (id: ${params.invoiceId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve('SENT');
        });
    });
}
