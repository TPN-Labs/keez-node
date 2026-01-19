import request = require('request');
import { logger } from '../../helpers/logger';
import { AllItemsResponse, ItemFilterParams, ItemResponse } from '../../dto/items';

const keezLogger = logger.child({ _library: 'KeezWrapper', _method: 'Items' });

interface GetAllItemsParams {
    readonly baseDomain: string;
    readonly appId: string;
    readonly appClientId: string;
    readonly bearerToken: string;
    readonly filterParams?: ItemFilterParams;
}

export async function apiGetAllItems(params: GetAllItemsParams): Promise<AllItemsResponse> {
    let url = `${params.baseDomain}/api/v1.0/public-api/${params.appClientId}/items`;

    if (params.filterParams) {
        const queryParams = new URLSearchParams();
        if (params.filterParams.offset !== undefined) {
            queryParams.append('offset', params.filterParams.offset.toString());
        }
        if (params.filterParams.count !== undefined) {
            queryParams.append('count', params.filterParams.count.toString());
        }
        if (params.filterParams.itemName) {
            queryParams.append('itemName', params.filterParams.itemName);
        }
        if (params.filterParams.itemCode) {
            queryParams.append('itemCode', params.filterParams.itemCode);
        }
        if (params.filterParams.isActive !== undefined) {
            queryParams.append('isActive', params.filterParams.isActive.toString());
        }
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    const options = {
        method: 'GET',
        url,
        headers: {
            Authorization: `Bearer ${params.bearerToken}`,
        },
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            const errorMessage = error || response.body;
            if (error || response.statusCode !== 200) {
                keezLogger.error(`Error encountered while getting all items: ${errorMessage}`);
                reject(errorMessage);
                throw new Error(errorMessage);
            }
            const responseObject = JSON.parse(body);
            const allItems: ItemResponse[] = responseObject.data.map((item: any) => ({
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
            }));
            const result: AllItemsResponse = {
                first: responseObject.first,
                last: responseObject.last,
                recordsCount: responseObject.recordsCount,
                data: allItems,
            };
            resolve(result);
        });
    });
}
