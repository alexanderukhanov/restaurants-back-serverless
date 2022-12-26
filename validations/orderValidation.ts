import * as Joi from "joi";
import { CreateOrderRequest, DishesInOrder } from '../types';

export const createOrderValidation = (data: CreateOrderRequest['body']) => (
    Joi.object<CreateOrderRequest['body']>({
        totalCost: Joi.string().required(),
        restaurantId: Joi.number().required(),
        dishes: Joi.array().items(Joi.object<DishesInOrder>({
            id: Joi.number().required(),
            amount: Joi.number().required(),
            name: Joi.string().required(),
        })).required()
    }).validate(data)
);

export const deleteOrderValidation = (id: string) => (
    Joi.custom(() => {
        if (isNaN(Number(id))) {
            throw new Error('param must be a number')
        }
    }).required().validate(id)
);
