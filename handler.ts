import { APIGatewayProxyHandler } from 'aws-lambda';
import { loadSequelize } from "./db-connect";

export const hello: APIGatewayProxyHandler = async (event, context) => {
    const {sequelizeDB, User} = await loadSequelize();

    try {
        const users = await User.findAll();
        console.log({users: users[0].dataValues})
        return {
            statusCode: 200,
            body: JSON.stringify(users),
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: e.message})
        };
    } finally {
        await sequelizeDB.connectionManager.close();
    }
};
