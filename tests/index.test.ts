import nock from 'nock';
import { KeezApi } from '../src/keezApi';
import { apiGenerateToken } from '../src/api/authorise';
import { apiGetAllInvoices } from '../src/api/invoices/getAll';
import { apiGetInvoiceByExternalId } from '../src/api/invoices/view';
import { apiCreateInvoice } from '../src/api/invoices/create';
import { apiSendInvoice } from '../src/api/invoices/sendMail';
import { apiValidateInvoice } from '../src/api/invoices/validate';
import { PaymentType } from '../src/config/paymentType';
import { KeezAuthError, KeezApiError } from '../src/errors/KeezError';

const STAGING_DOMAIN = 'https://staging.keez.ro';
const LIVE_DOMAIN = 'https://app.keez.ro';

describe('KeezApi class', () => {
    let keezApi: KeezApi;

    beforeAll(() => {
        keezApi = new KeezApi({
            application_id: 'test-app-id',
            client_eid: 'test-client-eid',
            secret: 'test-secret',
            live: true,
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    test('should return live domain when live mode is true', () => {
        keezApi.setLive(true);
        expect(keezApi.getBaseDomain()).toBe(LIVE_DOMAIN);
    });

    test('should return staging domain when live mode is false', () => {
        keezApi.setLive(false);
        expect(keezApi.getBaseDomain()).toBe(STAGING_DOMAIN);
    });
});

describe('apiGenerateToken', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    test('should generate token successfully', async () => {
        const mockResponse = {
            access_token: 'test-access-token',
            expires_in: 3600,
            token_type: 'Bearer',
            scope: 'public-api',
        };

        nock(STAGING_DOMAIN)
            .post('/idp/connect/token')
            .reply(200, mockResponse);

        const result = await apiGenerateToken({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            apiSecret: 'test-secret',
        });

        expect(result.access_token).toBe('test-access-token');
        expect(result.expires_in).toBe(3600);
        expect(result.token_type).toBe('Bearer');
        expect(result.scope).toBe('public-api');
        expect(result.expires_at).toBeGreaterThan(Date.now());
    });

    test('should throw KeezAuthError on authentication failure', async () => {
        nock(STAGING_DOMAIN)
            .post('/idp/connect/token')
            .reply(401, { error: 'invalid_client' });

        await expect(apiGenerateToken({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            apiSecret: 'wrong-secret',
        })).rejects.toThrow(KeezAuthError);
    });
});

describe('apiGetAllInvoices', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    test('should get all invoices successfully', async () => {
        const mockResponse = {
            first: 0,
            last: 1,
            recordsCount: 2,
            data: [
                {
                    externalId: 'invoice-1',
                    series: 'PDI',
                    number: 1,
                    documentDate: 20230423,
                    dueDate: 20230430,
                    status: 'draft',
                    clientName: 'Test Client',
                    partnerName: 'Test Partner',
                    currencyCode: 'RON',
                    referenceCurrencyCode: 'RON',
                    netAmount: 100,
                    vatAmount: 19,
                    grossAmount: 119,
                },
                {
                    externalId: 'invoice-2',
                    series: 'PDI',
                    number: 2,
                    documentDate: 20230424,
                    dueDate: 20230501,
                    status: 'valid',
                    clientName: 'Test Client 2',
                    partnerName: 'Test Partner 2',
                    currencyCode: 'EUR',
                    referenceCurrencyCode: 'RON',
                    netAmount: 200,
                    vatAmount: 38,
                    grossAmount: 238,
                },
            ],
        };

        nock(STAGING_DOMAIN)
            .get('/api/v1.0/public-api/test-client-eid/invoices')
            .reply(200, mockResponse);

        const result = await apiGetAllInvoices({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
        });

        expect(result.recordsCount).toBe(2);
        expect(result.data).toHaveLength(2);
        expect(result.data[0].externalId).toBe('invoice-1');
        expect(result.data[1].externalId).toBe('invoice-2');
    });

    test('should return empty array when no invoices exist', async () => {
        const mockResponse = {
            first: 0,
            last: 0,
            recordsCount: 0,
            data: [],
        };

        nock(STAGING_DOMAIN)
            .get('/api/v1.0/public-api/test-client-eid/invoices')
            .reply(200, mockResponse);

        const result = await apiGetAllInvoices({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
        });

        expect(result.recordsCount).toBe(0);
        expect(result.data).toHaveLength(0);
    });

    test('should throw KeezApiError on failure', async () => {
        nock(STAGING_DOMAIN)
            .get('/api/v1.0/public-api/test-client-eid/invoices')
            .reply(500, { error: 'Internal Server Error' });

        await expect(apiGetAllInvoices({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
        })).rejects.toThrow(KeezApiError);
    });
});

describe('apiGetInvoiceByExternalId', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    test('should get invoice by external ID successfully', async () => {
        const mockResponse = {
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

        nock(STAGING_DOMAIN)
            .get('/api/v1.0/public-api/test-client-eid/invoices/invoice-ext-1')
            .reply(200, mockResponse);

        const result = await apiGetInvoiceByExternalId({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
            invoiceId: 'invoice-ext-1',
        });

        expect(result.grossAmount).toBe(119);
        expect(result.partner.partnerName).toBe('Test Partner');
        expect(result.items).toHaveLength(1);
        expect(result.items[0].itemName).toBe('Test Item Name');
    });

    test('should throw KeezApiError when invoice not found', async () => {
        nock(STAGING_DOMAIN)
            .get('/api/v1.0/public-api/test-client-eid/invoices/non-existent')
            .reply(404, { error: 'Invoice not found' });

        await expect(apiGetInvoiceByExternalId({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
            invoiceId: 'non-existent',
        })).rejects.toThrow(KeezApiError);
    });
});

describe('apiCreateInvoice', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    test('should create invoice successfully', async () => {
        const mockResponse = {
            externalId: 'new-invoice-ext-id',
        };

        nock(STAGING_DOMAIN)
            .post('/api/v1.0/public-api/test-client-eid/invoices')
            .reply(201, mockResponse);

        const result = await apiCreateInvoice({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
            invoice: {
                series: 'PDI',
                currencyCode: 'RON',
                amount: 100,
                paymentType: PaymentType.BANK_TRANSFER,
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
                itemId: 'item-ext-1',
            },
        });

        expect(result).toBe('new-invoice-ext-id');
    });

    test('should create invoice with custom date and quantity', async () => {
        const mockResponse = {
            externalId: 'new-invoice-ext-id-2',
        };

        nock(STAGING_DOMAIN)
            .post('/api/v1.0/public-api/test-client-eid/invoices', (body: { documentDate: number; invoiceDetails: { quantity: number }[] }) => body.documentDate === 20240115 && body.invoiceDetails[0].quantity === 5)
            .reply(201, mockResponse);

        const result = await apiCreateInvoice({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
            invoice: {
                series: 'PDI',
                currencyCode: 'RON',
                amount: 500,
                paymentType: PaymentType.CARD_ONLINE,
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
                itemId: 'item-ext-1',
                documentDate: 20240115,
                dueDate: 20240130,
                quantity: 5,
            },
        });

        expect(result).toBe('new-invoice-ext-id-2');
    });

    test('should throw KeezApiError on validation error', async () => {
        nock(STAGING_DOMAIN)
            .post('/api/v1.0/public-api/test-client-eid/invoices')
            .reply(400, { Message: 'Validation failed' });

        await expect(apiCreateInvoice({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
            invoice: {
                series: 'PDI',
                currencyCode: 'RON',
                amount: -100,
                paymentType: PaymentType.BANK_TRANSFER,
                partner: {
                    addressDetails: 'Test Address',
                    cityName: 'Bucharest',
                    countryCode: 'RO',
                    countryName: 'Romania',
                    countyCode: 'RO.B',
                    countyName: 'Bucharest',
                    identificationNumber: '',
                    isLegalPerson: false,
                    partnerName: '',
                },
                itemId: '',
            },
        })).rejects.toThrow(KeezApiError);
    });
});

describe('apiSendInvoice', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    test('should send invoice email successfully', async () => {
        nock(STAGING_DOMAIN)
            .post('/api/v1.0/public-api/invoices/delivery')
            .reply(200);

        const result = await apiSendInvoice({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            bearerToken: 'test-token',
            clientMail: 'test@example.com',
            invoiceId: 'invoice-ext-1',
        });

        expect(result).toBe('SENT');
    });

    test('should throw KeezApiError on send failure', async () => {
        nock(STAGING_DOMAIN)
            .post('/api/v1.0/public-api/invoices/delivery')
            .reply(500, { error: 'Email service unavailable' });

        await expect(apiSendInvoice({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            bearerToken: 'test-token',
            clientMail: 'test@example.com',
            invoiceId: 'invoice-ext-1',
        })).rejects.toThrow(KeezApiError);
    });
});

