import axios, { AxiosInstance } from 'axios';
import { AllItemsResponse, ItemFilterParams, ItemResponse } from '@/dto/items';
import { KeezApiError } from '@/errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface GetAllItemsParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly filterParams?: ItemFilterParams;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
}

interface ApiItemResponse {
    externalId: string;
    itemName: string;
    itemCode: string;
    itemDescription: string;
    measureUnitId: number;
    measureUnitName: string;
    unitPrice: number;
    vatPercent: number;
    vatCategoryCode: string;
    vatExemptionReason: string;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}

interface ApiAllItemsResponse {
    first: number;
    last: number;
    recordsCount: number;
    data: ApiItemResponse[];
}

export async function apiGetAllItems(params: GetAllItemsParams): Promise<AllItemsResponse> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
    let url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items`;

    if (params.filterParams) {
        const queryParams = new URLSearchParams();
        if (params.filterParams.offset !== undefined) {
            queryParams.append('offset', params.filterParams.offset.toString());
        }
        if (params.filterParams.count !== undefined) {
            queryParams.append('count', params.filterParams.count.toString());
        }
        if (params.filterParams.itemName) {
            queryParams.append('itemName', params.filterParams.itemName);
        }
        if (params.filterParams.itemCode) {
            queryParams.append('itemCode', params.filterParams.itemCode);
        }
        if (params.filterParams.isActive !== undefined) {
            queryParams.append('isActive', params.filterParams.isActive.toString());
        }
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    try {
        const response = await client.get<ApiAllItemsResponse>(url, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        const responseObject = response.data;
        const allItems: ItemResponse[] = responseObject.data.map(item => ({
            externalId: item.externalId,
            itemName: item.itemName,
            itemCode: item.itemCode,
            itemDescription: item.itemDescription,
            measureUnitId: item.measureUnitId,
            measureUnitName: item.measureUnitName,
            unitPrice: item.unitPrice,
            vatPercent: item.vatPercent,
            vatCategoryCode: item.vatCategoryCode,
            vatExemptionReason: item.vatExemptionReason,
            isActive: item.isActive,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));

        return {
            first: responseObject.first,
            last: responseObject.last,
            recordsCount: responseObject.recordsCount,
            data: allItems,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error getting all items: ${safeStringify(errorMessage)}`);
            throw new KeezApiError(
                `Failed to get all items: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to get all items: ${safeStringify(error)}`, undefined, error);
    }
}
