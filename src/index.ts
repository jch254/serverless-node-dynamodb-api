import {
  AuthResponse,
  APIGatewayEvent,
  Callback,
  Context,
  CustomAuthorizerEvent,
} from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import {
  createItem,
  deleteItem,
  getItems,
  getItemById,
  updateItem,
} from './database';

const jwks = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

const getSigningKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
  if (!header.kid) {
    callback(new Error('Missing kid in token header'));
    return;
  }
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      callback(err ?? new Error('Signing key not found'));
      return;
    }
    callback(null, key.getPublicKey());
  });
};
import Response from './Response';
import ResponseError from './ResponseError';

export async function pingHandler(event: APIGatewayEvent, context: Context) {
  console.log('pingHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    return new Response({ statusCode: 200, body: { message: 'Chur' } });
  } catch (err: any) {
    console.log(err);

    throw new ResponseError({ message: err.message });
  }
}

export const authorizer = (
  event: CustomAuthorizerEvent,
  context: Context,
  callback: Callback
) => {
  console.log('authorizer');

  const authHeader = event.authorizationToken?.split(' ') || [];

  if (authHeader.length !== 2 || authHeader[0].toLowerCase() !== 'bearer') {
    callback('Unauthorized', undefined);
    return;
  }

  jwt.verify(
    authHeader[1],
    getSigningKey,
    {
      algorithms: ['RS256'],
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      audience: process.env.AUTH0_CLIENT_ID,
    },
    (err, decoded) => {
      if (err || !decoded || typeof decoded === 'string' || !decoded.sub) {
        console.log('Token verification failed', err);
        callback('Unauthorized', undefined);
        return;
      }

      const authResponse: AuthResponse = {
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Resource: [event.methodArn],
              Effect: 'Allow',
            },
          ],
        },
        principalId: decoded.sub,
      };

      callback(undefined, authResponse);
    }
  );
};

// GET /items
export async function getAllItemsHandler(
  event: APIGatewayEvent,
  context: Context
) {
  console.log('getAllItemsHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    const items = await getItems(event.requestContext.authorizer?.principalId);

    return new Response({ statusCode: 200, body: { items } });
  } catch (err: any) {
    console.log(err);

    throw new ResponseError({ message: err.message });
  }
}

// GET /items/{id}
export async function getItemHandler(event: APIGatewayEvent, context: Context) {
  console.log('getItemHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    const item = await getItemById(
      event.requestContext.authorizer?.principalId,
      event.pathParameters?.id || ''
    );

    return new Response({ statusCode: 200, body: item });
  } catch (err: any) {
    console.log(err);

    throw err instanceof ResponseError
      ? err
      : new ResponseError({ message: err.message });
  }
}

// POST /items
export async function createItemHandler(
  event: APIGatewayEvent,
  context: Context
) {
  console.log('createItemHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    const item = await createItem(
      event.requestContext.authorizer?.principalId,
      JSON.parse(event.body as string).name
    );

    return new Response({ statusCode: 201, body: item });
  } catch (err: any) {
    console.log(err);

    throw new ResponseError({ message: err.message });
  }
}

// PATCH /items/{id}
export async function updateItemHandler(
  event: APIGatewayEvent,
  context: Context
) {
  console.log('updateItemHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    await updateItem(
      event.requestContext.authorizer?.principalId,
      event.pathParameters?.id || '',
      JSON.parse(event.body as string).name
    );

    return new Response({ statusCode: 200 });
  } catch (err: any) {
    console.log(err);

    throw err instanceof ResponseError
      ? err
      : new ResponseError({ message: err.message });
  }
}

// DELETE /items/{id}
export async function deleteItemHandler(
  event: APIGatewayEvent,
  context: Context
) {
  console.log('deleteItemHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    await deleteItem(
      event.requestContext.authorizer?.principalId,
      event.pathParameters?.id || ''
    );

    return new Response({ statusCode: 200 });
  } catch (err: any) {
    console.log(err);

    throw err instanceof ResponseError
      ? err
      : new ResponseError({ message: err.message });
  }
}
