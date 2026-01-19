export interface SendInvoiceEmailParams {
    readonly to: string;
    readonly cc?: string[];
    readonly bcc?: string[];
}
