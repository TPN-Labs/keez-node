import axios, { AxiosInstance } from 'axios';
import { UpdateItemRequest } from '@/dto/items';
import { KeezApiError } from '@/errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface UpdateItemParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly itemId: string;
    readonly item: UpdateItemRequest;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
}

export async function apiUpdateItem(params: UpdateItemParams): Promise<void> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items/${params.itemId}`;

    const body = {
        itemName: params.item.itemName,
        itemCode: params.item.itemCode,
        itemDescription: params.item.itemDescription,
        measureUnitId: params.item.measureUnitId,
        unitPrice: params.item.unitPrice,
        vatPercent: params.item.vatPercent,
        vatCategoryCode: params.item.vatCategoryCode,
        vatExemptionReason: params.item.vatExemptionReason,
        isActive: params.item.isActive,
    };

    try {
        await client.put(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error updating item (${params.itemId}): ${safeStringify(errorMessage)}`);
            throw new KeezApiError(
                `Failed to update item: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to update item: ${safeStringify(error)}`, undefined, error);
    }
}
