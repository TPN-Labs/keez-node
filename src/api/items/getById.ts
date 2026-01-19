import request = require('request');
import { logger } from '../../helpers/logger';
import { ItemResponse } from '../../dto/items';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Items' });

interface GetItemByIdParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly itemId: string;
}

export async function apiGetItemById(params: GetItemByIdParams): Promise<ItemResponse> {
    const options = {
        method: 'GET',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items/${params.itemId}`,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || response.body;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while getting item by ID (${params.itemId}): ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            const item = JSON.parse(body);
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
            resolve(result);
        });
    });
}
