// import nock = require('nock');
import { KeezApi } from '../../keezApi';

describe('Keez API authorisation', () => {
    let keezApi: KeezApi;

    beforeAll(() => {
        keezApi = new KeezApi({
            application_id: '123',
            client_eid: '123',
            secret: '123',
            user: '123',
            live: true,
        });
    });

    /* test('should generate a new token', async () => {
        const result = await keezApi.createInvoice({
            amount: 400,
            currencyCode: 'RON',
            itemId: '123',
            partner: {
                isLegalPerson: false,
                partnerName: 'Marian Ion',
                countryName: 'Romania',
                countryCode: 'RO',
                countyCode: 'RO.B',
                countyName: 'Bucuresti',
                addressDetails: 'Strada Testez nr. 4',
                cityName: 'Timisoara',
                identificationNumber: '1234',
            },
            paymentType: 10,
            series: 'PDI',
        });
        console.log('result is');
        console.log(result);
        expect(result).toBeTruthy();
    });

    test('should generate a new token', async () => {
        const result = await keezApi.validateInvoice('f28730f84ed04613a36583e8c2a755c3');
        console.log('result is');
        console.log(result);
        expect(result).toBeTruthy();
    });  */

    test('should change the live mode', () => {
        keezApi.setLive(false);
        expect(keezApi.getBaseDomain())
            .toBe('https://staging.keez.ro');
    });
});
