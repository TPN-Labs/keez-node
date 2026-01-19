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
import { logger } from './helpers/logger';
import { InvoiceFilterParams, InvoiceRequestV2, SendInvoiceEmailParams } from './dto/invoices';
import {
    apiGetAllItems,
    apiGetItemById,
    apiCreateItem,
    apiUpdateItem,
    apiPatchItem,
} from './api/items';
import {
    AllItemsResponse,
    CreateItemRequest,
    ItemFilterParams,
    ItemResponse,
    PatchItemRequest,
    UpdateItemRequest,
} from './dto/items';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Main' });

export class KeezApi {
    private readonly appId: string;
    private readonly apiSecret: string;
    private readonly apiClientId: string;
    private authResponse: AuthResponse | null = null;
    private authToken: string;
    private isLive: boolean;

    constructor(params: KeezConstructor) {
        this.appId = params.application_id;
        this.apiSecret = params.secret;
        this.apiClientId = params.client_eid;
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
        this.authResponse = authResponse;
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

    // ==================== INVOICE METHODS ====================

    /**
     * Get all invoices with optional filtering and pagination
     * @param params - Optional filter parameters
     */
    public async getAllInvoices(params?: InvoiceFilterParams) {
        await this.checkIfTokenIsValid();
        return apiGetAllInvoices({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            filterParams: params,
        });
    }

    /**
     * Get an invoice by its external ID
     * @param invoiceExternalId - The external ID of the invoice
     */
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

    /**
     * Send an invoice via email
     * @param email - The recipient email address
     * @param invoiceExternalId - The external ID of the invoice
     */
    public async sendInvoice(email: string, invoiceExternalId: string): Promise<string>;
    /**
     * Send an invoice via email with CC/BCC support
     * @param emailParams - Email parameters including to, cc, and bcc
     * @param invoiceExternalId - The external ID of the invoice
     */
    public async sendInvoice(emailParams: SendInvoiceEmailParams, invoiceExternalId: string): Promise<string>;
    public async sendInvoice(emailOrParams: string | SendInvoiceEmailParams, invoiceExternalId: string): Promise<string> {
        await this.checkIfTokenIsValid();
        if (typeof emailOrParams === 'string') {
            return apiSendInvoice({
                baseDomain: this.getBaseDomain(),
                appId: this.appId,
                bearerToken: this.authToken,
                clientMail: emailOrParams,
                invoiceId: invoiceExternalId,
            });
        }
        return apiSendInvoice({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            bearerToken: this.authToken,
            emailParams: emailOrParams,
            invoiceId: invoiceExternalId,
        });
    }

    /**
     * Create a new invoice
     * @param invoiceParams - The invoice parameters
     */
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

    /**
     * Validate an invoice
     * @param invoiceExternalId - The external ID of the invoice
     */
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

    /**
     * Update an existing invoice
     * @param invoiceId - The external ID of the invoice to update
     * @param invoice - The updated invoice data
     */
    public async updateInvoice(invoiceId: string, invoice: InvoiceRequestV2): Promise<void> {
        await this.checkIfTokenIsValid();
        return apiUpdateInvoice({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            invoiceId,
            invoice,
        });
    }

    /**
     * Delete an invoice
     * @param invoiceId - The external ID of the invoice to delete
     */
    public async deleteInvoice(invoiceId: string): Promise<void> {
        await this.checkIfTokenIsValid();
        return apiDeleteInvoice({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            invoiceId,
        });
    }

    /**
     * Submit an invoice to eFactura (Romanian electronic invoicing system)
     * @param invoiceId - The external ID of the invoice to submit
     * @returns The upload index or confirmation from eFactura
     */
    public async submitInvoiceToEfactura(invoiceId: string): Promise<string> {
        await this.checkIfTokenIsValid();
        return apiSubmitEfactura({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            invoiceId,
        });
    }

    /**
     * Cancel an invoice
     * @param invoiceId - The external ID of the invoice to cancel
     */
    public async cancelInvoice(invoiceId: string): Promise<void> {
        await this.checkIfTokenIsValid();
        return apiCancelInvoice({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            invoiceId,
        });
    }

    /**
     * Download an invoice as PDF
     * @param invoiceId - The external ID of the invoice
     * @returns Buffer containing the PDF data
     */
    public async downloadInvoicePdf(invoiceId: string): Promise<Buffer> {
        await this.checkIfTokenIsValid();
        return apiDownloadInvoicePdf({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            bearerToken: this.authToken,
            invoiceId,
        });
    }

    // ==================== ITEM METHODS ====================

    /**
     * Get all items with optional filtering and pagination
     * @param params - Optional filter parameters
     */
    public async getAllItems(params?: ItemFilterParams): Promise<AllItemsResponse> {
        await this.checkIfTokenIsValid();
        return apiGetAllItems({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            filterParams: params,
        });
    }

    /**
     * Get an item by its external ID
     * @param itemId - The external ID of the item
     */
    public async getItemByExternalId(itemId: string): Promise<ItemResponse> {
        await this.checkIfTokenIsValid();
        return apiGetItemById({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            itemId,
        });
    }

    /**
     * Create a new item
     * @param item - The item data to create
     * @returns The external ID of the created item
     */
    public async createItem(item: CreateItemRequest): Promise<string> {
        await this.checkIfTokenIsValid();
        return apiCreateItem({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            item,
        });
    }

    /**
     * Update an existing item (full replacement)
     * @param itemId - The external ID of the item to update
     * @param item - The updated item data
     */
    public async updateItem(itemId: string, item: UpdateItemRequest): Promise<void> {
        await this.checkIfTokenIsValid();
        return apiUpdateItem({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            itemId,
            item,
        });
    }

    /**
     * Partially update an existing item
     * @param itemId - The external ID of the item to patch
     * @param item - The fields to update
     */
    public async patchItem(itemId: string, item: PatchItemRequest): Promise<void> {
        await this.checkIfTokenIsValid();
        return apiPatchItem({
            baseDomain: this.getBaseDomain(),
            appId: this.appId,
            appClientId: this.apiClientId,
            bearerToken: this.authToken,
            itemId,
            item,
        });
    }
}
