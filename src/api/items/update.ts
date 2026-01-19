import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { UpdateItemRequest } from '../../dto/items';
import { KeezApiError } from '../../errors/KeezError';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Items' });

interface UpdateItemParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly itemId: string;
    readonly item: UpdateItemRequest;
}

export async function apiUpdateItem(params: UpdateItemParams): Promise<void> {
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
        await axios.put(url, body, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(`Error encountered while updating item (${params.itemId}): ${JSON.stringify(errorMessage)}`);
        throw new KeezApiError(
            `Failed to update item: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
