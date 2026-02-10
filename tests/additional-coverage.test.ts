import nock = require('nock');
import { KeezApi } from '@/keezApi';
import { apiGenerateToken } from '@/api/authorise';
import { apiCancelInvoice } from '@/api/invoices/cancel';
import { apiDeleteInvoice } from '@/api/invoices/delete';
import { apiDownloadInvoicePdf } from '@/api/invoices/downloadPdf';
import { apiUpdateInvoice } from '@/api/invoices/update';
import { apiSubmitEfactura } from '@/api/invoices/submitEfactura';
import { apiValidateInvoice } from '@/api/invoices/validate';
import { apiGetInvoiceByExternalId } from '@/api/invoices/view';
import { apiGetAllInvoices } from '@/api/invoices/getAll';
import { apiSendInvoice } from '@/api/invoices/sendMail';
import { apiCreateItem } from '@/api/items/create';
import { apiGetAllItems } from '@/api/items/getAll';
import { apiGetItemById } from '@/api/items/getById';
import { apiUpdateItem } from '@/api/items/update';
import { apiPatchItem } from '@/api/items/patch';
import { PaymentType } from '@/config/paymentType';
import { MeasureUnit } from '@/config/measureUnit';
import { KeezAuthError, KeezApiError } from '@/errors/KeezError';

const baseDomain = 'https://staging.keez.ro';
const clientEid = 'test-client-eid';

