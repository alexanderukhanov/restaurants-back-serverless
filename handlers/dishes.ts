import { APIGatewayProxyHandler } from "aws-lambda";
import { loadSequelize } from "../db/db-connect";
import { response } from "../helpers/response";
import { deleteDishValidation, updateDishValidation } from "../validations/dishValidation";
import { deleteFilesFromS3 } from "../helpers/aws";

export const updateDish: APIGatewayProxyHandler = async (event) => {
    const {sequelizeDB, Dish} = await loadSequelize();

    try {
        const body = JSON.parse(event.body || 'null')  || {};
        const { id } = body;
        const { error } = updateDishValidation(body);

        if (error) {
            return response(400, error.message);
        }

        const dish = await Dish.findOne({where: { id }});

        if (!dish) {
            return response(404, '');
        }

        const result = await Dish.update(body, {where: { id }});

        return response(200, result);
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}

export const deleteDish: APIGatewayProxyHandler = async (event) => {
    const {sequelizeDB, Dish} = await loadSequelize();

    try {
        const id: string = event.pathParameters?.id || '';
        const { error } = deleteDishValidation(id);

        if (error) {
            return response(400, error.message);
        }

        const dish = await Dish.findOne({where: { id }});

        if (!dish) {
            return response(404, '');
        }

        await deleteFilesFromS3([{
            Key: dish.previewLink.split('com/')[1].replace('%2B', '+')
        }]);

        const result = await Dish.destroy({where: { id }});

        return response(200, result);
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}
