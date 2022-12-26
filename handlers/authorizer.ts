import { APIGatewayAuthorizerHandler } from "aws-lambda";
import * as jsonwebtoken from "jsonwebtoken";
import { ClientData } from "../types";

export const handler: APIGatewayAuthorizerHandler = async (event, context) => {
    const cookies = event['cookies'] || [];
    const [, jwtKey] = (cookies[0] || '').split('=');
    const clientData = jsonwebtoken.decode(jwtKey) as ClientData | null;

    if (!clientData) {
        return {
            principalId: 'anonymous',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: event['routeArn'],
                    },
                ],
            }
        };
    }

    return {
        principalId: 'anonymous',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: event['routeArn'],
                },
            ],
        },
        context: {
            "userId": clientData.id,
            "role": clientData.role
        }
    };
}
