import { PaginationParams } from '../common/paginationParams';
import { ItemResponse } from './itemResponse';

export interface ItemFilterParams extends PaginationParams {
    readonly itemName?: string;
    readonly itemCode?: string;
    readonly isActive?: boolean;
}

export interface AllItemsResponse {
    readonly first: number;
    readonly last: number;
    readonly recordsCount: number;
    readonly data: ItemResponse[];
}
