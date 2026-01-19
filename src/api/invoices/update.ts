import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { InvoiceRequestV2 } from '../../dto/invoices';
import { KeezApiError } from '../../errors/KeezError';

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
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/invoices/${params.invoiceId}`;

    const invoiceDetails = params.invoice.items.map(item => ({
        itemExternalId: item.itemExternalId,
        measureUnitId: item.measureUnitId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatPercent: item.vatPercent,
        discountPercent: item.discountPercent,
        description: item.description,
    }));

    const body = {
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
    };

    try {
        await axios.put(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(`Error encountered while updating invoice (${params.invoiceId}): ${JSON.stringify(errorMessage)}`);
        throw new KeezApiError(
            `Failed to update invoice: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
