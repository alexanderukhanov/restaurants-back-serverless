import { APIGatewayProxyHandler } from "aws-lambda";
import { QueryTypes } from "sequelize";
import { loadSequelize } from "../db-connect";
import { response } from "../helpers/response";
import {
    createRestaurantValidation,
    deleteRestaurantValidation,
    updateRestaurantValidation
} from "../validations/restaurantValidation";
import { deleteFilesFromS3, saveFileFromBase64 } from "../helpers/aws";
import { createDishArrayValidation } from "../validations/dishValidation";
import { RestaurantInstance } from "../db/models/restaurant.model";

export const addRestaurant: APIGatewayProxyHandler = async (event) => {
    const {sequelizeDB, Restaurant, Dish} = await loadSequelize();

    try {
        const body = JSON.parse(event.body || 'null')  || {};
        const { restaurant, dishes } = body;
        const { type, address, name, likes, previewLink } = restaurant;

        const { error } = createRestaurantValidation(body.restaurant);

        const { error: dishValidationError } = createDishArrayValidation(dishes);

        if (dishValidationError && dishes.length) {
            return response(400, dishValidationError.message);
        }

        if (error) {
            return response(400, error.message);
        }

        const createdRestaurant = await Restaurant.create({
            type,
            address,
            name,
            previewLink: await saveFileFromBase64(previewLink, name),
            likes,
        }, {});

        if (!dishes.length) {
            return response(201, '');
        }

        const dishesToInsert = await Promise.all(dishes.map(async (dish) => ({
                ...dish,
                previewLink: await saveFileFromBase64(dish.previewLink, dish.name),
                restaurantId: createdRestaurant.id,
            }))
        );

        await Dish.bulkCreate(dishesToInsert);

        return response(201, 'fine');
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}

export const updateRestaurant: APIGatewayProxyHandler = async (event) => {
    const {sequelizeDB, Restaurant} = await loadSequelize();

    try {
        const body = JSON.parse(event.body || 'null')  || {};
        const { id } = body;
        const { error } = updateRestaurantValidation(body);

        if (error) {
            return response(400, error.message);
        }

        const restaurant = await Restaurant.findOne({ where: { id }});

        if (!restaurant) {
            return response(404, '');
        }

        const result = await Restaurant.update(body, {where: { id }});

        return response(200, result);
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}

export const updateRestaurantLike: APIGatewayProxyHandler = async (event) => {
    const {sequelizeDB, Restaurant, UserLikes} = await loadSequelize();

    try {
        const body = JSON.parse(event.body || 'null')  || {};
        const { id } = body;
        const userId: number = event.requestContext.authorizer?.lambda.userId;
        const { error } = updateRestaurantValidation(body);

        if (error) {
            return response(400, error.message);
        }

        const restaurant = await Restaurant.findOne({ where: { id }});

        if (!restaurant) {
            return response(404, '');
        }

        const userLikes = await UserLikes.findOne({where:{ userId, restaurantId: id }});

        if (!userLikes) {
            await Restaurant.update({...body, likes: restaurant.likes + 1 }, {where: { id }});
            await UserLikes.create({ userId, restaurantId: id });

            return response(200, '');
        } else {
            await Restaurant.update({...body, likes: restaurant.likes - 1 }, {where: { id }});
            await UserLikes.destroy({where: { userId, restaurantId: id }});

            return response(200, '');
        }
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}

export const deleteRestaurant: APIGatewayProxyHandler = async (event) => {
    const {sequelizeDB, Restaurant, Dish, UserLikes} = await loadSequelize();

    try {
        const id: string = event.pathParameters?.id || '';
        const { error } = deleteRestaurantValidation(id);

        if (error) {
            return response(400, error.message);
        }

        const restaurant = await Restaurant.findOne({ where: { id }});

        if (!restaurant) {
            return response(404, '');
        }

        await deleteFilesFromS3([{
            Key: restaurant.previewLink.split('com/')[1].replace('%2B', '+')
        }]);

        const dishes = await Dish.findAll({where: { restaurantId: id }});

        await deleteFilesFromS3(dishes.map(({previewLink}) => ({
            Key: previewLink.split('com/')[1].replace('%2B', '+')
            })
        ));

        await UserLikes.destroy({where: { restaurantId: id }});
        const result = await Restaurant.destroy({where: { id }});

        return response(200, result);
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}

export const getRestaurants: APIGatewayProxyHandler = async (event) => {
    const {sequelizeDB, Dish} = await loadSequelize();

    try {
        const userId: number = event.requestContext.authorizer?.lambda.userId || 0;
        const restaurants: Array<RestaurantInstance & {isLiked: number}> = await sequelizeDB.query(`
             select r.*, if (ul.restaurantId is not null, 1, 0) as isLiked
             from Restaurants r 
             left join UserLikes ul on ul.userId = ? 
             and ul.restaurantId = r.id
             order by r.id asc`,
            {replacements: [userId], type: QueryTypes.SELECT}
        );
        const dishes = await Dish.findAll();

        const result = restaurants.map(restaurant => ({
            ...restaurant,
            Dishes: dishes.filter(dish => dish.restaurantId === restaurant.id)
        }));

        return response(200, result);
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}
