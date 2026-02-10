import { AxiosInstance } from 'axios';
import { KeezConstructor } from './config/constructorParam';
import { apiGenerateToken } from './api/authorise';
import { apiGetAllInvoices } from './api/invoices/getAll';
import { apiGetInvoiceByExternalId } from './api/invoices/view';
import { apiSendInvoice } from './api/invoices/sendMail';
import { InvoiceRequest } from './dto/createInvoiceRequest';
import { apiCreateInvoice } from './api/invoices/create';
import { apiValidateInvoice } from './api/invoices/validate';
import { apiUpdateInvoice } from './api/invoices/update';
import { apiDeleteInvoice } from './api/invoices/delete';
import { apiSubmitEfactura } from './api/invoices/submitEfactura';
import { apiCancelInvoice } from './api/invoices/cancel';
import { apiDownloadInvoicePdf } from './api/invoices/downloadPdf';
import { AuthResponse } from './dto/authResponse';
import { InvoiceFilterParams, InvoiceRequestV2, SendInvoiceEmailParams } from './dto/invoices';
import { apiGetAllItems, apiGetItemById, apiCreateItem, apiUpdateItem, apiPatchItem } from './api/items';
import {
    AllItemsResponse,
    CreateItemRequest,
    ItemFilterParams,
    ItemResponse,
    PatchItemRequest,
    UpdateItemRequest,
} from './dto/items';
import { KeezLogger, noopLogger } from './helpers/keezLogger';
import { createHttpClient } from './http/createHttpClient';

export class KeezApi {
    private readonly appId: string;
    private readonly apiSecret: string;
    private readonly apiClientId: string;
    private authResponse: AuthResponse | null = null;
    private authToken: string | null = null;
    private isLive: boolean;
    private readonly logger: KeezLogger;
    private readonly httpClient: AxiosInstance;
    private refreshPromise: Promise<void> | null = null;

    public readonly invoices: InvoiceClient;
    public readonly items: ItemClient;

    constructor(params: KeezConstructor) {
        this.appId = params.applicationId;
        this.apiSecret = params.secret;
        this.apiClientId = params.clientEid;
        this.isLive = params.live;
        this.logger = params.logger ?? noopLogger;
        this.httpClient = createHttpClient({
            logger: this.logger,
            maxRetries: params.maxRetries,
        });
        this.invoices = new InvoiceClient(this);
        this.items = new ItemClient(this);
    }

    /**
     * Get the base domain for the API
     */
    public getBaseDomain(): string {
        return this.isLive ? 'https://app.keez.ro' : 'https://staging.keez.ro';
    }

    /**
     * Set live mode. Clears any cached auth tokens to prevent
     * a staging token from being used against production.
     */
    public setLive(mode: boolean) {
        if (this.isLive !== mode) {
            this.isLive = mode;
            this.authResponse = null;
            this.authToken = null;
        }
    }

    /** @internal */
    async ensureValidToken(): Promise<string> {
        if (!this.authToken || !this.authResponse || this.authResponse.expires_at < Date.now()) {
            this.logger.info('Token is invalid or expired, refreshing');
            await this.refreshToken();
        }
        return this.authToken!;
    }

