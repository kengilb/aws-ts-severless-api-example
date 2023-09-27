import {
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from 'aws-lambda';
import { isValidPayload } from './lib/validation';
import { sequelize } from '/opt/nodejs/services/sequelize';
import { ScorekeepingData } from '/opt/nodejs/models/ScorekeepingData';

export const handler: APIGatewayProxyHandler = async (
    event
): Promise<APIGatewayProxyResult> => {
    // First, retrieve the API version we're working with.
    const apiVersion: string = (event.pathParameters && event.pathParameters.version) ? event.pathParameters.version : 'v1';
    try {
        // Init the tables in Postgres. NOTE: This operation is expensive. In a production environment, this sync would
        // be executed by a custom resource lambda on CF creation. Subsequent model updates would be propagated by
        // migrations. See https://sequelize.org/docs/v6/other-topics/migrations/
        await sequelize.sync();

        // Type guard check to ensure that the payload being delivered is valid and structured as expected.
        if (await isValidPayload(event, apiVersion)) {
            const payload = JSON.parse(<string>event.body);
            // Parse the game object out of the body.
            const scoringEvent = {
                id: payload.id,
                gameId: payload.game_id,
                timestamp: new Date(payload.timestamp),
                data: {
                    code: payload.data.code,
                    attributes: {
                        advancesCount: payload.data.attributes.advances_count,
                        result: payload.data.attributes.result,
                    },
                }
            };
            await sequelize.model('ScoringEvent').create(scoringEvent, {
                include: [{model: ScorekeepingData}],
            });

            switch (apiVersion) {
                case 'v1':
                default:
                    return {
                        statusCode: 200,
                        body: JSON.stringify({id: scoringEvent.id})
                    };
                // @TODO: Add more responses here for newer API versions.
            }
        } else {
            switch (apiVersion) {
                case 'v1':
                default:
                    return {
                        statusCode: 400,
                        body: JSON.stringify({message: "Bad request."})
                    }
                // @TODO: Add more responses here for newer API versions.
            }
        }
    } catch (e) {
        // Unexpected error.
        let message: string = (e instanceof Error) ? e.message : String(e);
        console.log(message);
        switch (apiVersion) {
            case 'v1':
            default:
                return {
                    statusCode: 500,
                    body: JSON.stringify({message: "Internal server error."})
                }
            // @TODO: Add more responses here for newer API versions.
        }
    }
};