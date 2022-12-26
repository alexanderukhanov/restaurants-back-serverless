import dbConfig from './db-config';
import { Sequelize } from "sequelize";
import { initUser } from "./db/models/user.model";
import { initRestaurant } from "./db/models/restaurant.model";
import { initDish } from "./db/models/dish.model";
import { initOrder } from "./db/models/order.model";
import { initUserLikes } from "./db/models/userLikes.model";
import { initDishInOrder } from "./db/models/dishInOrder.model";

export const loadSequelize = async () => {
    const sequelize = new Sequelize({
        ...dbConfig,
        username: dbConfig.user,
        dialect: "mysql",
        logging: console.log,
        pool: {
            max: 2,
            min: 0,
            idle: 0,
            acquire: 3000,
            evict: 5000 //default lambda timeout = 6000ms
        }
    });

    const User = initUser(sequelize);
    const Restaurant = initRestaurant(sequelize);
    const Dish = initDish(sequelize);
    const Order = initOrder(sequelize);
    const UserLikes = initUserLikes(sequelize);
    UserLikes.removeAttribute('id');
    const DishInOrder = initDishInOrder(sequelize);
    DishInOrder.removeAttribute('id');

    Restaurant.hasOne(Order, { foreignKey: 'restaurantId', onDelete: 'NO ACTION' });
    Dish.belongsToMany(Order, { through: 'Order_Dish' });
    Order.belongsToMany(Dish, { through: 'Order_Dish' });
    User.hasOne(Order, { foreignKey: 'userId'});
    Restaurant.hasMany(Dish, { foreignKey: 'restaurantId' });

    // takes +600ms
    // for (const key in sequelize.models) {
    //     await sequelize.models[key].sync({alter: true});
    // }

    sequelize.authenticate()
        .then(() => console.log('DB Connection established successfully.'))
        .catch(err => console.error(`DB Sequelize Connection Failed: ${err}`));

    return {sequelizeDB: sequelize, User, Restaurant, Dish, Order, UserLikes, DishInOrder};
}
