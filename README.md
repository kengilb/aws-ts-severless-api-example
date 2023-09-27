# AWS TypeScript Serverless API Example

# Architecture
This example makes a few opinionated decisions about the libraries / SDKs being used. Namely, Node and TypeScript are
leveraged as the driving languages and frameworks for running this API example. This example also follows current AWS
best practices and was initially generated using the SAM CLI quickstart example for a serverless API. Finally, Postgres
was chosen as the database to illustrate the power and flexibility of using binary JSON data fields in a Node based API.
Here are a few high level notes on the architecture:
- This API suite consists of decomposed lambdas. Smaller individual lambdas per endpoint help avoid several issues including the following:
  - Several engineers can work on each these different lambdas at once, avoiding issues like merge conflicts and mitigating regression risk.
  - Smaller lambda package sizes reduce the impact of "cold starts" and generally avoids the "monolithic" lambda.
  - API Gateway and CloudFront can more easily cache data.
- TypeScript was chosen to add a layer of safety and to improve the developer experience.
  - Bare JavaScript could be used; however, TypeScript's compiled nature gives engineers feedback during development
when data types, signatures, etc. don't match. This reduces the amount of production incidents.
  - TypeScript gives engineers realtime hints as to what is present within an object when using an IDE that supports it.
- Postgres was chosen as the relational database backing this API.
  - Relational databases like Postgres provide features and support for both typical relational database features and
JSON structured data.
  - NOTE: In Postgres the binary JSON field should be used rather than the plain JSON field to enable complex queries
that relying on indexing of the data within the JSON objects.
  - If a more simple database is desired and / or a fully featured relational database is not necessary, a NoSQL
database like MongoDB, DocumentDB or DynamoDB could easily be used instead.
- [Sequelize](https://sequelize.org/docs/v6/) was chosen as the database client to interact with Postgres.
  - Sequelize abstracts out database specific concepts by providing engineers with an OOP / model based approach to
building out database structures.
  - This could easily be replaced by a library like [node-postgres](https://node-postgres.com/) if the engineering team
prefers to leverage bare SQL queries.
- This example uses the path based approach to API versioning.
  - You could easily pass a version in a header instead.
- A lambda layer was used to avoid code duplication and to keep the code DRY.
  - To overcome the hurdle of using AWS's recommended /opt/nodejs directory when accessing lambda layer libraries while
preserving TypeScript best practices, the following TS config was leveraged for each lambda needing the layer.
  - 
```json
{
  "paths": {
    "/opt/nodejs/*": [
      "../scoringDependencies/nodejs/*"
    ]
  }
}
```

## Prerequisites
In order to run this project locally, the following prerequisites are required:
- Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and the [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).
- Install [docker](https://docs.docker.com/desktop/).
- Install Node.js version 18.x.
  - If you have a conflicting version, check out [NVM](https://github.com/nvm-sh/nvm) for dynamic node version switching.
- Have a publicly accessible Postgres instance.

## Local Development
Each lambda in the src directory can quickly be built using the provided [build.sh](./build.sh) script. Individual
lambdas can be developed using ```npm run build-watch``` for live reloading. NOTE: If you choose to not use the script,
you will need to build the scoringDependencies lambda layer first.

## Usage
First, create root directory env.json file alongside the Cloudformation template.yaml file:
```json
{
  "createGameFunction": {
    "POSTGRES_URL": "postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
  },
  "getGamesFunction": {
    "POSTGRES_URL": "postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
  },
  "getGameByIdFunction": {
    "POSTGRES_URL": "postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
  },
  "createScoringEventFunction": {
    "POSTGRES_URL": "postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
  },
  "getScoringEventsFunction": {
    "POSTGRES_URL": "postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
  },
  "getScoringEventByIdFunction": {
    "POSTGRES_URL": "postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
  }
}
```

Perform the following steps to build and run the lambdas locally:
```shell
cd aws-ts-serverless-api-example
./build.sh
sam build
sam local start-api --env-vars env.json
```

Leverage your preferred client to test the APIs locally. e.g. Postman, curl, etc. See the 
[API documentation](./documentation.yaml) for details on requests, responses, etc.

## Deployment
To deploy this stack into an AWS account you will need to perform the following:
- Ensure your user you will be using to deploy to AWS has the appropriate permissions.
- Spin up an S3 bucket to contain the artifacts / code.
- Configure your local AWS / SAM CLI tools to point to your AWS account.
- Run the [build.sh](./build.sh) script.
- Run the SAM CLI command ```sam build```.
- Run the SAM CLI command ```sam deploy --stack-name aws-ts-serverless-api-example --capabilities CAPABILITY_NAMED_IAM --region TARGET_AWS_REGION --s3-bucket S3_BUCKET_NAME```.

## Known Limitations
Given that this is a simple example, some shortcuts were taken for the sake of time. The following known limitations should be remedied in a production environment:
- Sequelize sync is being leveraged at the start of each lambda invocation.
  - How to fix - create a custom resource lambda to initially sync the models. Then leverage migrations on subsequent updates to make database schema changes.
- There is no way to update an existing resource.
  - Attempting to send another POST request with the same UUID as an existing resource results in a 400 error.
  - How to fix - create API update lambdas using either the PUT or PATCH verbs. Alternatively, modify the POST resources to handle an upsert.
- CORS is not defined. This will prevent some clients from making requests to this API. i.e. Web browsers.
  - How to fix - define the API gateway explicitly in the SAM template using the provided OpenAPI spec and ensure the paths match the existing API definitions.
- Paging is not implemented.
  - Over time, a large number of game and/or scoring event objects could be accumulated and could overwhelm the server.
  - How to fix - implement page and page size parameters. Use Sequelize's findAndCountAll to assist with this.

## Possible Improvements
- Generate meaningful TTLs (time to live) and enable API Gateway caching. Furthermore, you could put a CloudFront or some other CDN instance in front.
- Validate the ID being passed is a UUID using a UUID validator library.
- Allow clients to create resources by omitting the UUID and instead have the server generate it.
- Integrate a linter.
- Integrate unit tests.

# Example Story / Requirements

## Baseball and Softball Scoring Service

As a baseball or softball fan, I would like to be able to keep track of realtime scores for my favorite teams. Build a
simple baseball and softball score keeping REST API that mobile and web clients can use to save information about games.
Provide endpoints to allow consumers to store and retrieve basic information about games and game events
(like pitches and balls).

Build a basic API with persistence that can create (`POST`) and retrieve (`GET`) game and game scoring event resources.
The payloads in `samples/game.json` and `samples/scoring_event.json` are examples of data these endpoints should accept.

Here are schema definitions defined in TypeScript for the `game` and `scoring_event` resources:
```typescript
interface Game {
    id: UUID;
    start: Date;
    end: Date;
    arrive: Date;
}

interface ScoringEvent {
    id: UUID;
    gameId: UUID;
    timestamp: Date;
    data: ScorekeepingData;
}

interface ScorekeepingData {
    code: ScorekeepingCode;
    attributes: {
        advancesCount: boolean;
        result: ScorekeepingResult;
    };
}

enum ScorekeepingCode {
    Pitch,
    Ball,
}

enum ScorekeepingResult {
    BallInPlay,
    Strikeout,
}
```

Social Media Image Credit:
[Image by starline on Freepik](https://www.freepik.com/free-vector/cloud-computing-polygonal-wireframe-technology-concept_12071198.htm#query=aws&position=1&from_view=keyword&track=sph)
