import request = require('request');
import { logger } from '../../helpers/logger';
import { InvoiceRequest } from '../../dto/createInvoiceRequest';

const keezLogger = logger.child({
    _library: 'KeezWrapper',
    _method: 'Invoices',
});

/**
 * baseDomain - The base domain for the API
 * appId - The application ID
 * appClientId - The application client ID
 * bearerToken - The bearer token obtained at the authentication stage
 * itemId - The item ID
 */
interface CreateInvoiceParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoice: InvoiceRequest;
}

/**
 * Get an invoice by external ID
 * @param params as defined in the interface
 */
export async function apiCreateInvoice(params: CreateInvoiceParams) {
    const options = {
        method: 'POST',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices`,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
        body: {
            series: 'PDI',
            documentDate: 20230423,
            dueDate: 20230423,
            vatOnCollection: false,
            currencyCode: 'RON',
            originalNetAmount: params.invoice.amount,
            originalNetAmountCurrency: params.invoice.amount,
            originalVatAmount: 0,
            originalVatAmountCurrency: 0,
            netAmount: params.invoice.amount,
            netAmountCurrency: params.invoice.amount,
            vatAmount: 0,
            vatAmountCurrency: 0,
            grossAmount: params.invoice.amount,
            grossAmountCurrency: params.invoice.amount,
            paymentTypeId: params.invoice.paymentType,
            partner: {
                isLegalPerson: false,
                partnerName: params.invoice.partner.partnerName,
                countryCode: params.invoice.partner.countryCode,
                countryName: params.invoice.partner.countryName,
                countyCode: params.invoice.partner.countyCode,
                countyName: params.invoice.partner.countyName,
                cityName: params.invoice.partner.cityName,
                addressDetails: params.invoice.partner.addressDetails,
            },
            invoiceDetails: [
                {
                    itemExternalId: params.invoice.itemId,
                    measureUnitId: 1,
                    quantity: 1,
                    unitPrice: params.invoice.amount,
                    originalNetAmount: params.invoice.amount,
                    originalNetAmountCurrency: params.invoice.amount,
                    originalVatAmount: 0,
                    originalVatAmountCurrency: 0,
                    netAmount: params.invoice.amount,
                    netAmountCurrency: params.invoice.amount,
                    vatAmount: 0,
                    vatAmountCurrency: 0,
                    grossAmount: params.invoice.amount,
                    grossAmountCurrency: params.invoice.amount,
                },
            ],
        },
        json: true,
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || body.Message;
            if (error || response.statusCode !== 201) {
                keezLogger.error(`Error encountered while creating invoice: ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve(body.externalId);
        });
    });
}
