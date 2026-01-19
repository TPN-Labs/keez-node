import axios, { AxiosError } from 'axios';
import { logger } from '../../helpers/logger';
import { PatchItemRequest } from '../../dto/items';
import { KeezApiError } from '../../errors/KeezError';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Items' });

interface PatchItemParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly itemId: string;
    readonly item: PatchItemRequest;
}

export async function apiPatchItem(params: PatchItemParams): Promise<void> {
    const url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items/${params.itemId}`;

    const patchBody: Record<string, unknown> = {};
    if (params.item.itemName !== undefined) patchBody.itemName = params.item.itemName;
    if (params.item.itemCode !== undefined) patchBody.itemCode = params.item.itemCode;
    if (params.item.itemDescription !== undefined) patchBody.itemDescription = params.item.itemDescription;
    if (params.item.measureUnitId !== undefined) patchBody.measureUnitId = params.item.measureUnitId;
    if (params.item.unitPrice !== undefined) patchBody.unitPrice = params.item.unitPrice;
    if (params.item.vatPercent !== undefined) patchBody.vatPercent = params.item.vatPercent;
    if (params.item.vatCategoryCode !== undefined) patchBody.vatCategoryCode = params.item.vatCategoryCode;
    if (params.item.vatExemptionReason !== undefined) patchBody.vatExemptionReason = params.item.vatExemptionReason;
    if (params.item.isActive !== undefined) patchBody.isActive = params.item.isActive;

    try {
        await axios.patch(url, patchBody, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        keezLogger.error(`Error encountered while patching item (${params.itemId}): ${JSON.stringify(errorMessage)}`);
        throw new KeezApiError(
            `Failed to patch item: ${JSON.stringify(errorMessage)}`,
            axiosError.response?.status,
            error
        );
    }
}
