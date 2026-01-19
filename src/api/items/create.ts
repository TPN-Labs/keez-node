import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { CreateItemRequest } from '../../dto/items';
import { KeezApiError } from '../../errors/KeezError';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Items' });

interface CreateItemParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly item: CreateItemRequest;
}

interface CreateItemResponse {
    externalId: string;
}

export async function apiCreateItem(params: CreateItemParams): Promise<string> {
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
        const response = await axios.post<CreateItemResponse>(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        return response.data.externalId;
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(`Error encountered while creating item: ${JSON.stringify(errorMessage)}`);
        throw new KeezApiError(
            `Failed to create item: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
