import nock = require('nock');
import { KeezApi } from '@/keezApi';
import { PaymentType } from '@/config/paymentType';
import { MeasureUnit } from '@/config/measureUnit';
import { KeezApiError } from '@/errors/KeezError';

describe('Error Handling Tests', () => {
    let keezApi: KeezApi;
    const baseDomain = 'https://staging.keez.ro';
    const clientEid = 'test-client-eid';

    beforeAll(() => {
        keezApi = new KeezApi({
            applicationId: 'test-app-id',
            clientEid: clientEid,
            secret: 'test-secret',
            live: false,
        });
    });

    beforeEach(() => {
        nock(baseDomain)
            .post('/idp/connect/token')
            .reply(200, {
                access_token: 'test-token',
                expires_in: 3600,
                token_type: 'Bearer',
                scope: 'public-api',
            });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('Invoice Error Handling', () => {
        describe('cancelInvoice', () => {
            it('should throw KeezApiError when cancel fails', async () => {
                nock(baseDomain)
                    .post(`/api/v1.0/public-api/${clientEid}/invoices/canceled`)
                    .reply(400, { Message: 'Invoice cannot be canceled' });

                await expect(keezApi.cancelInvoice('inv-123')).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError on server error during cancel', async () => {
                nock(baseDomain)
                    .post(`/api/v1.0/public-api/${clientEid}/invoices/canceled`)
                    .reply(500, { error: 'Internal Server Error' });

                await expect(keezApi.cancelInvoice('inv-123')).rejects.toThrow(KeezApiError);
            });
        });

        describe('deleteInvoice', () => {
            it('should throw KeezApiError when delete fails', async () => {
                nock(baseDomain)
                    .delete(`/api/v1.0/public-api/${clientEid}/invoices`)
                    .reply(400, { Message: 'Invoice cannot be deleted' });

                await expect(keezApi.deleteInvoice('inv-123')).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError when invoice not found for delete', async () => {
                nock(baseDomain)
                    .delete(`/api/v1.0/public-api/${clientEid}/invoices`)
                    .reply(404, { error: 'Invoice not found' });

                await expect(keezApi.deleteInvoice('non-existent')).rejects.toThrow(KeezApiError);
            });
        });

        describe('downloadInvoicePdf', () => {
            it('should throw KeezApiError when PDF download fails', async () => {
                nock(baseDomain)
                    .get('/api/v1.0/public-api/invoices/inv-123/pdf')
                    .reply(404, { error: 'Invoice not found' });

                await expect(keezApi.downloadInvoicePdf('inv-123')).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError on server error during PDF download', async () => {
                nock(baseDomain)
                    .get('/api/v1.0/public-api/invoices/inv-123/pdf')
                    .reply(500, { error: 'PDF generation failed' });

                await expect(keezApi.downloadInvoicePdf('inv-123')).rejects.toThrow(KeezApiError);
            });
        });

        describe('updateInvoice', () => {
            const invoiceData = {
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
                        quantity: 2,
                        unitPrice: 100,
                        vatPercent: 19,
                        originalNetAmount: 200,
                        originalVatAmount: 38,
                        netAmount: 200,
                        vatAmount: 38,
                        grossAmount: 238,
                    },
                ],
            };

            it('should throw KeezApiError when update fails', async () => {
                nock(baseDomain)
                    .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                    .reply(400, { Message: 'Invalid invoice data' });

                await expect(keezApi.updateInvoice('inv-123', invoiceData)).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError when invoice not found for update', async () => {
                nock(baseDomain)
                    .put(`/api/v1.0/public-api/${clientEid}/invoices/non-existent`)
                    .reply(404, { error: 'Invoice not found' });

                await expect(keezApi.updateInvoice('non-existent', invoiceData)).rejects.toThrow(KeezApiError);
            });
        });

        describe('submitInvoiceToEfactura', () => {
            it('should throw KeezApiError when submission fails', async () => {
                nock(baseDomain)
                    .post(`/api/v1.0/public-api/${clientEid}/invoices/efactura/submitted`)
                    .reply(400, { Message: 'Invoice not validated' });

                await expect(keezApi.submitInvoiceToEfactura('inv-123')).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError on server error during submission', async () => {
                nock(baseDomain)
                    .post(`/api/v1.0/public-api/${clientEid}/invoices/efactura/submitted`)
                    .reply(500, { error: 'eFactura service unavailable' });

                await expect(keezApi.submitInvoiceToEfactura('inv-123')).rejects.toThrow(KeezApiError);
            });
        });
    });

    describe('Item Error Handling', () => {
        describe('createItem', () => {
            it('should throw KeezApiError when create fails', async () => {
                nock(baseDomain)
                    .post(`/api/v1.0/public-api/${clientEid}/items`)
                    .reply(400, { Message: 'Invalid item data' });

                await expect(
                    keezApi.createItem({
                        itemName: 'Test Item',
                        measureUnitId: MeasureUnit.PIECE,
                        unitPrice: 100,
                        vatPercent: 19,
                    })
                ).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError on server error during create', async () => {
                nock(baseDomain)
                    .post(`/api/v1.0/public-api/${clientEid}/items`)
                    .reply(500, { error: 'Internal Server Error' });

                await expect(
                    keezApi.createItem({
                        itemName: 'Test Item',
                        measureUnitId: MeasureUnit.PIECE,
                        unitPrice: 100,
                        vatPercent: 19,
                    })
                ).rejects.toThrow(KeezApiError);
            });
        });

        describe('getAllItems', () => {
            it('should throw KeezApiError when fetch fails', async () => {
                nock(baseDomain)
                    .get(`/api/v1.0/public-api/${clientEid}/items`)
                    .reply(500, { error: 'Internal Server Error' });

                await expect(keezApi.getAllItems()).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError on unauthorized access', async () => {
                nock(baseDomain)
                    .get(`/api/v1.0/public-api/${clientEid}/items`)
                    .reply(401, { error: 'Unauthorized' });

                await expect(keezApi.getAllItems()).rejects.toThrow(KeezApiError);
            });
        });

        describe('getItemByExternalId', () => {
            it('should throw KeezApiError when item not found', async () => {
                nock(baseDomain)
                    .get(`/api/v1.0/public-api/${clientEid}/items/non-existent`)
                    .reply(404, { error: 'Item not found' });

                await expect(keezApi.getItemByExternalId('non-existent')).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError on server error', async () => {
                nock(baseDomain)
                    .get(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                    .reply(500, { error: 'Internal Server Error' });

                await expect(keezApi.getItemByExternalId('item-123')).rejects.toThrow(KeezApiError);
            });
        });

        describe('updateItem', () => {
            it('should throw KeezApiError when update fails', async () => {
                nock(baseDomain)
                    .put(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                    .reply(400, { Message: 'Invalid item data' });

                await expect(
                    keezApi.updateItem('item-123', {
                        itemName: 'Updated Item',
                        measureUnitId: MeasureUnit.PIECE,
                        unitPrice: 150,
                        vatPercent: 19,
                    })
                ).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError when item not found for update', async () => {
                nock(baseDomain)
                    .put(`/api/v1.0/public-api/${clientEid}/items/non-existent`)
                    .reply(404, { error: 'Item not found' });

                await expect(
                    keezApi.updateItem('non-existent', {
                        itemName: 'Updated Item',
                        measureUnitId: MeasureUnit.PIECE,
                        unitPrice: 150,
                        vatPercent: 19,
                    })
                ).rejects.toThrow(KeezApiError);
            });
        });

        describe('patchItem', () => {
            it('should throw KeezApiError when patch fails', async () => {
                nock(baseDomain)
                    .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                    .reply(400, { Message: 'Invalid patch data' });

                await expect(keezApi.patchItem('item-123', { unitPrice: -100 })).rejects.toThrow(KeezApiError);
            });

            it('should throw KeezApiError when item not found for patch', async () => {
                nock(baseDomain)
                    .patch(`/api/v1.0/public-api/${clientEid}/items/non-existent`)
                    .reply(404, { error: 'Item not found' });

                await expect(keezApi.patchItem('non-existent', { unitPrice: 100 })).rejects.toThrow(KeezApiError);
            });
        });
    });
});
