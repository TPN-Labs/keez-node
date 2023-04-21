import { KeezConstructor } from './config/constructorParam';
import { apiGenerateToken } from './api/authorise';
import { apiGetAllInvoices } from './api/invoices';

export class KeezApi {
    private readonly appId: string;
    private readonly apiSecret: string;
    private readonly apiClientId: string;
    private readonly apiUser: string;
    private authToken: string;
    private isLive: boolean;

    constructor(params: KeezConstructor) {
        this.appId = params.application_id;
        this.apiSecret = params.secret;
        this.apiClientId = params.client_eid;
        this.apiUser = params.user;
        this.isLive = params.live;
    }

    /**
     * Get the base domain for the API
     * @returns {string} - The base domain
     */
    public getBaseDomain(): string {
        return this.isLive ? 'https://app.keez.ro' : 'https://staging.keez.ro';
    }

    private async generateToken() {
        const authResponse = await apiGenerateToken({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            apiSecret: this.apiSecret,
        });
        this.authToken = authResponse.access_token;
    }

    /**
     * Set live mode
     *
     * @param {boolean} mode - `False` will use the staging mode and `True` will use the production mode
     */
    public setLive(mode: boolean) {
        this.isLive = mode;
    }

    public async getAllInvoices() {
        await this.generateToken();
        await apiGetAllInvoices({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
        });
        console.log(this.authToken);
        return this.authToken;
    }
}
