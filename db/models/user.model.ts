import { DataTypes, Model, Sequelize } from 'sequelize';
import { UserRoles } from "../../types";

export interface UserAttributes {
    id: number,
    email: string,
    password: string,
    role: UserRoles,
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id'> {}

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export const initUser = (sequelize: Sequelize) => (
    sequelize.define<UserInstance, UserAttributes>('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: false,
        },
    })
)
