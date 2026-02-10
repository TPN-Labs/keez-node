import nock = require('nock');
import { KeezApi } from '@/keezApi';
import { MeasureUnit } from '@/config/measureUnit';
import { PaymentType } from '@/config/paymentType';

describe('Edge Cases and Response Variations Tests', () => {
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

    describe('submitInvoiceToEfactura Response Variations', () => {
        it('should return externalId when uploadIndex is not present', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/invoices/efactura/submitted`)
                .reply(200, { externalId: 'ext-123' });

            const result = await keezApi.submitInvoiceToEfactura('inv-123');
            expect(result).toBe('ext-123');
        });

        it('should return SUBMITTED when neither uploadIndex nor externalId is present', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/invoices/efactura/submitted`)
                .reply(200, {});

            const result = await keezApi.submitInvoiceToEfactura('inv-123');
            expect(result).toBe('SUBMITTED');
        });

        it('should prefer uploadIndex over externalId', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/invoices/efactura/submitted`)
                .reply(200, { uploadIndex: 'upload-123', externalId: 'ext-123' });

            const result = await keezApi.submitInvoiceToEfactura('inv-123');
            expect(result).toBe('upload-123');
        });
    });

    describe('Create Item with Optional Fields', () => {
        it('should create item with all optional fields', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(201, { externalId: 'new-item-id' });

            const result = await keezApi.createItem({
                itemName: 'Full Item',
                itemCode: 'FI001',
                itemDescription: 'Detailed description',
                measureUnitId: MeasureUnit.PIECE,
                unitPrice: 100,
                vatPercent: 19,
                vatCategoryCode: 'S',
                vatExemptionReason: 'N/A',
                isActive: true,
            });

            expect(result).toBe('new-item-id');
        });

        it('should create item with isActive explicitly set to false', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(201, { externalId: 'inactive-item-id' });

            const result = await keezApi.createItem({
                itemName: 'Inactive Item',
                measureUnitId: MeasureUnit.PIECE,
                unitPrice: 50,
                vatPercent: 19,
                isActive: false,
            });

            expect(result).toBe('inactive-item-id');
        });
    });

    describe('Update Invoice with Optional Fields', () => {
        it('should update invoice with vatOnCollection', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .reply(200);

            await expect(
                keezApi.updateInvoice('inv-123', {
                    series: 'INV',
                    documentDate: 20230101,
                    dueDate: 20230115,
                    currencyCode: 'RON',
                    paymentType: PaymentType.BANK_TRANSFER,
                    vatOnCollection: true,
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
                        },
                    ],
                })
            ).resolves.toBeUndefined();
        });

        it('should update invoice with exchangeRate and notes', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .reply(200);

            await expect(
                keezApi.updateInvoice('inv-123', {
                    series: 'INV',
                    documentDate: 20230101,
                    dueDate: 20230115,
                    currencyCode: 'EUR',
                    paymentType: PaymentType.CARD_ONLINE,
                    exchangeRate: 4.95,
                    notes: 'Payment received',
                    partner: {
                        isLegalPerson: true,
                        partnerName: 'Company Ltd',
                        identificationNumber: 'RO12345678',
                        countryCode: 'RO',
                        countryName: 'Romania',
                        countyCode: 'CJ',
                        countyName: 'Cluj',
                        cityName: 'Cluj-Napoca',
                        addressDetails: 'Main Street 1',
                    },
                    items: [
                        {
                            itemExternalId: 'item-1',
                            measureUnitId: 1,
                            quantity: 5,
                            unitPrice: 200,
                            vatPercent: 19,
                            discountPercent: 10,
                            description: 'Custom description',
                        },
                    ],
                })
            ).resolves.toBeUndefined();
        });
    });

    describe('Update Item with All Fields', () => {
        it('should update item with all optional fields', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(
                keezApi.updateItem('item-123', {
                    itemName: 'Updated Full Item',
                    itemCode: 'UFI001',
                    itemDescription: 'Updated detailed description',
                    measureUnitId: MeasureUnit.KILOGRAM,
                    unitPrice: 250,
                    vatPercent: 9,
                    vatCategoryCode: 'R',
                    vatExemptionReason: 'Reduced rate',
                    isActive: true,
                })
            ).resolves.toBeUndefined();
        });
    });

    describe('KeezApi Live Mode', () => {
        it('should use live domain when setLive is called with true', async () => {
            const liveApi = new KeezApi({
                applicationId: 'test-app-id',
                clientEid: clientEid,
                secret: 'test-secret',
                live: false,
            });

            expect(liveApi.getBaseDomain()).toBe('https://staging.keez.ro');

            liveApi.setLive(true);
            expect(liveApi.getBaseDomain()).toBe('https://app.keez.ro');

            liveApi.setLive(false);
            expect(liveApi.getBaseDomain()).toBe('https://staging.keez.ro');
        });
    });

    describe('Token Refresh on Multiple Calls', () => {
        it('should reuse token for consecutive calls when still valid', async () => {
            const mockItems = {
                first: 0,
                last: 0,
                recordsCount: 0,
                data: [],
            };

            // First call generates token
            nock(baseDomain).get(`/api/v1.0/public-api/${clientEid}/items`).reply(200, mockItems);

            await keezApi.getAllItems();

            // Second call should reuse token (no new token request)
            nock(baseDomain).get(`/api/v1.0/public-api/${clientEid}/items`).reply(200, mockItems);

            await keezApi.getAllItems();
        });
    });

    describe('Invoice with Various Payment Types', () => {
        const baseInvoice = {
            series: 'INV',
            documentDate: 20230101,
            dueDate: 20230115,
            currencyCode: 'RON',
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
                },
            ],
        };

        it('should update invoice with CASH payment type', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .reply(200);

            await expect(
                keezApi.updateInvoice('inv-123', {
                    ...baseInvoice,
                    paymentType: PaymentType.CASH,
                })
            ).resolves.toBeUndefined();
        });

        it('should update invoice with CARD payment type', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .reply(200);

            await expect(
                keezApi.updateInvoice('inv-123', {
                    ...baseInvoice,
                    paymentType: PaymentType.CARD,
                })
            ).resolves.toBeUndefined();
        });

        it('should update invoice with MEAL_VOUCHER payment type', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .reply(200);

            await expect(
                keezApi.updateInvoice('inv-123', {
                    ...baseInvoice,
                    paymentType: PaymentType.MEAL_VOUCHER,
                })
            ).resolves.toBeUndefined();
        });

        it('should update invoice with CASH_ON_DELIVERY payment type', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .reply(200);

            await expect(
                keezApi.updateInvoice('inv-123', {
                    ...baseInvoice,
                    paymentType: PaymentType.CASH_ON_DELIVERY,
                })
            ).resolves.toBeUndefined();
        });

        it('should update invoice with HOLIDAY_VOUCHER_CARD payment type', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/invoices/inv-123`)
                .reply(200);

            await expect(
                keezApi.updateInvoice('inv-123', {
                    ...baseInvoice,
                    paymentType: PaymentType.HOLIDAY_VOUCHER_CARD,
                })
            ).resolves.toBeUndefined();
        });
    });

    describe('Item with Various Measure Units', () => {
        it('should create item with KILOGRAM measure unit', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(201, { externalId: 'kg-item-id' });

            const result = await keezApi.createItem({
                itemName: 'Bulk Item',
                measureUnitId: MeasureUnit.KILOGRAM,
                unitPrice: 25,
                vatPercent: 19,
            });

            expect(result).toBe('kg-item-id');
        });

        it('should create item with LITER measure unit', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(201, { externalId: 'liter-item-id' });

            const result = await keezApi.createItem({
                itemName: 'Liquid Item',
                measureUnitId: MeasureUnit.LITER,
                unitPrice: 10,
                vatPercent: 9,
            });

            expect(result).toBe('liter-item-id');
        });

        it('should create item with METER measure unit', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(201, { externalId: 'meter-item-id' });

            const result = await keezApi.createItem({
                itemName: 'Cable Item',
                measureUnitId: MeasureUnit.METER,
                unitPrice: 5,
                vatPercent: 19,
            });

            expect(result).toBe('meter-item-id');
        });

        it('should create item with SQUARE_METER measure unit', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(201, { externalId: 'sqm-item-id' });

            const result = await keezApi.createItem({
                itemName: 'Floor Item',
                measureUnitId: MeasureUnit.SQUARE_METER,
                unitPrice: 50,
                vatPercent: 19,
            });

            expect(result).toBe('sqm-item-id');
        });

        it('should create item with HOUR measure unit', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(201, { externalId: 'hour-item-id' });

            const result = await keezApi.createItem({
                itemName: 'Service Item',
                measureUnitId: MeasureUnit.HOUR,
                unitPrice: 100,
                vatPercent: 19,
            });

            expect(result).toBe('hour-item-id');
        });

        it('should create item with DAY measure unit', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(201, { externalId: 'day-item-id' });

            const result = await keezApi.createItem({
                itemName: 'Rental Item',
                measureUnitId: MeasureUnit.DAY,
                unitPrice: 500,
                vatPercent: 19,
            });

            expect(result).toBe('day-item-id');
        });
    });
});
