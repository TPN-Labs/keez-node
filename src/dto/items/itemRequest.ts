import { MeasureUnit } from '@/config/measureUnit';

export interface CreateItemRequest {
    readonly itemName: string;
    readonly itemCode?: string;
    readonly itemDescription?: string;
    readonly measureUnitId: MeasureUnit;
    readonly unitPrice: number;
    readonly vatPercent: number;
    readonly vatCategoryCode?: string;
    readonly vatExemptionReason?: string;
    readonly isActive?: boolean;
}

/** Full replacement update -- same shape as CreateItemRequest */
export type UpdateItemRequest = CreateItemRequest;

export interface PatchItemRequest {
    readonly itemName?: string;
    readonly itemCode?: string;
    readonly itemDescription?: string;
    readonly measureUnitId?: MeasureUnit;
    readonly unitPrice?: number;
    readonly vatPercent?: number;
    readonly vatCategoryCode?: string;
    readonly vatExemptionReason?: string;
    readonly isActive?: boolean;
}
