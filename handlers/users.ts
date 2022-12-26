import { APIGatewayProxyHandler } from "aws-lambda";

import { loadSequelize } from "../db-connect";
import { response } from "../helpers/response";

export const getProfile: APIGatewayProxyHandler = async (event, context) => {
    const {sequelizeDB, User} = await loadSequelize();

    try {
        const userId: number = event.requestContext.authorizer?.lambda.userId;
        const userProfile = await User.findOne({ where: { id: userId }, attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            }});

        if (!userProfile) {
            return response(404, '');
        }

        return response(200, userProfile);
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}
