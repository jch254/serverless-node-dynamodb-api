# [Serverless-node-dynamodb-api](https://serverless-api.603.nz)

![Build Status](https://codebuild.ap-southeast-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiRUR0VDBzZ0EvLzU5dktNNDJTVU0yaWFJVXBpUmNVdDliWVJrQzM0ZlEwWmJQNUVSd2IwSU1LanQ5ajRFMGVvT0lJQmtGdjR4NE5OdFdOMFp4Q1dzUGIwPSIsIml2UGFyYW1ldGVyU3BlYyI6InpsM1g0TE9nTFdyRDZJK0EiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

API powered by Serverless Framework, TypeScript, Webpack, Node.js and DynamoDB, intended as a starting point for Serverless APIs. I've also created a [React/Redux-powered UI](https://github.com/jch254/serverless-node-dynamodb-ui) to front this API. Auth0 handles authentication. You must signup/login to generate an auth token and gain access to the secured area. All endpoints in the API check validity of the auth token and return unauthorised if invalid, the UI then prompts you to log in again. The API also determines the identity of the user via the auth token.

See [Apiary](http://docs.serverlessapi.apiary.io) for API structure - defined in [apiary.apib](./apiary.apib).

## Runtime and package management

- Node.js 22 (`.nvmrc`, `package.json` engines, Dockerfile, and Lambda `nodejs22.x`)
- pnpm 9.15.9 (`packageManager` in `package.json`)
- Serverless Framework 4
- TypeScript 6 and Webpack 5
- AWS SDK v3 DynamoDB client
- Auth0 JWT validation via `jsonwebtoken`
- Local development with `serverless-offline` and `serverless-dynamodb`

---

## Running locally (with live-reloading and local DynamoDB server)

To run locally you must run two servers - DB and API.

Serverless-webpack, serverless-dynamodb-local and serverless-offline offer great tooling for local Serverless development. To start local servers that mimic AWS API Gateway and DyanamoDB, run the commands below. Both servers will fire up and code will be reloaded upon change so that every request to your API will serve the latest code.

Serverless-dynamodb-local requires Java Runtime Engine (JRE) version 6.x or newer.

**AUTH0_CLIENT_SECRET environment variable must be set before `pnpm run dev` command below. Optional DYNAMODB_PORT and DYNAMODB_HOST environment variables may be set to override the defaults (localhost:8000).**

E.g. `AUTH0_CLIENT_SECRET=YOUR_SECRET pnpm run dev`

```
pnpm install
pnpm run dynamodb:install
pnpm run dev
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

## Packaging and deployment

Serverless Framework owns the Lambda/API Gateway/DynamoDB stack. Supporting deployment infrastructure lives under [`infrastructure/terraform`](./infrastructure/terraform).

Serverless Framework v4 requires a Serverless account session or access key as well as AWS credentials. `AUTH0_CLIENT_SECRET` must be present for production packaging/deploys:

```
AUTH0_CLIENT_SECRET=YOUR_SECRET pnpm run package
AUTH0_CLIENT_SECRET=YOUR_SECRET pnpm run deploy
```

The package/deploy scripts pin the production stage and AWS region to `prod` / `ap-southeast-4`.

### Deployment/Infrastructure

Refer to the [/infrastructure](./infrastructure) directory.
