import { APIGatewayProxyHandler } from "aws-lambda";
import { response } from "../helpers/response";
import { uuid } from "uuidv4";
import { db } from "../helpers/aws";

export const getRestaurantsWithPagination: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || 'null') || {};

        const restaurants = await db
            .scan({
                TableName: 'Restaurants',
                Limit: body.Limit,
                ExclusiveStartKey: body.LastEvaluatedKey
            }).promise();

        return response(200, restaurants);
    } catch (e) {
        return response(500, { message: e.message });
    }
}

export const getDishesByNameDynamo: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || 'null') || {};

        const dishes = await db
            .query({
                TableName: 'Dishes',
                IndexName: 'DishNameIndex',
                KeyConditionExpression: '#Name = :Name',
                ExpressionAttributeValues: {':Name': body.Name},
                ExpressionAttributeNames: {'#Name':'Name'}
            }).promise();

        return response(200, dishes);
    } catch (e) {
        return response(500, { message: e.message });
    }
}

export const getRestaurantWithDishesDynamo: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || 'null') || {};
        const { Id, Type } = body;

        // complicated query because of having aws-reserved attribute names
        // const restaurant = await db.query({
        //     TableName: 'Restaurants',
        //     KeyConditionExpression: 'Id = :Id and #dynamodbReservedWorldConflictType = :Type',
        //     ExpressionAttributeValues: {':Id': Id, ':Type': Type},
        //     ProjectionExpression: '#dynamodbReservedWorldConflictType, Id, #dynamodbReservedWorldConflictName, Address, PreviewLink, Likes',
        //     ExpressionAttributeNames: {'#dynamodbReservedWorldConflictType': 'Type', '#dynamodbReservedWorldConflictName': 'Name'}
        // }).promise();

        const restaurant = await db.get({
            TableName: 'Restaurants',
            Key: { Id, Type }
        }).promise();

        const allDishesOfRestaurant = await db.query({
            TableName: 'Dishes',
            KeyConditionExpression: 'RestaurantId = :RestaurantId',
            ExpressionAttributeValues: {':RestaurantId': Id},
        }).promise();

        const result = restaurant.Item
            ? {...restaurant.Item, dishes: allDishesOfRestaurant.Items}
            : {};

        return response(200, result);
    } catch (e) {
        return response(500, { message: e.message });
    }
}

export const getDishesOfRestaurantDynamo: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || 'null') || {};
        const allDishesOfRestaurant = await db.query({
            TableName: 'Dishes',
            KeyConditionExpression: 'RestaurantId = :RestaurantId',
            ExpressionAttributeValues: {':RestaurantId': body.RestaurantId}
        }).promise();

        return response(200, allDishesOfRestaurant.Items);
    } catch (e) {
        return response(500, { message: e.message });
    }
}

export const addRestaurantDynamo: APIGatewayProxyHandler = async (event) => {
    try {
        const Id = uuid();
        const result = await db.put({
            TableName: 'Restaurants',
            Item: {
                Id,
                Type: 'bar',
                Name: 'Top bar',
                Address: 'Kharkov',
                PreviewLink: 's3:/',
                Likes: 23
            },
            ReturnConsumedCapacity: 'TOTAL'
        }).promise();

        return response(201, result.ConsumedCapacity?.CapacityUnits);
    } catch (e) {
        return response(500, {message: e.message});
    }
}

export const addDishesForRestaurantDynamo: APIGatewayProxyHandler = async (event) => {
    try {
        const RestaurantId = uuid();
        // limit 25 per request
        const writeBatch = await db.batchWrite({
            ReturnConsumedCapacity: 'TOTAL',
            RequestItems: {
                'Dishes': [
                    {PutRequest: {
                            Item: {
                                RestaurantId,
                                Id: uuid(),
                                Name: 'Olive',
                                Created: Math.floor(Date.now() / 1000),
                                Description: 'top bludo',
                                previewLink: 's3:/',
                                Cost: 23
                            }
                        }},
                    {PutRequest: {
                            Item: {
                                RestaurantId,
                                Id: uuid(),
                                Name: 'Olive',
                                Created: Math.floor(Date.now() / 1000),
                                Description: 'top bludo',
                                previewLink: 's3:/',
                                Cost: 24
                            }
                        }},
                    {PutRequest: {
                            Item: {
                                RestaurantId,
                                Id: uuid(),
                                Name: 'Olive',
                                Created: Math.floor(Date.now() / 1000),
                                Description: 'top bludo',
                                previewLink: 's3:/',
                                Cost: 25
                            }
                        }},
                    {PutRequest: {
                            Item: {
                                RestaurantId,
                                Id: uuid(),
                                Name: 'Olive',
                                Created: Math.floor(Date.now() / 1000),
                                Description: 'top bludo',
                                previewLink: 's3:/',
                                Cost: 26
                            }
                        }},
                    {PutRequest: {
                            Item: {
                                RestaurantId,
                                Id: uuid(),
                                Name: 'Olive',
                                Created: Math.floor(Date.now() / 1000),
                                Description: 'top bludo',
                                previewLink: 's3:/',
                                Cost: 27
                            }
                        }},
                    {PutRequest: {
                            Item: {
                                RestaurantId,
                                Id: uuid(),
                                Name: 'Olive',
                                Created: Math.floor(Date.now() / 1000),
                                Description: 'top bludo',
                                previewLink: 's3:/',
                                Cost: 28
                            }
                        }},
                ]
            }
        }).promise();

        return response(201, writeBatch.ConsumedCapacity && writeBatch.ConsumedCapacity[0].CapacityUnits);
    } catch (e) {
        return response(500, { message: e.message });
    }
}

export const updateRestaurantDynamo: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || 'null') || {};
        const result = await db.update({
            TableName: 'Restaurants',
            Key: {
                Id: body.Id,
                Type: body.Type,
            },
            UpdateExpression: 'set Likes = :Likes',
            ExpressionAttributeValues: {':Likes': 777},
            ReturnConsumedCapacity: 'TOTAL'
        }).promise();

        return response(200, result.ConsumedCapacity?.CapacityUnits);
    } catch (e) {
        return response(500, { message: e.message });
    }
}

export const deleteDishesByRestaurantDynamo: APIGatewayProxyHandler = async (event) => {
    try {
        let count = 0;
        const body = JSON.parse(event.body || 'null') || {};
        const allDishesOfRestaurant = await db.query({
            TableName: 'Dishes',
            KeyConditionExpression: 'RestaurantId = :RestaurantId',
            ExpressionAttributeValues: {':RestaurantId': body.RestaurantId}
        }).promise();

        for (const {RestaurantId, Id} of allDishesOfRestaurant.Items || []) {
           const result = await db.delete({
                TableName: 'Dishes',
                Key: {
                    RestaurantId,
                    Id
                },
                ReturnConsumedCapacity: 'TOTAL'
            }).promise();

           count += Number(result.ConsumedCapacity?.CapacityUnits);
        }

        return response(200, count);
    } catch (e) {
        return response(500, { message: e.message });
    }
}

export const deleteRestaurantDynamo: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || 'null') || {};
        const result = await db.delete({
            TableName: 'Restaurants',
            Key: {
                Id: body.Id,
                Type: body.Type,
            },
            ReturnConsumedCapacity: 'TOTAL'
        }).promise();

        return response(200, result.ConsumedCapacity?.CapacityUnits);
    } catch (e) {
        return response(500, { message: e.message });
    }
}
