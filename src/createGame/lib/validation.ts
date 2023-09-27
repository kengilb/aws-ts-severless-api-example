import {
    APIGatewayProxyEvent
} from 'aws-lambda';
import { sequelize } from '/opt/nodejs/services/sequelize';

/**
 * Determines if the createGame API payload is valid.
 *
 * @remarks
 * Run-time type guard to type check API payloads.
 *
 * @param event - The AWS API Gateway proxy event.
 * @param apiVersion - The API version being accessed.
 * @returns - Boolean indicating the validity of the payload.
 */
export const isValidPayload = async (event: APIGatewayProxyEvent, apiVersion: string) => {
    let isValid: boolean = false;

    // First check for the payload body.
    if (event.httpMethod === 'POST' && event.body !== null) {
        const body = JSON.parse(event.body);
        // Check to see if the game object is well-formed.
        switch (apiVersion) {
            case 'v1':
            default:
                if (body &&
                    body.id && typeof body.id === 'string' &&
                    body.start && typeof body.start === 'string' &&
                    body.end && typeof body.end === 'string' &&
                    body.arrive && typeof body.arrive === 'string'
                ) {
                    // Check to see if the object already exists.
                    const game = await sequelize.model('Game').findByPk(body.id);
                    if (game === null) {
                        isValid = true;
                    }
                }
                break;
        }
    }

    return isValid;
}
