import jwt from 'jsonwebtoken';

import db from './db';

const createResponse = (statusCode, body) => (
  {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS
    },
    body: JSON.stringify(body),
  }
);

export const authorize = (event, context, callback) => {
  console.log('authorize', JSON.stringify(event));

  let error = null;
  let policy = null;

  const authHeader = event.authorizationToken ? event.authorizationToken.split(' ') : [];

  if (authHeader.length === 2 && authHeader[0].toLowerCase() === 'bearer') {
    try {
      const decoded = jwt.verify(authHeader[1], process.env.AUTH0_CLIENT_SECRET);

      policy = {
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
    } catch (err) {
      error = 'Unauthorized';
    }
  } else {
    error = 'Unauthorized';
  }

  callback(error, policy);
};

export async function getItems(event, context, callback) {
  console.log('getItems', JSON.stringify(event));

  try {
    const items = await db.getItems(event.requestContext.authorizer.principalId);

    return callback(null, createResponse(200, items));
  } catch (err) {
    return callback(
      null,
      createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }),
    );
  }
}

export async function getItem(event, context, callback) {
  console.log('getItem', JSON.stringify(event));

  try {
    const item = await db.getItemById(event.requestContext.authorizer.principalId, event.pathParameters.id);

    return callback(null, createResponse(200, item));
  } catch (err) {
    return callback(
      null,
      createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }),
    );
  }
}

export async function createItem(event, context, callback) {
  console.log('createItem', JSON.stringify(event));

  try {
    const item = await db.createItem(event.requestContext.authorizer.principalId, JSON.parse(event.body).name);

    return callback(null, createResponse(201, item));
  } catch (err) {
    return callback(
      null,
      createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }),
    );
  }
}

export async function updateItem(event, context, callback) {
  console.log('updateItem', JSON.stringify(event));

  try {
    await db.updateItem(
      event.requestContext.authorizer.principalId,
      event.pathParameters.id,
      JSON.parse(event.body).name,
    );

    return callback(null, createResponse(200));
  } catch (err) {
    return callback(
      null,
      createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }),
    );
  }
}

export async function deleteItem(event, context, callback) {
  console.log('deleteItem', JSON.stringify(event));

  try {
    await db.deleteItem(event.requestContext.authorizer.principalId, event.pathParameters.id);

    return callback(null, createResponse(200));
  } catch (err) {
    return callback(
      null,
      createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }),
    );
  }
}
