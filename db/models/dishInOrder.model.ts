import { DataTypes, Model, Sequelize } from 'sequelize';

export interface DishInOrderAttributes {
    dishId: number,
    orderId: number,
    amount: number,
}

export interface DishInOrderInstance extends Model<
    DishInOrderAttributes, DishInOrderAttributes
    >, DishInOrderAttributes {}

export const initDishInOrder = (sequelize: Sequelize) => (
    sequelize.define<DishInOrderInstance, DishInOrderAttributes>('DishInOrder', {
        dishId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {timestamps: false})
)
