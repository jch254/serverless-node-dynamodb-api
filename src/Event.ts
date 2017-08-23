import { APIGatewayEvent } from 'aws-lambda';

interface Event extends APIGatewayEvent {
  requestContext: {
    accountId: string;
    apiId: string;
    authorizer: {
      principalId: string;
    },
    httpMethod: string;
    identity: {
      accessKey: string | null;
      accountId: string | null;
      apiKey: string | null;
      caller: string | null;
      cognitoAuthenticationProvider: string | null;
      cognitoAuthenticationType: string | null;
      cognitoIdentityId: string | null;
      cognitoIdentityPoolId: string | null;
      sourceIp: string;
      user: string | null;
      userAgent: string | null;
      userArn: string | null;
    },
    stage: string;
    requestId: string;
    resourceId: string;
    resourcePath: string;
  };
}

export default Event;
