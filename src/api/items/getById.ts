import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { ItemResponse } from '../../dto/items';
import { KeezApiError } from '../../errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS } from '../../config/constants';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Items' });

interface GetItemByIdParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly itemId: string;
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
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items/${params.itemId}`;

    try {
        const response = await axios.get<ApiItemResponse>(url, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        const item = response.data;
        const result: ItemResponse = {
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
        return result;
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(
            `Error encountered while getting item by ID (${params.itemId}): ${JSON.stringify(errorMessage)}`
        );
        throw new KeezApiError(
            `Failed to get item by ID: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
