import { KeezConstructor } from './config/constructorParam';
import { apiGenerateToken } from './api/authorise';
import { apiGetAllInvoices } from './api/invoices/getAll';
import { apiGetInvoiceByExternalId } from './api/invoices/view';
import { apiSendInvoice } from './api/invoices/sendMail';
import { InvoiceRequest } from './dto/createInvoiceRequest';
import { apiCreateInvoice } from './api/invoices/create';
import { apiValidateInvoice } from './api/invoices/validate';
import { AuthResponse } from './dto/authResponse';
import { logger } from './helpers/logger';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Main' });

export class KeezApi {
    private readonly appId: string;
    private readonly apiSecret: string;
    private readonly apiClientId: string;
    private readonly apiUser: string;
    private readonly authResponse: AuthResponse;
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

    private async checkIfTokenIsValid() {
        if (!this.authToken || !this.authResponse || this.authResponse.expires_at < Date.now()) {
            keezLogger.info('Token is invalid, generating a new one');
            await this.generateToken();
        }
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
        await this.checkIfTokenIsValid();
        return apiGetAllInvoices({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
        });
    }

    public async getInvoiceByExternalId(invoiceExternalId: string) {
        await this.checkIfTokenIsValid();
        return apiGetInvoiceByExternalId({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            invoiceId: invoiceExternalId,
        });
    }

    public async sendInvoice(email: string, invoiceExternalId: string) {
        await this.checkIfTokenIsValid();
        return apiSendInvoice({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            bearerToken: this.authToken,
            clientMail: email,
            invoiceId: invoiceExternalId,
        });
    }

    public async createInvoice(invoiceParams: InvoiceRequest) {
        await this.checkIfTokenIsValid();
        return apiCreateInvoice({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            invoice: invoiceParams,
        });
    }

    public async validateInvoice(invoiceExternalId: string) {
        await this.checkIfTokenIsValid();
        return apiValidateInvoice({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            invoiceId: invoiceExternalId,
        });
    }
}
