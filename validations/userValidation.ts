import * as Joi from "joi";
import { CreateUserRequest } from '../types';

export const createUserValidation = (data: CreateUserRequest['body']) => (
    Joi.object<CreateUserRequest["body"]>({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
    }).validate(data)
);
