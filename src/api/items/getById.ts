import axios, { AxiosInstance } from 'axios';
import { ItemResponse } from '@/dto/items';
import { KeezApiError } from '@/errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface GetItemByIdParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly itemId: string;
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

export async function apiGetItemById(params: GetItemByIdParams): Promise<ItemResponse> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items/${params.itemId}`;

    try {
        const response = await client.get<ApiItemResponse>(url, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        const item = response.data;
        return {
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
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error getting item by ID (${params.itemId}): ${safeStringify(errorMessage)}`);
            throw new KeezApiError(
                `Failed to get item by ID: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to get item by ID: ${safeStringify(error)}`, undefined, error);
    }
}
