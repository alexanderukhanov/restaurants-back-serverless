import * as Joi from "joi";
import { RestaurantCreationAttributes } from '../db/models/restaurant.model';
import { UpdateRestaurantRequest } from '../types';

export const createRestaurantValidation = (data: RestaurantCreationAttributes) =>
    Joi.object<RestaurantCreationAttributes>({
            name: Joi.string().required(),
            previewLink: Joi.string().required(),
            likes: Joi.number(),
            address: Joi.string().required(),
            type: Joi.string().required(),
    }).validate(data);

export const updateRestaurantValidation = (data: UpdateRestaurantRequest['body']) =>
    Joi.object<UpdateRestaurantRequest['body']>({
            id: Joi.custom(() => {
                    if (typeof data.id !== 'number') {
                            throw new Error('not number')
                    }
            }).required(),
            name: Joi.string(),
            previewLink: Joi.string(),
            likes: Joi.number(),
            address: Joi.string(),
            type: Joi.string(),
    }).validate(data);

export const deleteRestaurantValidation = (id: string) => (
    Joi.custom(() => {
        if (isNaN(Number(id))) {
            throw new Error('param must be a number')
        }
    }).required().validate(id)
);
