import { PaginationParams } from '@/dto/common/paginationParams';

export interface InvoiceFilterParams extends PaginationParams {
    readonly status?: string;
    readonly fromDate?: number;
    readonly toDate?: number;
    readonly series?: string;
    readonly partnerName?: string;
}
