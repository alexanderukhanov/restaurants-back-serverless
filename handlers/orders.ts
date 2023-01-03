import { APIGatewayProxyHandler } from "aws-lambda";
import { loadSequelize } from "../db/db-connect";
import { response } from "../helpers/response";
import { createOrderValidation, deleteOrderValidation } from "../validations/orderValidation";

export const addOrder: APIGatewayProxyHandler = async (event) => {
    const {sequelizeDB, Order, Dish, DishInOrder, Restaurant, User} = await loadSequelize();

    try {
        const body = JSON.parse(event.body || 'null')  || {};
        const userId: number = event.requestContext.authorizer?.lambda.userId;
        const { restaurantId, dishes, totalCost } = body;
        const { error } = createOrderValidation(body);

        if (error) {
            return response(400, error.message);
        }
        const verifiedDishes = await Dish.findAll({where: { id: dishes.map(dish => dish.id) }});
        const unfoundDishes = dishes
            .filter(({ id }) => !verifiedDishes.some(dish => dish.id === id));

        if (unfoundDishes.length) {
            return response(404, `Dish with name '${unfoundDishes[0].name}' not found!`);
        }

        const verifiedDishesWithAmount = verifiedDishes.map(({id, cost}) => ({
            id,
            cost,
            amount: dishes.find(dishFromRequest => dishFromRequest.id === id)?.amount || 1
        }));

        const calculatedTotalCost = verifiedDishesWithAmount
            .reduce((acc, {cost, amount}) => (acc + (Number(cost) * amount)), 0);

        if (calculatedTotalCost !== Number(totalCost)) {
            return response(402, `The total cost isn't correct`);
        }

        const restaurant = await Restaurant.findOne({where: { id: restaurantId }});
        const user = await User.findOne({where: { id: userId }});

        if (!verifiedDishes.length || !restaurant || !user) {
            return response(404, '');
        }

        const order = await Order.create({ restaurantId, totalCost, userId });
        const dishToInsert = verifiedDishesWithAmount.map(({id, amount}) => ({
            amount,
            dishId: id,
            orderId: order.id,
        }));

        await DishInOrder.bulkCreate(dishToInsert);

        return response(201, '');
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}

export const deleteOrder: APIGatewayProxyHandler = async (event) => {
    const {sequelizeDB, Order} = await loadSequelize();

    try {
        const id: string = event.pathParameters?.id || '';
        const { error } = deleteOrderValidation(id);

        if (error) {
            return response(400, error.message);
        }

        const order = await Order.findOne({where: { id }});

        if (!order) {
            return response(404, '');
        }

        const result = await Order.destroy({where: { id }});

        return response(200, result);
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}
