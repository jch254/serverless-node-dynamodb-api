import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import moment from 'moment';
import { v4 } from 'uuid';
import Item from './Item';
import ResponseError from './ResponseError';

const dbClient = process.env.IS_OFFLINE
  ? new DynamoDBClient({
      region: 'localhost',
      credentials: {
        accessKeyId: 'MOCK_ACCESS_KEY_ID',
        secretAccessKey: 'MOCK_SECRET_ACCESS_KEY',
      },
      endpoint: `http://${process.env.DYNAMODB_HOST || 'localhost'}:${
        process.env.DYNAMODB_PORT || 8000
      }`,
    })
  : new DynamoDBClient({});

const db = DynamoDBDocumentClient.from(dbClient);

export async function getItems(userId: string): Promise<Item[]> {
  const params = {
    TableName: 'items',
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  const data = await db.send(new QueryCommand(params));

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

  const data = await db.send(new GetCommand(params));

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

  await db.send(new PutCommand(params));

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
      ReturnValues: 'NONE' as const,
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

    await db.send(new UpdateCommand(params));
  } catch (err: any) {
    if (err.name === 'ConditionalCheckFailedException') {
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

    await db.send(new DeleteCommand(params));
  } catch (err: any) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new ResponseError({
        statusCode: 404,
        message: `An item could not be found with id: ${itemId}`,
      });
    }

    throw err;
  }
}
