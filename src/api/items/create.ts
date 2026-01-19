import request = require('request');
import { logger } from '../../helpers/logger';
import { CreateItemRequest } from '../../dto/items';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Items' });

interface CreateItemParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly item: CreateItemRequest;
}

export async function apiCreateItem(params: CreateItemParams): Promise<string> {
    const options = {
        method: 'POST',
        url: `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items`,
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
            isActive: params.item.isActive ?? true,
        },
        json: true,
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || body?.Message;
            if (error || response.statusCode !== 201) {
                keezLogger.error(`Error encountered while creating item: ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            resolve(body.externalId);
        });
    });
}
