import axios, { AxiosInstance } from 'axios';
import { PatchItemRequest } from '@/dto/items';
import { KeezApiError } from '@/errors/KeezError';
import { HTTP_REQUEST_TIMEOUT_MS } from '@/config/constants';
import { KeezLogger, noopLogger } from '@/helpers/keezLogger';
import { safeStringify } from '@/helpers/safeStringify';

interface PatchItemParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly itemId: string;
    readonly item: PatchItemRequest;
    readonly httpClient?: AxiosInstance;
    readonly logger?: KeezLogger;
}

export async function apiPatchItem(params: PatchItemParams): Promise<void> {
    const log = params.logger ?? noopLogger;
    const client = params.httpClient ?? axios;
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
        await client.patch(url, patchBody, {
            headers: {
                Authorization: `Bearer ${params.bearerToken}`,
                'Content-Type': 'application/json',
            },
            timeout: HTTP_REQUEST_TIMEOUT_MS,
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data || error.message;
            log.error(`Error patching item (${params.itemId}): ${safeStringify(errorMessage)}`);
            throw new KeezApiError(
                `Failed to patch item: ${safeStringify(errorMessage)}`,
                error.response?.status,
                error
            );
        }
        throw new KeezApiError(`Failed to patch item: ${safeStringify(error)}`, undefined, error);
    }
}
