# [Serverless-node-dynamodb-api (Live Demo)](https://serverless-api.603.nu)

[Bitbucket Pipelines status](https://bitbucket.org/jch254/serverless-node-dynamodb-api/addon/pipelines/home)

A simple API powered by Serverless, Node.js and DynamoDB, intended as a starting point for Serverless APIs. This project uses serverless-webpack with Babel to compile handler functions written with the next level JavaScript, serverless-offline to run locally and serverless-dynamodb-local to run a local DynamoDB server. I've also created a [simple React/Redux-powered UI](https://github.com/jch254/serverless-node-dynamodb-ui) to front this API.

Auth0 handles authentication. You must signup/login to generate an auth token and gain access to the secured area. All endpoints in the API check validity of the auth token and return unauthorised if invalid, the UI then prompts you to log in again. The API also determines the identity of the user via the auth token.

See [Apiary](http://docs.serverlessapi.apiary.io) for API structure - defined in [apiary.apib](../master/apiary.apib).

## Technologies Used

* [Serverless](https://github.com/serverless/serverless)
* [Node.js](https://github.com/nodejs/node)
* [DynamoDB](https://aws.amazon.com/dynamodb)
* [Webpack](https://github.com/webpack/webpack)
* [Serverless-offline](https://github.com/dherault/serverless-offline)
* [Serverless-webpack](https://github.com/elastic-coders/serverless-webpack)
* [Serverless-dynamodb-local](https://github.com/99xt/serverless-dynamodb-local)
* [Jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
* [Babel](https://github.com/babel/babel)
* [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines)

---

Please note that Serverless must be installed globally before running any commands below: `yarn global add serverless`.

## Running locally (with live-reloading and local DynamoDB server)

To run locally you must run two servers - DB and API.

Serverless-webpack, serverless-dynamodb-local and serverless-offline offer great tooling for local Serverless development. To start a local server that will mimic AWS API Gateway, run the commands below. Both servers will fire up and code will be reloaded upon change so that every request to your local server will serve the latest code.

Serverless-dynamodb-local requires Java Runtime Engine (JRE) version 6.x or newer.

There is currently an issue that requires `serverless dynamodb start` to be run explicitly, previously `serverless offline --location .webpack` would also start the local DynamoDB server. Hopefully this will be resolved soon!

**DYNAMODB_PORT environment variable must be set before `serverless dynamodb start` command below.**

E.g. `DYNAMODB_PORT=8001 serverless dynamodb start`

**DYNAMODB_PORT and AUTH0_CLIENT_SECRET environment variables must be set before `serverless offline start --location .webpack` command below.**

E.g. `DYNAMODB_PORT=8001 AUTH0_CLIENT_SECRET=YOUR_SECRET serverless offline start --location .webpack`

```
yarn install
serverless dynamodb install
serverless dynamodb start
serverless offline --location .webpack
```

## Testing

TBC

## Deploying to AWS

To deploy/manage this service you will need to create an IAM user with the required permissions and set credentials for this user - see [here](https://github.com/serverless/serverless/blob/master/docs/providers/aws/guide/credentials.md) for further info. After you have done this, run the commands below to deploy the service:

**NODE_ENV and AUTH0_CLIENT_SECRET environment variables must be set to production before `serverless deploy` command below.**

E.g. `NODE_ENV=production AUTH0_CLIENT_SECRET=YOUR_SECRET serverless deploy`

```
yarn install
serverless deploy
```

Manual steps suck so this project uses Bitbucket Pipelines to automate the build and deployment to AWS - see [bitbucket-pipelines.yml](../master/bitbucket-pipelines.yml). AWS credentials are set using [Bitbucket Pipelines environment variables](https://confluence.atlassian.com/bitbucket/environment-variables-in-bitbucket-pipelines-794502608.html).

I've created a [Docker-powered build/deployment environment for Serverless projects](https://github.com/jch254/docker-node-serverless) to use with Bitbucket Pipelines which is used by this project.