describe('apiValidateInvoice', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    test('should validate invoice successfully', async () => {
        nock(STAGING_DOMAIN)
            .post('/api/v1.0/public-api/test-client-eid/invoices/valid')
            .reply(200);

        const result = await apiValidateInvoice({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
            invoiceId: 'invoice-ext-1',
        });

        expect(result).toBe('VALIDATED');
    });

    test('should throw KeezApiError on validation failure', async () => {
        nock(STAGING_DOMAIN)
            .post('/api/v1.0/public-api/test-client-eid/invoices/valid')
            .reply(400, { Message: 'Invoice cannot be validated' });

        await expect(apiValidateInvoice({
            baseDomain: STAGING_DOMAIN,
            appId: 'test-app-id',
            appClientId: 'test-client-eid',
            bearerToken: 'test-token',
            invoiceId: 'invalid-invoice',
        })).rejects.toThrow(KeezApiError);
    });
});

describe('KeezApi integration tests', () => {
    let keezApi: KeezApi;

    beforeEach(() => {
        keezApi = new KeezApi({
            application_id: 'test-app-id',
            client_eid: 'test-client-eid',
            secret: 'test-secret',
            live: false,
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    test('should auto-refresh token when expired', async () => {
        // Mock token generation
        nock(STAGING_DOMAIN)
            .post('/idp/connect/token')
            .reply(200, {
                access_token: 'fresh-token',
                expires_in: 3600,
                token_type: 'Bearer',
                scope: 'public-api',
            });

        // Mock get all invoices
        nock(STAGING_DOMAIN)
            .get('/api/v1.0/public-api/test-client-eid/invoices')
            .reply(200, {
                first: 0,
                last: 0,
                recordsCount: 0,
                data: [],
            });

        const result = await keezApi.getAllInvoices();
        expect(result.recordsCount).toBe(0);
    });

    test('should create and validate invoice flow', async () => {
        // Mock token generation
        nock(STAGING_DOMAIN)
            .post('/idp/connect/token')
            .reply(200, {
                access_token: 'test-token',
                expires_in: 3600,
                token_type: 'Bearer',
                scope: 'public-api',
            });

        // Mock create invoice
        nock(STAGING_DOMAIN)
            .post('/api/v1.0/public-api/test-client-eid/invoices')
            .reply(201, { externalId: 'created-invoice-id' });

        const invoiceId = await keezApi.createInvoice({
            series: 'PDI',
            currencyCode: 'RON',
            amount: 100,
            paymentType: PaymentType.MEAL_VOUCHER,
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
            itemId: 'item-ext-1',
        });

        expect(invoiceId).toBe('created-invoice-id');

        // Mock validate invoice (reuse token)
        nock(STAGING_DOMAIN)
            .post('/api/v1.0/public-api/test-client-eid/invoices/valid')
            .reply(200);

        const validateResult = await keezApi.validateInvoice('created-invoice-id');
        expect(validateResult).toBe('VALIDATED');
    });
});
