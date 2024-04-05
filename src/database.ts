import { DynamoDB } from 'aws-sdk';
import moment from 'moment';
import { v4 } from 'uuid';
import Item from './Item';
import ResponseError from './ResponseError';

const db = process.env.IS_OFFLINE
  ? new DynamoDB.DocumentClient({
      region: 'localhost',
      accessKeyId: 'MOCK_ACCESS_KEY_ID',
      secretAccessKey: 'MOCK_SECRET_ACCESS_KEY',
      endpoint: `http://${process.env.DYNAMODB_HOST || 'localhost'}:${
        process.env.DYNAMODB_PORT || 8000
      }`,
    })
  : new DynamoDB.DocumentClient();

export async function getItems(userId: string): Promise<Item[]> {
  const params = {
    TableName: 'items',
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  const data = await db.query(params).promise();

  return data.Items as Item[];
}

export async function getItemById(
  userId: string,
  itemId: string
): Promise<Item> {
  const params = {
    TableName: 'items',
    Key: {
      id: itemId,
      userId,
    },
  };

  const data = await db.get(params).promise();

  if (data.Item === undefined) {
    throw new ResponseError({
      statusCode: 404,
      message: `An item could not be found with id: ${itemId}`,
    });
  }

  return data.Item as Item;
}

export async function createItem(userId: string, name: string): Promise<Item> {
  const params = {
    TableName: 'items',
    ConditionExpression:
      'attribute_not_exists(id) AND attribute_not_exists(userId)',
    Item: {
      id: v4(),
      userId,
      name,
      createdUtc: moment().utc().toISOString(),
    },
  };

  await db.put(params).promise();

  return params.Item;
}

export async function updateItem(
  userId: string,
  itemId: string,
  name: string
): Promise<void> {
  try {
    const params = {
      TableName: 'items',
      ReturnValues: 'NONE',
      ConditionExpression: 'attribute_exists(id) AND attribute_exists(userId)',
      UpdateExpression: 'SET #name = :name',
      Key: {
        id: itemId,
        userId,
      },
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': name,
      },
    };

    await db.update(params).promise();
  } catch (err: any) {
    if (err.code === 'ConditionalCheckFailedException') {
      throw new ResponseError({
        statusCode: 404,
        message: `An item could not be found with id: ${itemId}`,
      });
    }

    throw err;
  }
}

export async function deleteItem(
  userId: string,
  itemId: string
): Promise<void> {
  try {
    const params = {
      TableName: 'items',
      ConditionExpression: 'attribute_exists(id) AND attribute_exists(userId)',
      Key: {
        id: itemId,
        userId,
      },
    };

    await db.delete(params).promise();
  } catch (err: any) {
    if (err.code === 'ConditionalCheckFailedException') {
      throw new ResponseError({
        statusCode: 404,
        message: `An item could not be found with id: ${itemId}`,
      });
    }

    throw err;
  }
}
