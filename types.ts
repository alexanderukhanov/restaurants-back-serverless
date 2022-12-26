import { RestaurantAttributes, RestaurantCreationAttributes } from "./db/models/restaurant.model";
import { DishAttributes, DishCreationAttributes } from "./db/models/dish.model";
import { UserAttributes } from "./db/models/user.model";
import { OrderCreationAttributes } from "./db/models/order.model";

export type UserRoles = 'user' | 'admin';

export interface ClientData {
    id: number;
    role: UserRoles;
}

export interface CreateRestaurantRequest {
    body: {
        restaurant: RestaurantCreationAttributes,
        dishes?: DishCreationAttributes[],
    }
}

export interface UpdateRestaurantRequest {
    body: Partial<RestaurantAttributes> & Pick<RestaurantAttributes, 'id'>,
}

export interface UpdateDishRequest {
    body: Partial<DishAttributes> & Pick<DishAttributes, 'id'>,
}

export interface CreateUserRequest {
    body: Omit<UserAttributes, 'id' | 'role'>
}

export interface CreateDish {
    dishes: Array<Omit<DishCreationAttributes, 'restaurantId'>>,
    restaurantId: DishCreationAttributes['restaurantId'],
}

export interface DishesInOrder {
    id: DishAttributes['id'],
    name: DishAttributes['name'],
    amount: number,
}

export interface CreateOrderRequest {
    body: Omit<OrderCreationAttributes, 'userId'> &
        { dishes: Array<DishesInOrder> }
}

export interface CreateOrder {
    body: OrderCreationAttributes & { dishIDs: Array<DishAttributes['id']> }
}

// Cookie Properties
// export const cookieProps = {
//     key: 'ExpressGeneratorTs',
//     secret: process.env.COOKIE_SECRET,
//     options: {
//         httpOnly: false,
//         signed: true,
//         path: (process.env.COOKIE_PATH),
//         maxAge: Number(process.env.COOKIE_EXP),
//         domain: (process.env.COOKIE_DOMAIN),
//         secure: (process.env.SECURE_COOKIE === 'true'),
//     }
// }
