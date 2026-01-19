import request = require('request');
import { logger } from '../../helpers/logger';
import { PatchItemRequest } from '../../dto/items';

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
    const patchBody: Record<string, any> = {};

    if (params.item.itemName !== undefined) patchBody.itemName = params.item.itemName;
    if (params.item.itemCode !== undefined) patchBody.itemCode = params.item.itemCode;
    if (params.item.itemDescription !== undefined) patchBody.itemDescription = params.item.itemDescription;
    if (params.item.measureUnitId !== undefined) patchBody.measureUnitId = params.item.measureUnitId;
    if (params.item.unitPrice !== undefined) patchBody.unitPrice = params.item.unitPrice;
    if (params.item.vatPercent !== undefined) patchBody.vatPercent = params.item.vatPercent;
    if (params.item.vatCategoryCode !== undefined) patchBody.vatCategoryCode = params.item.vatCategoryCode;
    if (params.item.vatExemptionReason !== undefined) patchBody.vatExemptionReason = params.item.vatExemptionReason;
    if (params.item.isActive !== undefined) patchBody.isActive = params.item.isActive;

    const options = {
        method: 'PATCH',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items/${params.itemId}`,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
        body: patchBody,
        json: true,
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || body?.Message;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while patching item (${params.itemId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve();
        });
    });
}
