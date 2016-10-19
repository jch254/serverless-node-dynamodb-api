# [Serverless-es6-dynamodb-webapi (Live Demo)](https://serverless-web-api.603.nu)

[Bitbucket Pipelines status](https://bitbucket.org/jch254/serverless-es6-dynamodb-webapi/addon/pipelines/home)

A simple web API powered by Serverless (Node.js) and DynamoDB, intended as a starting point for Serverless web APIs. This project uses serverless-webpack with Babel to compile handler functions written in ES6.

See [Apiary](http://docs.serverlesses6dynamodbwebapi.apiary.io) for API structure - defined in [apiary.apib](../master/apiary.apib).

## Technologies Used

* [Node.js](https://github.com/nodejs/node)
* [Serverless](https://github.com/serverless/serverless)
* [DynamoDB](https://aws.amazon.com/dynamodb)
* [Webpack](https://github.com/webpack/webpack)
* [Serverless-webpack](https://github.com/elastic-coders/serverless-webpack)
* [Babel](https://github.com/babel/babel)
* [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines)

---

**Please note that Serverless must be installed globally before running any commands below: `npm install -g serverless`.**

## Running locally (with live-reloading)

Serverless-webpack offers great tooling for local Serverless development. To start a local server that will mimic AWS API Gateway, run the commands below. Code will be reloaded upon change so that every request to your local server will serve the latest code.

```
npm install
serverless webpack serve
```

## Deploying to AWS

To deploy/manage this service you will need to create an IAM user with the required permissions and set credentials for this user - see [here](https://github.com/serverless/serverless/blob/master/docs/02-providers/aws/01-setup.md) for further info. After you have done this, run the commands below to deploy the service:

```
npm install
serverless deploy
```

Manual steps suck so this project uses Bitbucket Pipelines to automate the build and deployment to AWS - see [bitbucket-pipelines.yml](../master/bitbucket-pipelines.yml). AWS credentials are set in this file to take advantage of [Bitbucket Pipelines environment variables](https://confluence.atlassian.com/bitbucket/environment-variables-in-bitbucket-pipelines-794502608.html).

I've created a [Docker-powered build/deployment environment for Serverless projects](https://github.com/jch254/docker-node-serverless) to use with Bitbucket Pipelines which is used by this project.
