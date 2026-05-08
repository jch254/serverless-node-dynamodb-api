# [Serverless-node-dynamodb-api](https://sls-api.603.nz)

![Build Status](https://codebuild.ap-southeast-4.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiRUR0VDBzZ0EvLzU5dktNNDJTVU0yaWFJVXBpUmNVdDliWVJrQzM0ZlEwWmJQNUVSd2IwSU1LanQ5ajRFMGVvT0lJQmtGdjR4NE5OdFdOMFp4Q1dzUGIwPSIsIml2UGFyYW1ldGVyU3BlYyI6InpsM1g0TE9nTFdyRDZJK0EiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

API powered by Serverless Framework, TypeScript, Webpack, Node.js and DynamoDB, intended as a starting point for Serverless APIs. Paired with the [React/Redux UI](https://github.com/jch254/serverless-node-dynamodb-ui). Auth0 handles authentication via Universal Login; the API authorizer verifies the RS256-signed ID token against Auth0's JWKS and rejects anything else.

See [Apiary](http://docs.serverlessapi.apiary.io) for API structure - defined in [apiary.apib](./apiary.apib).

## Runtime and stack

- Node.js 22 (`.nvmrc`, `package.json` engines, Dockerfile, Lambda `nodejs22.x`)
- pnpm 9.15.9 (`packageManager` in `package.json`)
- Serverless Framework v4 (license key required, see deployment notes)
- TypeScript 6, Webpack 5
- AWS SDK v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
- Auth0 RS256 ID-token validation via `jsonwebtoken` + `jwks-rsa`
- Custom domain via API Gateway edge endpoint, ACM cert in `us-east-1`, Cloudflare DNS
- Local development with `serverless-offline` and `serverless-dynamodb`

## Auth model

The API Gateway custom authorizer at [`src/index.ts`](./src/index.ts) verifies the bearer token with:

- `algorithms: ['RS256']`
- `issuer: https://${AUTH0_DOMAIN}/`
- `audience: ${AUTH0_CLIENT_ID}`
- public key fetched from `https://${AUTH0_DOMAIN}/.well-known/jwks.json` (cached, rate-limited)

The UI sends the Auth0-issued ID token (`getIdTokenClaims().__raw`) as `Authorization: Bearer <jwt>`. The Auth0 application **must** be configured with JWT signing algorithm `RS256` for this to work.

`AUTH0_DOMAIN` and `AUTH0_CLIENT_ID` are non-secret values, injected as plaintext env vars on the authorizer Lambda.

---

## Running locally (with live-reloading and local DynamoDB server)

To run locally you must run two servers - DB and API.

`serverless-webpack`, `serverless-dynamodb` and `serverless-offline` provide local emulation of API Gateway and DynamoDB. `serverless-dynamodb` requires a Java Runtime Engine (JRE 6+).

Optional `DYNAMODB_PORT` and `DYNAMODB_HOST` may be set to override the defaults (`localhost:8000`).

```bash
pnpm install
pnpm run dynamodb:install
pnpm run dev
```

Submit requests to <http://localhost:3000>. The DynamoDB shell console is available at <http://localhost:8000/shell>.

## Running locally with Docker

Avoids the local Java install:

```bash
docker-compose up --build
```

Submit requests to <http://localhost:3000>. DynamoDB shell at <http://localhost:8000/shell>.

## Testing

TBC

## Packaging and deployment

Serverless Framework owns the Lambda / API Gateway / DynamoDB stack. Supporting infrastructure (CodeBuild, IAM, ACM, API Gateway custom domain, Cloudflare DNS, SSM placeholders) is Terraform-managed under [`infrastructure/terraform`](./infrastructure/terraform).

Serverless Framework v4 requires a Serverless account session or license key. The license key is stored in SSM at `/serverless-node-dynamodb-api/serverless-license-key` and exported to CodeBuild as `SERVERLESS_LICENSE_KEY`. For local packaging/deploys, set `SERVERLESS_LICENSE_KEY`, `AUTH0_DOMAIN`, and `AUTH0_CLIENT_ID`:

```bash
SERVERLESS_LICENSE_KEY=YOUR_KEY \
AUTH0_DOMAIN=your-tenant.auth0.com \
AUTH0_CLIENT_ID=YOUR_CLIENT_ID \
pnpm run package

SERVERLESS_LICENSE_KEY=YOUR_KEY \
AUTH0_DOMAIN=your-tenant.auth0.com \
AUTH0_CLIENT_ID=YOUR_CLIENT_ID \
pnpm run deploy
```

The package/deploy scripts pin the production stage to `prod`; AWS region is set in [`serverless.yml`](./serverless.yml) (`ap-southeast-4`).

### Deployment/Infrastructure

Refer to the [/infrastructure](./infrastructure) directory.
