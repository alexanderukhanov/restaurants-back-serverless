import { DataTypes, Model, Sequelize } from 'sequelize';
import { DishInstance } from './dish.model';

export interface OrderAttributes {
    id: number,
    userId: number,
    restaurantId: number,
    totalCost: string,
    isPaid: boolean,
    // logic for 1 dish to 1 order (not using now)
    Dishes?: {
        id: number
    }[]
}

export interface OrderCreationAttributes extends Omit<OrderAttributes, 'id' | 'isPaid'> {}

export interface OrderInstance extends Model<
    OrderAttributes, OrderCreationAttributes
>, OrderAttributes {
    // logic for 1 dish to 1 order (not using now)
    addDish(dishes: DishInstance[]): Promise<void>;
}

export const initOrder = (sequelize: Sequelize) => (
    sequelize.define<OrderInstance, OrderAttributes>('Order', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        restaurantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        totalCost: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    })
)