    private async refreshToken(): Promise<void> {
        // Mutex: if a refresh is already in progress, wait for it instead of firing another
        if (this.refreshPromise) {
            await this.refreshPromise;
            return;
        }

        this.refreshPromise = this.doRefreshToken();
        try {
            await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    }

    private async doRefreshToken(): Promise<void> {
        const authResponse = await apiGenerateToken({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            apiSecret: this.apiSecret,
            logger: this.logger,
        });
        this.authResponse = authResponse;
        this.authToken = authResponse.access_token;
    }

    /** @internal */
    getCommonParams() {
        return {
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken!,
            httpClient: this.httpClient,
            logger: this.logger,
        };
    }

    // ==================== INVOICE METHODS (kept for backward compatibility) ====================

    public async getAllInvoices(params?: InvoiceFilterParams) {
        await this.ensureValidToken();
        return apiGetAllInvoices({
            ...this.getCommonParams(),
            filterParams: params,
        });
    }

    public async getInvoiceByExternalId(invoiceExternalId: string) {
        await this.ensureValidToken();
        return apiGetInvoiceByExternalId({
            ...this.getCommonParams(),
            invoiceId: invoiceExternalId,
        });
    }

    public async sendInvoice(email: string, invoiceExternalId: string): Promise<string>;
    public async sendInvoice(emailParams: SendInvoiceEmailParams, invoiceExternalId: string): Promise<string>;
    public async sendInvoice(
        emailOrParams: string | SendInvoiceEmailParams,
        invoiceExternalId: string
    ): Promise<string> {
        await this.ensureValidToken();
        if (typeof emailOrParams === 'string') {
            return apiSendInvoice({
                ...this.getCommonParams(),
                clientMail: emailOrParams,
                invoiceId: invoiceExternalId,
            });
        }
        return apiSendInvoice({
            ...this.getCommonParams(),
            emailParams: emailOrParams,
            invoiceId: invoiceExternalId,
        });
    }

    /**
     * Create a new invoice. Accepts both v1 (single-item) and v2 (multi-item) formats.
     * @deprecated Use `InvoiceRequestV2` with the `items` array for new code.
     */
    public async createInvoice(invoiceParams: InvoiceRequest): Promise<string>;
    public async createInvoice(invoiceParams: InvoiceRequestV2): Promise<string>;
    public async createInvoice(invoiceParams: InvoiceRequest | InvoiceRequestV2) {
        await this.ensureValidToken();
        return apiCreateInvoice({
            ...this.getCommonParams(),
            invoice: invoiceParams,
        });
    }

    public async validateInvoice(invoiceExternalId: string) {
        await this.ensureValidToken();
        return apiValidateInvoice({
            ...this.getCommonParams(),
            invoiceId: invoiceExternalId,
        });
    }

    public async updateInvoice(invoiceId: string, invoice: InvoiceRequestV2): Promise<void> {
        await this.ensureValidToken();
        return apiUpdateInvoice({
            ...this.getCommonParams(),
            invoiceId,
            invoice,
        });
    }

    public async deleteInvoice(invoiceId: string): Promise<void> {
        await this.ensureValidToken();
        return apiDeleteInvoice({
            ...this.getCommonParams(),
            invoiceId,
        });
    }

    public async submitInvoiceToEfactura(invoiceId: string): Promise<string> {
        await this.ensureValidToken();
        return apiSubmitEfactura({
            ...this.getCommonParams(),
            invoiceId,
        });
    }

    public async cancelInvoice(invoiceId: string): Promise<void> {
        await this.ensureValidToken();
        return apiCancelInvoice({
            ...this.getCommonParams(),
            invoiceId,
        });
    }

    public async downloadInvoicePdf(invoiceId: string): Promise<Buffer> {
        await this.ensureValidToken();
        return apiDownloadInvoicePdf({
            ...this.getCommonParams(),
            invoiceId,
        });
    }

    // ==================== ITEM METHODS (kept for backward compatibility) ====================

    public async getAllItems(params?: ItemFilterParams): Promise<AllItemsResponse> {
        await this.ensureValidToken();
        return apiGetAllItems({
            ...this.getCommonParams(),
            filterParams: params,
        });
    }

    public async getItemByExternalId(itemId: string): Promise<ItemResponse> {
        await this.ensureValidToken();
        return apiGetItemById({
            ...this.getCommonParams(),
            itemId,
        });
    }

    public async createItem(item: CreateItemRequest): Promise<string> {
        await this.ensureValidToken();
        return apiCreateItem({
            ...this.getCommonParams(),
            item,
        });
    }

    public async updateItem(itemId: string, item: UpdateItemRequest): Promise<void> {
        await this.ensureValidToken();
        return apiUpdateItem({
            ...this.getCommonParams(),
            itemId,
            item,
        });
    }

    public async patchItem(itemId: string, item: PatchItemRequest): Promise<void> {
        await this.ensureValidToken();
        return apiPatchItem({
            ...this.getCommonParams(),
            itemId,
            item,
        });
    }
}

// ==================== RESOURCE-SCOPED SUB-CLIENTS ====================

class InvoiceClient {
    constructor(private readonly api: KeezApi) {}

    async getAll(params?: InvoiceFilterParams) {
        return this.api.getAllInvoices(params);
    }

    async getById(invoiceExternalId: string) {
        return this.api.getInvoiceByExternalId(invoiceExternalId);
    }

    async create(invoiceParams: InvoiceRequest): Promise<string>;
    async create(invoiceParams: InvoiceRequestV2): Promise<string>;
    async create(invoiceParams: InvoiceRequest | InvoiceRequestV2) {
        return this.api.createInvoice(invoiceParams as InvoiceRequest);
    }

    async update(invoiceId: string, invoice: InvoiceRequestV2): Promise<void> {
        return this.api.updateInvoice(invoiceId, invoice);
    }

    async delete(invoiceId: string): Promise<void> {
        return this.api.deleteInvoice(invoiceId);
    }

    async validate(invoiceExternalId: string) {
        return this.api.validateInvoice(invoiceExternalId);
    }

    async cancel(invoiceId: string): Promise<void> {
        return this.api.cancelInvoice(invoiceId);
    }

    async submitEfactura(invoiceId: string): Promise<string> {
        return this.api.submitInvoiceToEfactura(invoiceId);
    }

    async sendEmail(email: string, invoiceExternalId: string): Promise<string>;
    async sendEmail(emailParams: SendInvoiceEmailParams, invoiceExternalId: string): Promise<string>;
    async sendEmail(emailOrParams: string | SendInvoiceEmailParams, invoiceExternalId: string): Promise<string> {
        return this.api.sendInvoice(emailOrParams as string, invoiceExternalId);
    }

    async downloadPdf(invoiceId: string): Promise<Buffer> {
        return this.api.downloadInvoicePdf(invoiceId);
    }
}

class ItemClient {
    constructor(private readonly api: KeezApi) {}

    async getAll(params?: ItemFilterParams): Promise<AllItemsResponse> {
        return this.api.getAllItems(params);
    }

    async getById(itemId: string): Promise<ItemResponse> {
        return this.api.getItemByExternalId(itemId);
    }

    async create(item: CreateItemRequest): Promise<string> {
        return this.api.createItem(item);
    }

    async update(itemId: string, item: UpdateItemRequest): Promise<void> {
        return this.api.updateItem(itemId, item);
    }

    async patch(itemId: string, item: PatchItemRequest): Promise<void> {
        return this.api.patchItem(itemId, item);
    }
}
