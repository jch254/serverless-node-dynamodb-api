# [Serverless-node-dynamodb-api](https://serverless-api.603.nu)

API powered by Serverless, TypeScript, Webpack, Node.js and DynamoDB, intended as a starting point for Serverless APIs. I've also created a [React/Redux-powered UI](https://github.com/jch254/serverless-node-dynamodb-ui) to front this API. Auth0 handles authentication. You must signup/login to generate an auth token and gain access to the secured area. All endpoints in the API check validity of the auth token and return unauthorised if invalid, the UI then prompts you to log in again. The API also determines the identity of the user via the auth token.

See [Apiary](http://docs.serverlessapi.apiary.io) for API structure - defined in [apiary.apib](./apiary.apib).

## Technologies Used

* [Serverless](https://github.com/serverless/serverless)
* [TypeScript](https://github.com/microsoft/typescript)
* [Node.js](https://github.com/nodejs/node)
* [Webpack](https://github.com/webpack/webpack)
* [DynamoDB](https://aws.amazon.com/dynamodb)
* [Serverless-offline](https://github.com/dherault/serverless-offline)
* [Serverless-webpack](https://github.com/elastic-coders/serverless-webpack)
* [Serverless-dynamodb-local](https://github.com/99xt/serverless-dynamodb-local)
* [Jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

---

## Running locally (with live-reloading and local DynamoDB server)

To run locally you must run two servers - DB and API.

Serverless-webpack, serverless-dynamodb-local and serverless-offline offer great tooling for local Serverless development. To start a local server that will mimic AWS API Gateway, run the commands below. Both servers will fire up and code will be reloaded upon change so that every request to your local server will serve the latest code.

Serverless-dynamodb-local requires Java Runtime Engine (JRE) version 6.x or newer.

**DYNAMODB_PORT and AUTH0_CLIENT_SECRET environment variables must be set before `yarn run dev` command below.**

E.g. `DYNAMODB_PORT=8001 AUTH0_CLIENT_SECRET=YOUR_SECRET yarn run dev`

```
yarn install (serverless dynamodb install included as postinstall script)
yarn run dev
```

## Testing

TBC

### Deployment/Infrastructure

Refer to the [/infrastructure](./infrastructure) directory.
