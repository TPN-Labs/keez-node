import nock = require('nock');
import { KeezApi } from '@/keezApi';
import { PaymentType } from '@/config/paymentType';

describe('Keez API Invoices Extended', () => {
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
        // Mock the auth token generation
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

    describe('getAllInvoices with filters', () => {
        it('should fetch invoices with status filter', async () => {
            const mockInvoices = {
                first: 0,
                last: 1,
                recordsCount: 1,
                data: [
                    {
                        externalId: 'inv-1',
                        series: 'INV',
                        number: 1,
                        documentDate: 20230101,
                        dueDate: 20230115,
                        status: 'VALIDATED',
                        clientName: 'Test Client',
                        partnerName: 'Test Partner',
                        currencyCode: 'RON',
                        referenceCurrencyCode: 'RON',
                        netAmount: 100,
                        vatAmount: 19,
                        grossAmount: 119,
                    },
                ],
            };

            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices`)
                .query({ status: 'VALIDATED' })
                .reply(200, mockInvoices);

            const result = await keezApi.getAllInvoices({ status: 'VALIDATED' });
            expect(result.data).toHaveLength(1);
            expect(result.data[0].status).toBe('VALIDATED');
        });

        it('should fetch invoices with pagination', async () => {
            const mockInvoices = {
                first: 10,
                last: 19,
                recordsCount: 50,
                data: [],
            };

            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices`)
                .query({ offset: '10', count: '10' })
                .reply(200, mockInvoices);

            const result = await keezApi.getAllInvoices({ offset: 10, count: 10 });
            expect(result.first).toBe(10);
        });
    });

    describe('sendInvoice with extended params', () => {
        it('should send invoice with simple email', async () => {
            nock(baseDomain)
                .post('/api/v1.0/public-api/invoices/delivery')
                .reply(200);

            const result = await keezApi.sendInvoice('test@example.com', 'inv-123');
            expect(result).toBe('SENT');
        });

        it('should send invoice with CC and BCC', async () => {
            nock(baseDomain)
                .post('/api/v1.0/public-api/invoices/delivery')
                .reply(200);

            const result = await keezApi.sendInvoice(
                {
                    to: 'main@example.com',
                    cc: ['cc1@example.com', 'cc2@example.com'],
                    bcc: ['bcc@example.com'],
                },
                'inv-123',
            );
            expect(result).toBe('SENT');
        });
    });

    describe('updateInvoice', () => {
        it('should update an existing invoice', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .reply(200);

            await expect(keezApi.updateInvoice('inv-123', {
                series: 'INV',
                documentDate: 20230101,
                dueDate: 20230115,
                currencyCode: 'RON',
                paymentType: PaymentType.BANK_TRANSFER,
                partner: {
                    isLegalPerson: false,
                    partnerName: 'Updated Partner',
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
                    },
                ],
            })).resolves.toBeUndefined();
        });
    });

    describe('deleteInvoice', () => {
        it('should delete an invoice', async () => {
            nock(baseDomain)
                .delete(`/api/v1.0/public-api/${clientEid}/invoices`)
                .reply(200);

            await expect(keezApi.deleteInvoice('inv-123')).resolves.toBeUndefined();
        });
    });

    describe('submitInvoiceToEfactura', () => {
        it('should submit invoice to eFactura', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/invoices/efactura/submitted`)
                .reply(200, { uploadIndex: 'upload-123' });

            const result = await keezApi.submitInvoiceToEfactura('inv-123');
            expect(result).toBe('upload-123');
        });
    });

    describe('cancelInvoice', () => {
        it('should cancel an invoice', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/invoices/canceled`)
                .reply(200);

            await expect(keezApi.cancelInvoice('inv-123')).resolves.toBeUndefined();
        });
    });

    describe('downloadInvoicePdf', () => {
        it('should download invoice PDF', async () => {
            const pdfBuffer = Buffer.from('PDF content');

            nock(baseDomain)
                .get('/api/v1.0/public-api/invoices/inv-123/pdf')
                .reply(200, pdfBuffer);

            const result = await keezApi.downloadInvoicePdf('inv-123');
            expect(result).toBeInstanceOf(Buffer);
        });
    });
});
