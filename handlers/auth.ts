import { APIGatewayProxyHandler } from "aws-lambda";
import * as bcrypt from 'bcrypt';
import * as jsonwebtoken from "jsonwebtoken";

import { loadSequelize } from "../db-connect";
import { createUserValidation } from "../validations/userValidation";
import { response } from "../helpers/response";
import { ADMIN_EMAIL, ADMIN_PASSWORD, TOKEN_MAX_AGE } from "../constants";

export const login: APIGatewayProxyHandler = async (event, context) => {
    const {sequelizeDB, User} = await loadSequelize();

    try {
        const body = JSON.parse(event.body || 'null')  || {};
        const { email, password } = body;
        const { error } = createUserValidation(body);

        if (error) {
            return response(400, error.message);
        }

        let user = await User.findOne({ where: { email } });

        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const role = email === ADMIN_EMAIL && password === ADMIN_PASSWORD ? 'admin' : 'user' ;

            user = await User.create({ password: hashedPassword, role, email });
        }

        // Check password
        const pwdPassed =  bcrypt.compareSync(password, user.password);

        if (!pwdPassed) {
            return response(400, { error: 'Wrong password' });
        }

        // Setup Cookie
        const jwt = jsonwebtoken.sign(
            {
                id: user.id,
                role: user.role,
            },
            String(process.env.JWT_SECRET),
            { expiresIn: TOKEN_MAX_AGE }
        );

        return {
            statusCode: 200,
            body: '',
            headers: {
                "Set-Cookie": `ExpressGeneratorTs=${jwt}; Max-Age=${TOKEN_MAX_AGE}; path=/; secure; HttpOnly; SameSite=None`,
            },
        };
    } catch (e) {
        return response(500, { message: e.message });
    } finally {
        await sequelizeDB.connectionManager.close();
    }
}

export const logout: APIGatewayProxyHandler = async (event) => {
    return {
        statusCode: 200,
        body: '',
        headers: {
            "Set-Cookie": `ExpressGeneratorTs=123; Max-Age=-1; path=/; secure; HttpOnly; SameSite=None`,
        },
    };
}
