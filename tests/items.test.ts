import nock = require('nock');
import { KeezApi } from '../src/keezApi';
import { MeasureUnit } from '../src/config/measureUnit';

describe('Keez API Items', () => {
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

    describe('getAllItems', () => {
        it('should fetch all items without filters', async () => {
            const mockItems = {
                first: 0,
                last: 1,
                recordsCount: 2,
                data: [
                    {
                        externalId: 'item-1',
                        itemName: 'Test Item 1',
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

            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(200, mockItems);

            const result = await keezApi.getAllItems();
            expect(result.recordsCount).toBe(2);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].itemName).toBe('Test Item 1');
        });

        it('should fetch items with pagination', async () => {
            const mockItems = {
                first: 10,
                last: 19,
                recordsCount: 50,
                data: [],
            };

            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items`)
                .query({ offset: '10', count: '10' })
                .reply(200, mockItems);

            const result = await keezApi.getAllItems({ offset: 10, count: 10 });
            expect(result.first).toBe(10);
        });
    });

    describe('getItemByExternalId', () => {
        it('should fetch a single item by ID', async () => {
            const mockItem = {
                externalId: 'item-123',
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
            };

            nock(baseDomain)
                .get(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200, mockItem);

            const result = await keezApi.getItemByExternalId('item-123');
            expect(result.externalId).toBe('item-123');
            expect(result.itemName).toBe('Test Item');
        });
    });

    describe('createItem', () => {
        it('should create a new item', async () => {
            nock(baseDomain)
                .post(`/api/v1.0/public-api/${clientEid}/items`)
                .reply(201, { externalId: 'new-item-id' });

            const result = await keezApi.createItem({
                itemName: 'New Item',
                measureUnitId: MeasureUnit.PIECE,
                unitPrice: 50,
                vatPercent: 19,
            });

            expect(result).toBe('new-item-id');
        });
    });

    describe('updateItem', () => {
        it('should update an existing item', async () => {
            nock(baseDomain)
                .put(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(keezApi.updateItem('item-123', {
                itemName: 'Updated Item',
                measureUnitId: MeasureUnit.PIECE,
                unitPrice: 75,
                vatPercent: 19,
            })).resolves.toBeUndefined();
        });
    });

    describe('patchItem', () => {
        it('should partially update an item', async () => {
            nock(baseDomain)
                .patch(`/api/v1.0/public-api/${clientEid}/items/item-123`)
                .reply(200);

            await expect(keezApi.patchItem('item-123', {
                unitPrice: 80,
            })).resolves.toBeUndefined();
        });
    });
});