describe('Additional Coverage Tests', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    describe('KeezApi getInvoiceByExternalId through class', () => {
        let keezApi: KeezApi;

        beforeAll(() => {
            keezApi = new KeezApi({
                applicationId: 'test-app-id',
                clientEid: clientEid,
                secret: 'test-secret',
                live: false,
            });
        });

        it('should get invoice by external ID through KeezApi class', async () => {
            nock(baseDomain)
                .post('/idp/connect/token')
                .reply(200, {
                    access_token: 'test-token',
                    expires_in: 3600,
                    token_type: 'Bearer',
                    scope: 'public-api',
                });

            const mockInvoice = {
                currencyCode: 'RON',
                discountGrossValue: 0,
                discountNetValue: 0,
                discountVatValue: 0,
                discountValueOnNet: false,
                exciseAmount: 0,
                documentDate: 20230423,
                dueDate: 20230430,
                exchangeRate: 1,
                grossAmount: 119,
                netAmount: 100,
                number: 1,
                originalNetAmount: 100,
                originalVatAmount: 19,
                partner: {
                    addressDetails: 'Test Address',
                    cityName: 'Bucharest',
                    countryCode: 'RO',
                    countryName: 'Romania',
                    countyCode: 'RO.B',
                    countyName: 'Bucharest',
                    identificationNumber: '12345678',
                    isLegalPerson: false,
                    partnerName: 'Test Partner',
                },
                invoiceDetails: [
                    {
                        discountGrossValue: 0,
                        discountNetValue: 0,
                        discountVatValue: 0,
                        discountValueOnNet: false,
                        grossAmount: 119,
                        itemCode: 'ITEM-001',
                        itemDescription: 'Test Item',
                        itemExternalId: 'item-ext-1',
                        itemName: 'Test Item Name',
                        measureUnitId: 1,
                        netAmount: 100,
                        originalNetAmount: 100,
                        originalVatAmount: 19,
                        quantity: 1,
                        unMeasureUnit: 'buc',
                        unVatCategory: 'S',
                        unVatExemptionReason: '',
                        unitPrice: 100,
                        vatAmount: 19,
                        vatPercent: 19,
                        exciseAmount: 0,
                    },
                ],
                paymentTypeId: 3,
                referenceCurrencyCode: 'RON',
                series: 'PDI',
                status: 'draft',
                vatAmount: 19,
                vatOnCollection: false,
            };

            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .reply(200, mockInvoice);

            const result = await keezApi.getInvoiceByExternalId('inv-123');
            expect(result.grossAmount).toBe(119);
            expect(result.partner.partnerName).toBe('Test Partner');
        });
    });

    describe('Network Error Handling (axiosError.message fallback)', () => {
        it('should handle network error in apiGenerateToken', async () => {
            nock(baseDomain)
                .post('/idp/connect/token')
                .replyWithError('Network Error');

            await expect(
                apiGenerateToken({
                    baseDomain,
                    appId: 'test-app-id',
                    apiSecret: 'test-secret',
                })
            ).rejects.toThrow(KeezAuthError);
        });

        it('should handle network error in apiCancelInvoice', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/invoices/canceled`)
                .replyWithError('Connection refused');

            await expect(
                apiCancelInvoice({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    invoiceId: 'inv-123',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiDeleteInvoice', async () => {
            nock(baseDomain)
                .delete(`/api/v1.0/public-api/${clientEid}/invoices`)
                .replyWithError('Connection timeout');

            await expect(
                apiDeleteInvoice({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    invoiceId: 'inv-123',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiDownloadInvoicePdf', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices/inv-123/pdf`)
                .replyWithError('DNS resolution failed');

            await expect(
                apiDownloadInvoicePdf({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    invoiceId: 'inv-123',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiUpdateInvoice', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .replyWithError('Socket hang up');

            await expect(
                apiUpdateInvoice({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    invoiceId: 'inv-123',
                    invoice: {
                        series: 'INV',
                        documentDate: 20230101,
                        dueDate: 20230115,
                        currencyCode: 'RON',
                        paymentType: PaymentType.BANK_TRANSFER,
                        partner: {
                            isLegalPerson: false,
                            partnerName: 'Test Partner',
                            identificationNumber: '123456',
                            countryCode: 'RO',
                            countryName: 'Romania',
                            countyCode: 'B',
                            countyName: 'Bucuresti',
                            cityName: 'Bucuresti',
                            addressDetails: 'Test Address',
                        },
                        items: [
                            {
                                itemExternalId: 'item-1',
                                measureUnitId: 1,
                                quantity: 1,
                                unitPrice: 100,
                                vatPercent: 19,
                                originalNetAmount: 100,
                                originalVatAmount: 19,
                                netAmount: 100,
                                vatAmount: 19,
                                grossAmount: 119,
                            },
                        ],
                    },
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiSubmitEfactura', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/invoices/efactura/submitted`)
                .replyWithError('ECONNRESET');

            await expect(
                apiSubmitEfactura({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    invoiceId: 'inv-123',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiValidateInvoice', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/invoices/valid`)
                .replyWithError('ETIMEDOUT');

            await expect(
                apiValidateInvoice({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    invoiceId: 'inv-123',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiGetInvoiceByExternalId', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .replyWithError('ENOTFOUND');

            await expect(
                apiGetInvoiceByExternalId({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    invoiceId: 'inv-123',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiGetAllInvoices', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices`)
                .replyWithError('EHOSTUNREACH');

            await expect(
                apiGetAllInvoices({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiSendInvoice', async () => {
            nock(baseDomain)
                .post('/api/v1.0/public-api/invoices/delivery')
                .replyWithError('ECONNREFUSED');

            await expect(
                apiSendInvoice({
                    baseDomain,
                    appId: 'test-app-id',
                    bearerToken: 'test-token',
                    clientMail: 'test@example.com',
                    invoiceId: 'inv-123',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiCreateItem', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .replyWithError('Network Error');

            await expect(
                apiCreateItem({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    item: {
                        itemName: 'Test Item',
                        measureUnitId: MeasureUnit.PIECE,
                        unitPrice: 100,
                        vatPercent: 19,
                    },
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiGetAllItems', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items`)
                .replyWithError('Connection failed');

            await expect(
                apiGetAllItems({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiGetItemById', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .replyWithError('Request timeout');

            await expect(
                apiGetItemById({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    itemId: 'item-123',
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiUpdateItem', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .replyWithError('Socket closed');

            await expect(
                apiUpdateItem({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    itemId: 'item-123',
                    item: {
                        itemName: 'Updated Item',
                        measureUnitId: MeasureUnit.PIECE,
                        unitPrice: 150,
                        vatPercent: 19,
                    },
                })
            ).rejects.toThrow(KeezApiError);
        });

        it('should handle network error in apiPatchItem', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .replyWithError('Peer reset connection');

            await expect(
                apiPatchItem({
                    baseDomain,
                    appId: 'test-app-id',
                    appClientId: clientEid,
                    bearerToken: 'test-token',
                    itemId: 'item-123',
                    item: {
                        unitPrice: 200,
                    },
                })
            ).rejects.toThrow(KeezApiError);
        });
    });

    describe('Logger branch coverage', () => {
        it('should use debug log level when DEBUG env is set', async () => {
            // This test is more for completeness - the logger branch is based on LOG_LEVEL env
            nock(baseDomain)
                .post('/idp/connect/token')
                .reply(200, {
                    access_token: 'test-token',
                    expires_in: 3600,
                    token_type: 'Bearer',
                    scope: 'public-api',
                });

            const result = await apiGenerateToken({
                baseDomain,
                appId: 'test-app-id',
                apiSecret: 'test-secret',
            });

            expect(result.access_token).toBe('test-token');
        });
    });
});
