export interface ShortInvoiceResponse {
    readonly externalId: string;
    readonly series: string;
    readonly number: number;
    readonly documentDate: number;
    readonly dueDate: number;
    readonly status: string;
    readonly clientName: string;
    readonly partnerName: string;
    readonly currencyCode: string;
    readonly referenceCurrencyCode: string;
    readonly netAmount: number;
    readonly vatAmount: number;
    readonly grossAmount: number;
}

export interface AllInvoicesResponse {
    readonly first: number;
    readonly last: number;
    readonly recordsCount: number;
    readonly data: ShortInvoiceResponse[];
}
