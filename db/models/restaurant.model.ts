import { DataTypes, Model, Sequelize } from 'sequelize';

export interface RestaurantAttributes {
    id: number,
    name: string,
    address: string,
    previewLink: string,
    type: string,
    likes: number,
}

export interface RestaurantCreationAttributes extends Omit<RestaurantAttributes, 'id'> {}

export interface RestaurantInstance extends Model<
    RestaurantAttributes, RestaurantCreationAttributes
>, RestaurantAttributes {}

export const initRestaurant = (sequelize: Sequelize) => (
    sequelize.define<RestaurantInstance, RestaurantAttributes>('Restaurant', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        previewLink: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        }
    })
)
