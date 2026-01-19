import request = require('request');
import { logger } from '../../helpers/logger';
import { UpdateItemRequest } from '../../dto/items';

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
    const options = {
        method: 'PUT',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items/${params.itemId}`,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
        body: {
            itemName: params.item.itemName,
            itemCode: params.item.itemCode,
            itemDescription: params.item.itemDescription,
            measureUnitId: params.item.measureUnitId,
            unitPrice: params.item.unitPrice,
            vatPercent: params.item.vatPercent,
            vatCategoryCode: params.item.vatCategoryCode,
            vatExemptionReason: params.item.vatExemptionReason,
            isActive: params.item.isActive,
        },
        json: true,
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || body?.Message;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while updating item (${params.itemId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve();
        });
    });
}
