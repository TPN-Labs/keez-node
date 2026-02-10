import axios, { AxiosInstance } from 'axios';
import { CreateItemRequest } from '@/dto/items';
import { KeezApiError } from '@/errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface CreateItemParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly item: CreateItemRequest;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
}

interface CreateItemResponse {
    externalId: string;
}

export async function apiCreateItem(params: CreateItemParams): Promise<string> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items`;

    const body = {
        itemName: params.item.itemName,
        itemCode: params.item.itemCode,
        itemDescription: params.item.itemDescription,
        measureUnitId: params.item.measureUnitId,
        unitPrice: params.item.unitPrice,
        vatPercent: params.item.vatPercent,
        vatCategoryCode: params.item.vatCategoryCode,
        vatExemptionReason: params.item.vatExemptionReason,
        isActive: params.item.isActive ?? true,
    };

    try {
        const response = await client.post<CreateItemResponse>(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });

        return response.data.externalId;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error creating item: ${safeStringify(errorMessage)}`);
            throw new KeezApiError(
                `Failed to create item: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to create item: ${safeStringify(error)}`, undefined, error);
    }
}
