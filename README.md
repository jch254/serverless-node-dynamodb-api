# [Serverless-es6-dynamodb-webapi (Live Demo)](https://serverless-web-api.603.nu)

[Bitbucket Pipelines status](https://bitbucket.org/jch254/serverless-es6-dynamodb-webapi/addon/pipelines/home)

A simple web API powered by Serverless (Node.js) and DynamoDB, intended as a starting point for Serverless web APIs. This project uses serverless-webpack with Babel to compile handler functions written with the good scripts and serverless-dynamodb-local to run a local DynamoDB server. I've also created a [simple React/Redux-powered UI](https://github.com/jch254/react-redux-terraform-aws) to front this API.

See [Apiary](http://docs.serverlesses6dynamodbwebapi.apiary.io) for API structure - defined in [apiary.apib](../master/apiary.apib).

## Technologies Used

* [Node.js](https://github.com/nodejs/node)
* [Serverless](https://github.com/serverless/serverless)
* [DynamoDB](https://aws.amazon.com/dynamodb)
* [Webpack](https://github.com/webpack/webpack)
* [Serverless-webpack](https://github.com/elastic-coders/serverless-webpack)
* [Serverless-dynamodb-local](https://github.com/99xt/serverless-dynamodb-local)
* [Babel](https://github.com/babel/babel)
* [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines)

---

**Please note that Serverless must be installed globally before running any commands below: `yarn global add serverless`.**

## Running locally (with live-reloading and local DynamoDB server)

**DYNAMODB_PORT environment variable must be set before `serverless dynamodb start` and `serverless webpack serve` commands below.**

E.g. `DYNAMODB_PORT=8001 serverless webpack serve`

To run locally you must run two servers - DynamoDB and Webpack.

### DynamoDB

Serverless-dynamodb-local provides a local DynamoDB server that can be used aid local development.

Requires Java Runtime Engine (JRE) version 6.x or newer.

```
yarn install
serverless dynamodb install
serverless dynamodb start
```

### Webpack

Serverless-webpack offers great tooling for local Serverless development. To start a local server that will mimic AWS API Gateway, run the commands below. Code will be reloaded upon change so that every request to your local server will serve the latest code.


```
yarn install
serverless webpack serve
```

## Testing

TBC

## Deploying to AWS

**NODE_ENV environment variable must be set to production before `serverless deploy` command below.**

E.g. `NODE_ENV=production serverless deploy`

To deploy/manage this service you will need to create an IAM user with the required permissions and set credentials for this user - see [here](https://github.com/serverless/serverless/blob/master/docs/providers/aws/guide/credentials.md) for further info. After you have done this, run the commands below to deploy the service:

```
yarn install
serverless deploy
```

Manual steps suck so this project uses Bitbucket Pipelines to automate the build and deployment to AWS - see [bitbucket-pipelines.yml](../master/bitbucket-pipelines.yml). AWS credentials are set using [Bitbucket Pipelines environment variables](https://confluence.atlassian.com/bitbucket/environment-variables-in-bitbucket-pipelines-794502608.html).

I've created a [Docker-powered build/deployment environment for Serverless projects](https://github.com/jch254/docker-node-serverless) to use with Bitbucket Pipelines which is used by this project.
