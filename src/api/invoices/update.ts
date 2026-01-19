import request = require('request');
import { logger } from '../../helpers/logger';
import { InvoiceRequestV2 } from '../../dto/invoices';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

interface UpdateInvoiceParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
    readonly invoice: InvoiceRequestV2;
}

export async function apiUpdateInvoice(params: UpdateInvoiceParams): Promise<void> {
    const invoiceDetails = params.invoice.items.map(item => ({
        itemExternalId: item.itemExternalId,
        measureUnitId: item.measureUnitId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatPercent: item.vatPercent,
        discountPercent: item.discountPercent,
        description: item.description,
    }));

    const options = {
        method: 'PUT',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/${params.invoiceId}`,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
        body: {
            series: params.invoice.series,
            documentDate: params.invoice.documentDate,
            dueDate: params.invoice.dueDate,
            currencyCode: params.invoice.currencyCode,
            paymentTypeId: params.invoice.paymentType,
            vatOnCollection: params.invoice.vatOnCollection ?? false,
            exchangeRate: params.invoice.exchangeRate,
            notes: params.invoice.notes,
            partner: {
                isLegalPerson: params.invoice.partner.isLegalPerson,
                partnerName: params.invoice.partner.partnerName,
                identificationNumber: params.invoice.partner.identificationNumber,
                countryCode: params.invoice.partner.countryCode,
                countryName: params.invoice.partner.countryName,
                countyCode: params.invoice.partner.countyCode,
                countyName: params.invoice.partner.countyName,
                cityName: params.invoice.partner.cityName,
                addressDetails: params.invoice.partner.addressDetails,
            },
            invoiceDetails,
        },
        json: true,
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || body?.Message;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while updating invoice (${params.invoiceId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve();
        });
    });
}
