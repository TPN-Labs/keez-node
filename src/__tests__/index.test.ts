// import nock = require('nock');
import { KeezApi } from '../keezApi';

describe('Public Keez API', () => {
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

    test('should generate a new token', async () => {
        expect(true).toBeTruthy(); // TODO: Implement
    });

    test('should change the live mode', () => {
        keezApi.setLive(false);
        expect(keezApi.getBaseDomain())
            .toBe('https://staging.keez.ro');
    });
});
