import request = require('request');
import { logger } from '../../helpers/logger';
import { InvoiceResponse, Item } from '../../dto/invoiceResponse';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Invoices' });

/**
 * baseDomain - The base domain for the API
 * appId - The application ID
 * appClientId - The application client ID
 * bearerToken - The bearer token obtained at the authentication stage
 * invoiceId - The invoice ID
 */
interface ViewInvoiceParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly invoiceId: string;
}

/**
 * Get an invoice by external ID
 * @param params as defined in the interface
 */
export async function apiGetInvoiceByExternalId(params: ViewInvoiceParams) {
    const options = {
        method: 'GET',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/${params.invoiceId}`,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || response.body;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while getting invoice details (id: ${params.invoiceId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            const responseObject = JSON.parse(body);
            const allItems: Item[] = [];
            responseObject.invoiceDetails.forEach((item: any) => {
                allItems.push({
                    discountGrossValue: item.discountGrossValue,
                    discountNetValue: item.discountNetValue,
                    discountVatValue: item.discountVatValue,
                    discountValueOnNet: item.discountValueOnNet,
                    grossAmount: item.grossAmount,
                    itemCode: item.itemCode,
                    itemDescription: item.itemDescription,
                    itemExternalId: item.itemExternalId,
                    itemName: item.itemName,
                    measureUnitId: item.measureUnitId,
                    netAmount: item.netAmount,
                    originalNetAmount: item.originalNetAmount,
                    originalVatAmount: item.originalVatAmount,
                    quantity: item.quantity,
                    unMeasureUnit: item.unMeasureUnit,
                    unVatCategory: item.unVatCategory,
                    unVatExemptionReason: item.unVatExemptionReason,
                    unitPrice: item.unitPrice,
                    vatAmount: item.vatAmount,
                    vatPercent: item.vatPercent,
                    exciseAmount: item.exciseAmount,
                });
            });
            const result: InvoiceResponse = {
                currencyCode: responseObject.currencyCode,
                discountGrossValue: responseObject.discountGrossValue,
                discountNetValue: responseObject.discountNetValue,
                discountVatValue: responseObject.discountVatValue,
                discountValueOnNet: responseObject.discountValueOnNet,
                exciseAmount: responseObject.exciseAmount,
                documentDate: responseObject.documentDate,
                dueDate: responseObject.dueDate,
                exchangeRate: responseObject.exchangeRate,
                grossAmount: responseObject.grossAmount,
                netAmount: responseObject.netAmount,
                number: responseObject.number,
                originalNetAmount: responseObject.originalNetAmount,
                originalVatAmount: responseObject.originalVatAmount,
                partner: {
                    addressDetails: responseObject.partner.addressDetails,
                    cityName: responseObject.partner.cityName,
                    countryCode: responseObject.partner.countryCode,
                    countryName: responseObject.partner.countryName,
                    countyCode: responseObject.partner.countyCode,
                    countyName: responseObject.partner.countyName,
                    identificationNumber: responseObject.partner.identificationNumber,
                    isLegalPerson: responseObject.partner.isLegalPerson,
                    partnerName: responseObject.partner.partnerName,
                },
                items: allItems,
                paymentTypeId: responseObject.paymentTypeId,
                referenceCurrencyCode: responseObject.referenceCurrencyCode,
                series: responseObject.series,
                status: responseObject.status,
                vatAmount: responseObject.vatAmount,
                vatOnCollection: responseObject.vatOnCollection,
            };
            resolve(result);
        });
    });
}
