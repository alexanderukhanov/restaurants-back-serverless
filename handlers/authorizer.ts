import { APIGatewayAuthorizerHandler } from "aws-lambda";
import * as jsonwebtoken from "jsonwebtoken";
import { ClientData } from "../types";

export const handler: APIGatewayAuthorizerHandler = async (event, context) => {
    const cookies = event['cookies'] || [];
    const [, jwt] = (cookies[0] || '').split('=');
    const clientData = jsonwebtoken.decode(jwt) as ClientData | null;

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

export const optionalAuthorizer: APIGatewayAuthorizerHandler = async (event, context) => {
    const cookies = event['cookies'] || [];
    const [, jwt] = (cookies[0] || '').split('=');
    const clientData = jsonwebtoken.decode(jwt) as ClientData | null;

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
            "userId": clientData?.id,
            "role": clientData?.role
        }
    };
}
