import {
    APIGatewayProxyEvent
} from 'aws-lambda';
import {sequelize} from "/opt/nodejs/services/sequelize";

/**
 * Determines if the createScoringEvent API payload is valid.
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
                    body.game_id && typeof body.game_id === 'string' &&
                    body.timestamp && typeof body.timestamp === 'string' &&
                    body.data &&
                    body.data.code && typeof body.data.code === 'string' &&
                    body.data.attributes
                ) {
                    let areAttributesValid = false;
                    if (body.data.attributes.advances_count &&
                        typeof body.data.attributes.advances_count === 'boolean' &&
                        body.data.attributes.result && typeof body.data.attributes.result === 'string'
                    ) {
                        areAttributesValid = true;
                    }

                    const game = await sequelize.model('Game').findByPk(body.game_id);
                    const scoringEvent = await sequelize.model('ScoringEvent').findByPk(body.id);
                    if (areAttributesValid && game !== null && scoringEvent === null) {
                        isValid = true;
                    }
                }
                break;
            // @TODO: Add more payload validation here for newer API versions.
        }
    }

    return isValid;
}
