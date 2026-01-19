import nock = require('nock');
import { KeezApi } from '../src/keezApi';
import { MeasureUnit } from '../src/config/measureUnit';

describe('Filter Parameters Tests', () => {
    let keezApi: KeezApi;
    const baseDomain = 'https://staging.keez.ro';
    const clientEid = 'test-client-eid';

    beforeAll(() => {
        keezApi = new KeezApi({
            application_id: 'test-app-id',
            client_eid: clientEid,
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

    describe('Invoice Filter Parameters', () => {
        const mockInvoicesResponse = {
            first: 0,
            last: 0,
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

        it('should filter invoices by fromDate', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices`)
                .query({ fromDate: '20230101' })
                .reply(200, mockInvoicesResponse);

            const result = await keezApi.getAllInvoices({ fromDate: 20230101 });
            expect(result.data).toHaveLength(1);
        });

        it('should filter invoices by toDate', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices`)
                .query({ toDate: '20231231' })
                .reply(200, mockInvoicesResponse);

            const result = await keezApi.getAllInvoices({ toDate: 20231231 });
            expect(result.data).toHaveLength(1);
        });

        it('should filter invoices by series', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices`)
                .query({ series: 'INV' })
                .reply(200, mockInvoicesResponse);

            const result = await keezApi.getAllInvoices({ series: 'INV' });
            expect(result.data).toHaveLength(1);
        });

        it('should filter invoices by partnerName', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices`)
                .query({ partnerName: 'Test Partner' })
                .reply(200, mockInvoicesResponse);

            const result = await keezApi.getAllInvoices({ partnerName: 'Test Partner' });
            expect(result.data).toHaveLength(1);
        });

        it('should filter invoices by date range', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices`)
                .query({ fromDate: '20230101', toDate: '20231231' })
                .reply(200, mockInvoicesResponse);

            const result = await keezApi.getAllInvoices({ fromDate: 20230101, toDate: 20231231 });
            expect(result.data).toHaveLength(1);
        });

        it('should combine multiple invoice filters', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/invoices`)
                .query({
                    status: 'VALIDATED',
                    series: 'INV',
                    partnerName: 'Test Partner',
                    fromDate: '20230101',
                    toDate: '20231231',
                    offset: '0',
                    count: '10',
                })
                .reply(200, mockInvoicesResponse);

            const result = await keezApi.getAllInvoices({
                status: 'VALIDATED',
                series: 'INV',
                partnerName: 'Test Partner',
                fromDate: 20230101,
                toDate: 20231231,
                offset: 0,
                count: 10,
            });
            expect(result.data).toHaveLength(1);
        });
    });

    describe('Item Filter Parameters', () => {
        const mockItemsResponse = {
            first: 0,
            last: 0,
            recordsCount: 1,
            data: [
                {
                    externalId: 'item-1',
                    itemName: 'Test Item',
                    itemCode: 'TI001',
                    itemDescription: 'Test description',
                    measureUnitId: 1,
                    measureUnitName: 'Bucata',
                    unitPrice: 100,
                    vatPercent: 19,
                    vatCategoryCode: 'S',
                    vatExemptionReason: '',
                    isActive: true,
                    createdAt: 1700000000000,
                    updatedAt: 1700000000000,
                },
            ],
        };

        it('should filter items by itemName', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items`)
                .query({ itemName: 'Test Item' })
                .reply(200, mockItemsResponse);

            const result = await keezApi.getAllItems({ itemName: 'Test Item' });
            expect(result.data).toHaveLength(1);
        });

        it('should filter items by itemCode', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items`)
                .query({ itemCode: 'TI001' })
                .reply(200, mockItemsResponse);

            const result = await keezApi.getAllItems({ itemCode: 'TI001' });
            expect(result.data).toHaveLength(1);
        });

        it('should filter items by isActive', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items`)
                .query({ isActive: 'true' })
                .reply(200, mockItemsResponse);

            const result = await keezApi.getAllItems({ isActive: true });
            expect(result.data).toHaveLength(1);
        });

        it('should filter inactive items', async () => {
            const inactiveItemsResponse = {
                ...mockItemsResponse,
                data: [{ ...mockItemsResponse.data[0], isActive: false }],
            };

            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items`)
                .query({ isActive: 'false' })
                .reply(200, inactiveItemsResponse);

            const result = await keezApi.getAllItems({ isActive: false });
            expect(result.data).toHaveLength(1);
            expect(result.data[0].isActive).toBe(false);
        });

        it('should combine multiple item filters', async () => {
            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items`)
                .query({
                    itemName: 'Test Item',
                    itemCode: 'TI001',
                    isActive: 'true',
                    offset: '0',
                    count: '10',
                })
                .reply(200, mockItemsResponse);

            const result = await keezApi.getAllItems({
                itemName: 'Test Item',
                itemCode: 'TI001',
                isActive: true,
                offset: 0,
                count: 10,
            });
            expect(result.data).toHaveLength(1);
        });
    });

    describe('Patch Item with Multiple Fields', () => {
        it('should patch item with all optional fields', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(
                keezApi.patchItem('item-123', {
                    itemName: 'Updated Name',
                    itemCode: 'NEW001',
                    itemDescription: 'Updated description',
                    measureUnitId: MeasureUnit.KILOGRAM,
                    unitPrice: 200,
                    vatPercent: 9,
                    vatCategoryCode: 'R',
                    vatExemptionReason: 'None',
                    isActive: false,
                })
            ).resolves.toBeUndefined();
        });

        it('should patch item with only itemName', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(keezApi.patchItem('item-123', { itemName: 'New Name' })).resolves.toBeUndefined();
        });

        it('should patch item with only itemCode', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(keezApi.patchItem('item-123', { itemCode: 'CODE001' })).resolves.toBeUndefined();
        });

        it('should patch item with itemDescription', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(
                keezApi.patchItem('item-123', { itemDescription: 'New description' })
            ).resolves.toBeUndefined();
        });

        it('should patch item with measureUnitId', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(keezApi.patchItem('item-123', { measureUnitId: MeasureUnit.LITER })).resolves.toBeUndefined();
        });

        it('should patch item with vatPercent', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(keezApi.patchItem('item-123', { vatPercent: 5 })).resolves.toBeUndefined();
        });

        it('should patch item with vatCategoryCode', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(keezApi.patchItem('item-123', { vatCategoryCode: 'E' })).resolves.toBeUndefined();
        });

        it('should patch item with vatExemptionReason', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(
                keezApi.patchItem('item-123', { vatExemptionReason: 'Exempt for reason' })
            ).resolves.toBeUndefined();
        });

        it('should patch item with isActive', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(keezApi.patchItem('item-123', { isActive: false })).resolves.toBeUndefined();
        });
    });
});
