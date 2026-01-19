export interface ItemResponse {
    readonly externalId: string;
    readonly itemName: string;
    readonly itemCode: string;
    readonly itemDescription: string;
    readonly measureUnitId: number;
    readonly measureUnitName: string;
    readonly unitPrice: number;
    readonly vatPercent: number;
    readonly vatCategoryCode: string;
    readonly vatExemptionReason: string;
    readonly isActive: boolean;
    readonly createdAt: number;
    readonly updatedAt: number;
}
