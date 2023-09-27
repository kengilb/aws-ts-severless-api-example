import {
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from 'aws-lambda';
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
        if (event.httpMethod === 'GET' && event.queryStringParameters && event.queryStringParameters.game_id) {
            // @TODO: Add paging here via findAndCountAll to avoid response bloat.
            const scoringEvents = await sequelize.model('ScoringEvent').findAll({
                where: {
                    gameId: event.queryStringParameters.game_id,
                },
                order: [['timestamp', 'DESC']],
                include: [{model: ScorekeepingData}],
            });
            // Re-hydrate the response objects in the format the client is expecting.
            let scoringEventsResponse: object[] = [];
            if (scoringEvents !== null) {
                scoringEventsResponse = scoringEvents.map((scoringEvent: any) => {
                    return {
                        id: scoringEvent.id,
                        game_id: scoringEvent.gameId,
                        timestamp: scoringEvent.timestamp,
                        data: {
                            code: scoringEvent.data.code,
                            attributes: {
                                advances_count: scoringEvent.data.attributes.advancesCount,
                                result: scoringEvent.data.attributes.result,
                            }
                        }
                    }
                });
            }

            switch (apiVersion) {
                case 'v1':
                default:
                    return {
                        statusCode: 200,
                        body: JSON.stringify(scoringEventsResponse)
                    }
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
        }
    }
};
