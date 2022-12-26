import * as Joi from "joi";
import { DishCreationAttributes } from '../db/models/dish.model';
import { UpdateDishRequest } from '../types';

export const createDishValidation = (data: DishCreationAttributes) => (
    Joi.object<DishCreationAttributes>({
            name: Joi.string().required(),
            cost: Joi.string().required(),
            previewLink: Joi.string().required(),
            description: Joi.string().required(),
            restaurantId: Joi.number(),
    }).validate(data)
);

export const createDishArrayValidation = (data: DishCreationAttributes[]) => (
    Joi.array().items(Joi.object<DishCreationAttributes>({
            name: Joi.string().required(),
            cost: Joi.string().required(),
            previewLink: Joi.string().required(),
            description: Joi.string().required(),
            restaurantId: Joi.number(),
    })).validate(data)
);

export const updateDishValidation = (data: UpdateDishRequest['body']) => (
    Joi.object<UpdateDishRequest['body']>({
            id: Joi.custom(() => {
                    if (typeof data.id !== 'number') {
                            throw new Error('not number')
                    }
            }).required(),
            name: Joi.string(),
            cost: Joi.string(),
            previewLink: Joi.string(),
            description: Joi.string(),
            restaurantId: Joi.number(),
    }).validate(data)
);

export const deleteDishValidation = (id: string) => (
    Joi.custom(() => {
            if (isNaN(Number(id))) {
                    throw new Error('param must be a number')
            }
    }).required().validate(id)
);
