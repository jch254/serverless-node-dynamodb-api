# [Serverless-node-dynamodb-api](https://serverless-api.603.nz)

![Build Status](https://codebuild.ap-southeast-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiRUR0VDBzZ0EvLzU5dktNNDJTVU0yaWFJVXBpUmNVdDliWVJrQzM0ZlEwWmJQNUVSd2IwSU1LanQ5ajRFMGVvT0lJQmtGdjR4NE5OdFdOMFp4Q1dzUGIwPSIsIml2UGFyYW1ldGVyU3BlYyI6InpsM1g0TE9nTFdyRDZJK0EiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

API powered by Serverless, TypeScript, Webpack, Node.js and DynamoDB, intended as a starting point for Serverless APIs. I've also created a [React/Redux-powered UI](https://github.com/jch254/serverless-node-dynamodb-ui) to front this API. Auth0 handles authentication. You must signup/login to generate an auth token and gain access to the secured area. All endpoints in the API check validity of the auth token and return unauthorised if invalid, the UI then prompts you to log in again. The API also determines the identity of the user via the auth token.

See [Apiary](http://docs.serverlessapi.apiary.io) for API structure - defined in [apiary.apib](./apiary.apib).

## Technologies Used

- [Serverless](https://github.com/serverless/serverless)
- [TypeScript](https://github.com/microsoft/typescript)
- [Node.js](https://github.com/nodejs/node)
- [Webpack](https://github.com/webpack/webpack)
- [DynamoDB](https://aws.amazon.com/dynamodb)
- [Serverless-offline](https://github.com/dherault/serverless-offline)
- [Serverless-webpack](https://github.com/elastic-coders/serverless-webpack)
- [Serverless-dynamodb](https://github.com/raisenational/serverless-dynamodb)
- [Serverless-domain-manager](https://github.com/amplify-education/serverless-domain-manager)
- [Jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [Docker](https://www.docker.com)

---

## Running locally (with live-reloading and local DynamoDB server)

To run locally you must run two servers - DB and API.

Serverless-webpack, serverless-dynamodb-local and serverless-offline offer great tooling for local Serverless development. To start local servers that mimic AWS API Gateway and DyanamoDB, run the commands below. Both servers will fire up and code will be reloaded upon change so that every request to your API will serve the latest code.

Serverless-dynamodb-local requires Java Runtime Engine (JRE) version 6.x or newer.

**AUTH0_CLIENT_SECRET environment variable must be set before `yarn run dev` command below. Optional DYNAMODB_PORT and DYNAMODB_HOST environment variables may be set to override the defaults (localhost:8000).**

E.g. `AUTH0_CLIENT_SECRET=YOUR_SECRET yarn run dev`

```
yarn install (serverless dynamodb install included as postinstall script)
yarn run dev
```

Submit requests to http://localhost:3000. The DynamoDB shell console is available at http://localhost:8000/shell.

## Running locally with Docker

Maintaining a Java installation for the sake of running DynamoDB locally is a pain, running in a Docker container is far easier. As above, to run locally you must run two servers - DB and API.

To start the local servers that mimic AWS API Gateway and DyanamoDB using docker, run the commands below.

**AUTH0_CLIENT_SECRET environment variable must be set before `docker-compose up --build` command below.**

E.g. `AUTH0_CLIENT_SECRET=YOUR_SECRET docker-compose up --build`

```
docker-compose up --build
```

Submit requests to http://localhost:3000. The DynamoDB shell console is available at http://localhost:8000/shell.

## Testing

TBC

### Deployment/Infrastructure

Refer to the [/infrastructure](./infrastructure) directory.
