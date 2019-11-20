import { AuthResponse, AuthResponseContext, APIGatewayEvent, Callback, Context, CustomAuthorizerEvent } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { createItem, deleteItem, getItems, getItemById, updateItem } from './database';
import Response from './Response';

export async function pingHandler(event: APIGatewayEvent, context: Context, callback: Callback) {
  console.log('pingHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    return callback(undefined, new Response({ statusCode: 200, body: { message: 'Chur' } }));
  } catch (err) {
    console.log(err);

    return callback(
      undefined,
      new Response({ statusCode: err.responseStatusCode || 500, body: { message: err.message || 'Internal server error' } }),
    );
  }
}

export const authorizer = (event: CustomAuthorizerEvent, context: Context, callback: Callback) => {
  console.log('authorizer');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    const authHeader = event.authorizationToken ? event.authorizationToken.split(' ') : [];

    if (authHeader.length === 2 && authHeader[0].toLowerCase() === 'bearer') {
      const decoded = jwt.verify(authHeader[1], process.env.AUTH0_CLIENT_SECRET as string) as { sub: string };

      const authResponse: AuthResponse = {
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Resource: [
                event.methodArn,
              ],
              Effect: 'Allow',
            },
          ],
        },
        principalId: decoded.sub,
      };

      callback(undefined, authResponse);
    } else {
      callback('Unauthorized', undefined);
    }
  } catch (err) {
    console.log(err);
    callback('Unauthorized', undefined);
  }
};

// GET /items
export async function getAllItemsHandler(event: APIGatewayEvent, context: Context, callback: Callback) {
  console.log('getAllItemsHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    const items = await getItems((event.requestContext.authorizer as AuthResponseContext).principalId);

    return callback(undefined, new Response({ statusCode: 200, body: { items } }));
  } catch (err) {
    console.log(err);

    return callback(
      undefined,
      new Response({ statusCode: err.responseStatusCode || 500, body: { message: err.message || 'Internal server error' } }),
    );
  }
}

// GET /items/{id}
export async function getItemHandler(event: APIGatewayEvent, context: Context, callback: Callback) {
  console.log('getItemHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    const item = await getItemById(
      (event.requestContext.authorizer as AuthResponseContext).principalId,
      event.pathParameters !== null ? event.pathParameters.id : '',
    );

    return callback(undefined, new Response({ statusCode: 200, body: item }));
  } catch (err) {
    return callback(
      undefined,
      new Response({ statusCode: err.responseStatusCode || 500, body: { message: err.message || 'Internal server error' } }),
    );
  }
}

// POST /items
export async function createItemHandler(event: APIGatewayEvent, context: Context, callback: Callback) {
  console.log('createItemHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    const item = await createItem((event.requestContext.authorizer as AuthResponseContext).principalId, JSON.parse(event.body as string).name);

    return callback(undefined, new Response({ statusCode: 201, body: item }));
  } catch (err) {
    console.log(err);

    return callback(
      undefined,
      new Response({ statusCode: err.responseStatusCode || 500, body: { message: err.message || 'Internal server error' } }),
    );
  }
}

// PATCH /items/{id}
export async function updateItemHandler(event: APIGatewayEvent, context: Context, callback: Callback) {
  console.log('updateItemHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    await updateItem(
      (event.requestContext.authorizer as AuthResponseContext).principalId,
      event.pathParameters !== null ? event.pathParameters.id : '',
      JSON.parse(event.body as string).name,
    );

    return callback(undefined, new Response({ statusCode: 200 }));
  } catch (err) {
    console.log(err);

    return callback(
      undefined,
      new Response({ statusCode: err.responseStatusCode || 500, body: { message: err.message || 'Internal server error' } }),
    );
  }
}

// DELETE /items/{id}
export async function deleteItemHandler(event: APIGatewayEvent, context: Context, callback: Callback) {
  console.log('deleteItemHandler');
  console.log('event', JSON.stringify(event));
  console.log('context', JSON.stringify(context));

  try {
    await deleteItem((event.requestContext.authorizer as AuthResponseContext).principalId, event.pathParameters !== null ? event.pathParameters.id : '');

    return callback(undefined, new Response({ statusCode: 200 }));
  } catch (err) {
    console.log(err);

    return callback(
      undefined,
      new Response({ statusCode: err.responseStatusCode || 500, body: { message: err.message || 'Internal server error' } }),
    );
  }
}
